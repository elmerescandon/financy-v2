'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { ExpenseService } from '@/lib/supabase/expenses'
import type { ExpenseWithDetails, CreateExpenseData, UpdateExpenseData } from '@/types/expense'
import { createClient } from '../supabase/client'
import { CURRENCY } from '../constants'
import { initializeThisMonth } from '@/components/expense-table/ExpenseFilters'

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
    totalExpense: number | null
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
    const [totalExpense, setTotalExpense] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationResult | null>(null)
    const [filters, setFilters] = useState<SimpleFilters>(initializeThisMonth())
    const [page, setPageState] = useState(1)
    const [pageSize, setPageSizeState] = useState(20)
    const [expenseService, setExpenseService] = useState<ExpenseService | null>(null)

    const supabase = createClient()

    // Initialize ExpenseService with userId
    useEffect(() => {
        const initializeService = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setExpenseService(new ExpenseService(user.id))
                }
            } catch (err) {
                console.error('Error initializing ExpenseService:', err)
            }
        }
        initializeService()
    }, [supabase.auth])

    const fetchExpenses = useCallback(async () => {
        if (!expenseService) return

        try {
            setLoading(true)
            setError(null)
            const result = await expenseService.getFilteredWithPagination(filters, page, pageSize)
            console.log("Result", result)
            setExpenses(result.data)
            setPagination(result.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar gastos')
        } finally {
            setLoading(false)
        }
    }, [expenseService, filters, page, pageSize])

    const fetchAllFilteredExpenses = useCallback(async () => {
        if (!expenseService) return

        try {
            setLoading(true)
            setError(null)
            const totalExpense = await expenseService.getTotalExpense(filters)
            console.log("Filters from Total Expense:",filters)
            console.log(totalExpense)
            setTotalExpense(totalExpense) 
        } catch (err) {
            console.error('Error fetching all filtered expenses:', err)
            setTotalExpense(null)
        }
    }, [expenseService, filters])

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
        if (!expenseService) throw new Error('ExpenseService not initialized')

        try {
            await expenseService.create({ ...data, currency: CURRENCY, type: 'expense', source: 'manual' })
            await Promise.all([fetchExpenses(), fetchAllFilteredExpenses()])
            // await fetchExpenses()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear gasto')
        }
    }

    const updateExpense = async (id: string, data: UpdateExpenseData) => {
        if (!expenseService) throw new Error('ExpenseService not initialized')

        try {
            const updatedExpense = await expenseService.update(id, data)
            setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar gasto')
        }
    }

    const deleteExpense = async (id: string) => {
        if (!expenseService) throw new Error('ExpenseService not initialized')

        try {
            await expenseService.delete(id)
            await fetchExpenses()
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar gasto')
        }
    }

    const refreshExpenses = async () => {
        await Promise.all([fetchExpenses(), fetchAllFilteredExpenses()])
        // await fetchExpenses()
    }

    useEffect(() => {
        if (expenseService) {
            // updateExpenses()
            Promise.all([fetchExpenses(), fetchAllFilteredExpenses()])
            // await fetchExpenses()
        }
    }, [fetchExpenses, filters, expenseService])

    return (
        <ExpenseContext.Provider value={{
            expenses,
            totalExpense,
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