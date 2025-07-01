'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IncomeWithDetails, CreateIncomeData, UpdateIncomeData } from '@/types/income'
import { IncomeService } from '../supabase/incomes'

interface IncomeContextType {
    incomes: IncomeWithDetails[]
    loading: boolean
    error: string | null
    createIncome: (data: CreateIncomeData) => Promise<void>
    updateIncome: (id: string, data: UpdateIncomeData) => Promise<void>
    deleteIncome: (id: string) => Promise<void>
    refreshIncomes: () => Promise<void>
    getIncomeStats: (startDate?: string, endDate?: string) => Promise<any>
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined)

export function IncomeProvider({ children }: { children: ReactNode }) {
    const [incomes, setIncomes] = useState<IncomeWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [incomeService, setIncomeService] = useState<IncomeService | null>(null)

    const supabase = createClient()

    // Initialize IncomeService with userId
    useEffect(() => {
        const initializeService = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setIncomeService(new IncomeService(user.id))
                }
            } catch (err) {
                console.error('Error initializing IncomeService:', err)
            }
        }
        initializeService()
    }, [supabase.auth])

    const fetchIncomes = async () => {
        if (!incomeService) return

        try {
            setLoading(true)
            setError(null)
            const data = await incomeService.getAll()
            setIncomes(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar ingresos')
        } finally {
            setLoading(false)
        }
    }

    const createIncome = async (data: CreateIncomeData) => {
        if (!incomeService) throw new Error('IncomeService not initialized')

        try {
            const newIncome = await incomeService.create(data)
            setIncomes(prev => [newIncome, ...prev])
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear ingreso')
        }
    }

    const updateIncome = async (id: string, data: UpdateIncomeData) => {
        if (!incomeService) throw new Error('IncomeService not initialized')

        try {
            const updatedIncome = await incomeService.update(id, data)
            setIncomes(prev => prev.map(inc => inc.id === id ? updatedIncome : inc))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar ingreso')
        }
    }

    const deleteIncome = async (id: string) => {
        if (!incomeService) throw new Error('IncomeService not initialized')

        try {
            await incomeService.delete(id)
            setIncomes(prev => prev.filter(inc => inc.id !== id))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar ingreso')
        }
    }

    const getIncomeStats = async (startDate?: string, endDate?: string) => {
        if (!incomeService) throw new Error('IncomeService not initialized')
        if (startDate && endDate) {
            return await incomeService.getStats(startDate, endDate)
        }
        return await incomeService.getStats()
    }

    useEffect(() => {
        if (incomeService) {
            fetchIncomes()
        }
    }, [incomeService])

    return (
        <IncomeContext.Provider value={{
            incomes,
            loading,
            error,
            createIncome,
            updateIncome,
            deleteIncome,
            refreshIncomes: fetchIncomes,
            getIncomeStats
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