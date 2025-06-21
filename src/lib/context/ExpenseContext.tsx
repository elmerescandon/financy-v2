'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ExpenseService } from '@/lib/supabase/expenses'
import type { ExpenseWithDetails, CreateExpenseData, UpdateExpenseData } from '@/types/expense'
import { createClient } from '../supabase/client'
import { CURRENCY } from '../constants'

interface ExpenseContextType {
    expenses: ExpenseWithDetails[]
    loading: boolean
    error: string | null
    limit: number
    offset: number
    createExpense: (data: CreateExpenseData) => Promise<void>
    updateExpense: (id: string, data: UpdateExpenseData) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    refreshExpenses: () => Promise<void>
    setLimit: (limit: number) => void
    setOffset: (offset: number) => void
    loadMore: () => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [limit, setLimit] = useState(50)
    const [offset, setOffset] = useState(0)

    const supabase = createClient()

    const fetchExpenses = async () => {
        try {
            setLoading(true)
            setError(null)
            console.log('fetching expenses')
            const data = await ExpenseService.getAll(limit, offset)
            console.log('data', data)
            setExpenses(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar gastos')
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async () => {
        try {
            setError(null)
            const newOffset = offset + limit
            const data = await ExpenseService.getAll(limit, newOffset)
            setExpenses(prev => [...prev, ...data])
            setOffset(newOffset)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar más gastos')
        }
    }

    const createExpense = async (data: CreateExpenseData) => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')
            const newExpense = await ExpenseService.create({ ...data, user_id: user.id, currency: CURRENCY, type: 'expense', source: 'manual' })
            setExpenses(prev => [newExpense, ...prev])
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
            setExpenses(prev => prev.filter(exp => exp.id !== id))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar gasto')
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [limit, offset])

    return (
        <ExpenseContext.Provider value={{
            expenses,
            loading,
            error,
            limit,
            offset,
            createExpense,
            updateExpense,
            deleteExpense,
            refreshExpenses: fetchExpenses,
            setLimit,
            setOffset,
            loadMore
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