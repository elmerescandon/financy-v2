'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BudgetService } from '@/lib/supabase/budgets'
import { CategoryService } from '@/lib/supabase/categories'
import type {
    BudgetInsight,
    BudgetWithDetails,
    CreateBudgetData,
    UpdateBudgetData,
    BudgetStats,
    BudgetFilters,
    BudgetAssignmentPreview,
    BudgetAssignmentResult
} from '@/types/budget'
import type { CategoryWithSubcategories } from '@/types/category'
import { createClient } from '../supabase/client'

interface BudgetContextType {
    budgets: BudgetInsight[]
    categories: CategoryWithSubcategories[]
    loading: boolean
    error: string | null
    stats: BudgetStats | null
    createBudget: (data: CreateBudgetData) => Promise<void>
    updateBudget: (id: string, data: UpdateBudgetData) => Promise<void>
    deleteBudget: (id: string) => Promise<void>
    refreshBudgets: () => Promise<void>
    getBudgetById: (id: string) => Promise<BudgetWithDetails>
    getActiveBudgets: () => Promise<BudgetInsight[]>
    getBudgetsByCategory: (categoryId: string) => Promise<BudgetWithDetails[]>
    getBudgetAlerts: () => Promise<Array<{
        type: 'over_budget' | 'near_limit' | 'no_budget'
        category_name: string
        message: string
        severity: 'low' | 'medium' | 'high'
    }>>
    applyFilters: (filters: BudgetFilters) => Promise<void>
    previewAssignment: (categoryId: string, startDate: string, endDate: string) => Promise<BudgetAssignmentPreview>
    getBudgetExpenses: (budgetId: string) => Promise<any[]>
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function BudgetProvider({ children }: { children: ReactNode }) {
    const [budgets, setBudgets] = useState<BudgetInsight[]>([])
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<BudgetStats | null>(null)
    const supabase = createClient()
    const [categoryService, setCategoryService] = useState<CategoryService | null>(null)


    useEffect(() => {
        const initializeServices = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setCategoryService(new CategoryService(user.id))
            }
        }
        initializeServices()
    }, [supabase.auth])

    const fetchBudgets = async (filters?: BudgetFilters) => {
        try {
            setLoading(true)
            setError(null)

            if (!categoryService) return

            const defaultFilters = filters || { is_active: true }

            // Fetch all budgets (no default filter)
            const [budgetData, categoriesData, statsData] = await Promise.all([
                BudgetService.getInsights(defaultFilters),
                categoryService.getAll(),
                BudgetService.getStats()
            ])

            console.log('budgetData', budgetData)
            setBudgets(budgetData)
            setCategories(categoriesData)
            setStats(statsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar presupuestos')
        } finally {
            setLoading(false)
        }
    }

    const createBudget = async (data: CreateBudgetData) => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            const newBudget = await BudgetService.create({ ...data, user_id: user.id })
            // Convert BudgetWithDetails to BudgetInsight for consistency
            const budgetInsight: BudgetInsight = {
                id: newBudget.id,
                user_id: newBudget.user_id,
                category_id: newBudget.category_id,
                budget_amount: newBudget.amount,
                period_start: newBudget.period_start,
                period_end: newBudget.period_end,
                allocation_percentage: newBudget.allocation_percentage || 0,
                rollover_amount: newBudget.rollover_amount,
                category_name: newBudget.category.name,
                category_icon: newBudget.category.icon,
                category_color: newBudget.category.color,
                spent_amount: 0, // New budget, no spending yet
                remaining_amount: newBudget.amount,
                spent_percentage: 0
            }
            setBudgets(prev => [budgetInsight, ...prev])

            // Refresh stats
            const newStats = await BudgetService.getStats()
            setStats(newStats)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear presupuesto')
        }
    }

    const updateBudget = async (id: string, data: UpdateBudgetData) => {
        try {
            await BudgetService.update(id, data)
            // Refresh budgets to get updated insights
            await refreshBudgets()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar presupuesto')
        }
    }

    const deleteBudget = async (id: string) => {
        try {
            await BudgetService.delete(id)
            setBudgets(prev => prev.filter(budget => budget.id !== id))

            // Refresh stats
            const newStats = await BudgetService.getStats()
            setStats(newStats)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar presupuesto')
        }
    }

    const getBudgetById = async (id: string): Promise<BudgetWithDetails> => {
        try {
            return await BudgetService.getById(id)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener presupuesto')
        }
    }

    const getActiveBudgets = async (): Promise<BudgetInsight[]> => {
        try {
            return await BudgetService.getActive()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener presupuestos activos')
        }
    }

    const getBudgetsByCategory = async (categoryId: string): Promise<BudgetWithDetails[]> => {
        try {
            return await BudgetService.getByCategory(categoryId)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener presupuestos por categoría')
        }
    }

    const getBudgetAlerts = async () => {
        try {
            return await BudgetService.getAlerts()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener alertas de presupuesto')
        }
    }

    const applyFilters = async (filters: BudgetFilters) => {
        await fetchBudgets(filters)
    }

    const refreshBudgets = async () => {
        await fetchBudgets()
    }

    const previewAssignment = async (categoryId: string, startDate: string, endDate: string): Promise<BudgetAssignmentPreview> => {
        try {
            return await BudgetService.previewAssignment(categoryId, startDate, endDate)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener vista previa de asignación')
        }
    }

    const getBudgetExpenses = async (budgetId: string) => {
        try {
            return await BudgetService.getBudgetExpenses(budgetId)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener gastos del presupuesto')
        }
    }

    useEffect(() => {
        fetchBudgets()
    }, [categoryService])

    return (
        <BudgetContext.Provider value={{
            budgets,
            categories,
            loading,
            error,
            stats,
            createBudget,
            updateBudget,
            deleteBudget,
            refreshBudgets,
            getBudgetById,
            getActiveBudgets,
            getBudgetsByCategory,
            getBudgetAlerts,
            applyFilters,
            previewAssignment,
            getBudgetExpenses
        }}>
            {children}
        </BudgetContext.Provider>
    )
}

export function useBudgetContext() {
    const context = useContext(BudgetContext)
    if (context === undefined) {
        throw new Error('useBudgetContext must be used within a BudgetProvider')
    }
    return context
} 