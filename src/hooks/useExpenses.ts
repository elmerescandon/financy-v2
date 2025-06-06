import { useState, useEffect } from 'react'
import { ExpenseService } from '@/lib/supabase/expenses'
import type { ExpenseWithDetails, CreateExpenseData, UpdateExpenseData } from '@/types/expense'

export function useExpenses(limit = 50, offset = 0) {
    const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchExpenses = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await ExpenseService.getAll(limit, offset)
            setExpenses(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar gastos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [limit, offset])

    const createExpense = async (expense: CreateExpenseData) => {
        try {
            const newExpense = await ExpenseService.create(expense)
            setExpenses(prev => [newExpense, ...prev])
            return newExpense
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear gasto')
        }
    }

    const updateExpense = async (id: string, updates: UpdateExpenseData) => {
        try {
            const updatedExpense = await ExpenseService.update(id, updates)
            setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp))
            return updatedExpense
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

    return {
        expenses,
        loading,
        error,
        refresh: fetchExpenses,
        createExpense,
        updateExpense,
        deleteExpense
    }
}

export function useExpensesByDateRange(startDate: string, endDate: string) {
    const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await ExpenseService.getByDateRange(startDate, endDate)
                setExpenses(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar gastos')
            } finally {
                setLoading(false)
            }
        }

        if (startDate && endDate) {
            fetchExpenses()
        }
    }, [startDate, endDate])

    return { expenses, loading, error }
} 