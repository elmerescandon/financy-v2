'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IncomeWithDetails, CreateIncomeData, UpdateIncomeData } from '@/types/income'

interface IncomeContextType {
    incomes: IncomeWithDetails[]
    loading: boolean
    error: string | null
    createIncome: (data: CreateIncomeData) => Promise<void>
    updateIncome: (id: string, data: UpdateIncomeData) => Promise<void>
    deleteIncome: (id: string) => Promise<void>
    refreshIncomes: () => Promise<void>
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined)

export function IncomeProvider({ children }: { children: ReactNode }) {
    const [incomes, setIncomes] = useState<IncomeWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchIncomes = async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('expenses')
                .select(`
                    *,
                    category:categories(id, name, color, icon)
                `)
                .eq('type', 'income')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Map expense data to income format
            const mappedIncomes = data?.map(mapToIncomeWithDetails) || []
            setIncomes(mappedIncomes)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar ingresos')
        } finally {
            setLoading(false)
        }
    }

    const createIncome = async (data: CreateIncomeData) => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            // Extract income-specific fields that need mapping
            const { employer_client, is_recurring, is_taxable, recurring_end_date, source, ...baseData } = data

            const incomeData = {
                ...baseData,
                date: new Date(data.date).toISOString(),
                user_id: user.id,
                type: 'income',
                // Map income-specific fields to expense table columns
                merchant: employer_client,
                recurring: is_recurring || false,
                recurring_frequency: data.recurring_frequency,
                source: 'manual', // ExpenseSource type
                source_metadata: {
                    income_source: source,
                    is_taxable: is_taxable || false,
                    recurring_end_date: recurring_end_date
                },
                confidence_score: 1.0,
                needs_review: false
            }

            const { data: newIncome, error: createError } = await supabase
                .from('expenses')
                .insert(incomeData)
                .select(`
                    *,
                    category:categories(id, name, color, icon)
                `)
                .single()

            if (createError) throw createError
            setIncomes(prev => [mapToIncomeWithDetails(newIncome), ...prev])
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear ingreso')
        }
    }

    const updateIncome = async (id: string, data: UpdateIncomeData) => {
        try {
            // Extract income-specific fields that need mapping
            const { employer_client, is_recurring, is_taxable, recurring_end_date, source, ...baseUpdates } = data

            const updateData = {
                ...baseUpdates,
                // Map income-specific fields to expense table columns
                merchant: employer_client,
                recurring: is_recurring,
                recurring_frequency: data.recurring_frequency,
                source_metadata: {
                    income_source: source,
                    is_taxable: is_taxable,
                    recurring_end_date: recurring_end_date
                }
            }

            const { data: updatedIncome, error: updateError } = await supabase
                .from('expenses')
                .update(updateData)
                .eq('id', id)
                .eq('type', 'income')
                .select(`
                    *,
                    category:categories(id, name, color, icon)
                `)
                .single()

            if (updateError) throw updateError
            setIncomes(prev => prev.map(inc => inc.id === id ? mapToIncomeWithDetails(updatedIncome) : inc))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar ingreso')
        }
    }

    const deleteIncome = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)
                .eq('type', 'income')

            if (deleteError) throw deleteError
            setIncomes(prev => prev.filter(inc => inc.id !== id))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar ingreso')
        }
    }

    // Helper method to map expense data to income format
    const mapToIncomeWithDetails = (data: any): IncomeWithDetails => {
        return {
            id: data.id,
            user_id: data.user_id,
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            date: data.date,
            source: data.source_metadata?.income_source || 'other',
            employer_client: data.merchant,
            category_id: data.category_id,
            notes: data.notes,
            is_recurring: data.recurring || false,
            recurring_frequency: data.recurring_frequency,
            recurring_end_date: data.source_metadata?.recurring_end_date,
            is_taxable: data.source_metadata?.is_taxable || false,
            tags: data.tags || [],
            confidence_score: data.confidence_score,
            needs_review: data.needs_review,
            transaction_hash: data.transaction_hash,
            created_at: data.created_at,
            updated_at: data.updated_at,
            category: data.category
        }
    }

    useEffect(() => {
        fetchIncomes()
    }, [])

    return (
        <IncomeContext.Provider value={{
            incomes,
            loading,
            error,
            createIncome,
            updateIncome,
            deleteIncome,
            refreshIncomes: fetchIncomes
        }}>
            {children}
        </IncomeContext.Provider>
    )
}

export function useIncomeContext() {
    const context = useContext(IncomeContext)
    if (context === undefined) {
        throw new Error('useIncomeContext must be used within an IncomeProvider')
    }
    return context
} 