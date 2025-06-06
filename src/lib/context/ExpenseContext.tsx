'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapPaymentMethodToDb } from '@/lib/paymentMethods'
import type { ExpenseWithDetails } from '@/types/expense'

interface ExpenseData {
    amount: number
    description: string
    date: string
    category_id: string
    subcategory_id?: string | null
    merchant?: string | null
    payment_method: string
    tags?: string[]
}

interface ExpenseContextType {
    expenses: ExpenseWithDetails[]
    loading: boolean
    error: string | null
    createExpense: (data: ExpenseData) => Promise<void>
    updateExpense: (id: string, data: Partial<ExpenseData>) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    refreshExpenses: () => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchExpenses = async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('expenses')
                .select(`
          *,
          category:categories(id, name, color, icon),
          subcategory:subcategories(id, name, category_id)
        `)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            setExpenses(data as ExpenseWithDetails[])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar gastos')
        } finally {
            setLoading(false)
        }
    }

    const createExpense = async (data: ExpenseData) => {
        try {
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            const expenseData = {
                ...data,
                payment_method: mapPaymentMethodToDb(data.payment_method),
                user_id: user.id, // Add the user_id for RLS
                source: 'manual'
            }
            console.log(expenseData)
            const { data: newExpense, error: createError } = await supabase
                .from('expenses')
                .insert(expenseData)
                .select(`
          *,
          category:categories(id, name, color, icon),
          subcategory:subcategories(id, name, category_id)
        `)
                .single()

            if (createError) throw createError
            setExpenses(prev => [newExpense as ExpenseWithDetails, ...prev])
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear gasto')
        }
    }

    const updateExpense = async (id: string, data: Partial<ExpenseData>) => {
        try {
            const updateData = {
                ...data,
                ...(data.payment_method && {
                    payment_method: mapPaymentMethodToDb(data.payment_method)
                })
            }

            const { data: updatedExpense, error: updateError } = await supabase
                .from('expenses')
                .update(updateData)
                .eq('id', id)
                .select(`
          *,
          category:categories(id, name, color, icon),
          subcategory:subcategories(id, name, category_id)
        `)
                .single()

            if (updateError) throw updateError
            setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense as ExpenseWithDetails : exp))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar gasto')
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            setExpenses(prev => prev.filter(exp => exp.id !== id))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar gasto')
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [])

    return (
        <ExpenseContext.Provider value={{
            expenses,
            loading,
            error,
            createExpense,
            updateExpense,
            deleteExpense,
            refreshExpenses: fetchExpenses
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