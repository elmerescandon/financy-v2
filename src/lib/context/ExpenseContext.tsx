'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { ExpenseService } from '@/lib/supabase/expenses'
import type { ExpenseWithDetails, CreateExpenseData, UpdateExpenseData } from '@/types/expense'
import { createClient } from '../supabase/client'
import { CURRENCY } from '../constants'

// Simple pagination result interface
interface PaginationResult {
    page: number
    limit: number
    total: number
    total_pages: number
}

// Simple filter interface - updated to support multiple categories
interface SimpleFilters {
    date_from?: string
    date_to?: string
    category_id?: string
    category_ids?: string[]
}

interface ExpenseContextType {
    expenses: ExpenseWithDetails[]
    allFilteredExpenses: ExpenseWithDetails[]
    loading: boolean
    error: string | null
    pagination: PaginationResult | null
    filters: SimpleFilters
    createExpense: (data: CreateExpenseData) => Promise<void>
    updateExpense: (id: string, data: UpdateExpenseData) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    refreshExpenses: () => Promise<void>
    updateFilters: (newFilters: SimpleFilters) => Promise<void>
    setPage: (page: number) => Promise<void>
    setPageSize: (pageSize: number) => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
    const [allFilteredExpenses, setAllFilteredExpenses] = useState<ExpenseWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationResult | null>(null)
    const [filters, setFilters] = useState<SimpleFilters>({})
    const [page, setPageState] = useState(1)
    const [pageSize, setPageSizeState] = useState(20)

    const supabase = createClient()

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            console.log("ExpenseContext - fetchExpenses called with filters:", filters)
            console.log("ExpenseContext - category_ids in filters:", filters.category_ids)
            const result = await ExpenseService.getFilteredWithPagination(filters, page, pageSize)
            console.log("ExpenseContext - fetchExpenses result:", result)
            setExpenses(result.data)
            setPagination(result.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar gastos')
        } finally {
            setLoading(false)
        }
    }, [filters, page, pageSize])

    const fetchAllFilteredExpenses = useCallback(async () => {
        try {
            const allExpenses = await ExpenseService.getAllFiltered(filters)
            setAllFilteredExpenses(allExpenses)
        } catch (err) {
            console.error('Error fetching all filtered expenses:', err)
        }
    }, [filters])

    const updateFilters = async (newFilters: SimpleFilters) => {
        setPageState(1) // Reset to first page when filters change
        setFilters(newFilters)
    }

    const setPage = async (newPage: number) => {
        setPageState(newPage)
        await fetchExpenses()
    }

    const setPageSize = async (newPageSize: number) => {
        setPageSizeState(newPageSize)
        setPageState(1) // Reset to first page when page size changes
        await fetchExpenses()
    }

    const createExpense = async (data: CreateExpenseData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')
            await ExpenseService.create({ ...data, user_id: user.id, currency: CURRENCY, type: 'expense', source: 'manual' })
            await fetchExpenses()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear gasto')
        }
    }

    const updateExpense = async (id: string, data: UpdateExpenseData) => {
        try {
            const updatedExpense = await ExpenseService.update(id, data)
            setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar gasto')
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            await ExpenseService.delete(id)
            await fetchExpenses()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar gasto')
        }
    }

    const refreshExpenses = async () => {
        await Promise.all([fetchExpenses(), fetchAllFilteredExpenses()])
    }

    useEffect(() => {
        Promise.all([fetchExpenses(), fetchAllFilteredExpenses()])
    }, [fetchExpenses, fetchAllFilteredExpenses, filters])

    return (
        <ExpenseContext.Provider value={{
            expenses,
            allFilteredExpenses,
            loading,
            error,
            pagination,
            filters,
            createExpense,
            updateExpense,
            deleteExpense,
            refreshExpenses,
            updateFilters,
            setPage,
            setPageSize
        }}>
            {children}
        </ExpenseContext.Provider>
    )
}

export function useExpenseContext() {
    const context = useContext(ExpenseContext)
    if (context === undefined) {
        throw new Error('useExpenseContext must be used within an ExpenseProvider')
    }
    return context
} 