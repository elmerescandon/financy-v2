'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { GoalService } from '@/lib/supabase/goals'
import type {
    GoalInsight,
    GoalEntry,
    GoalStats,
    CreateGoalData,
    CreateGoalEntryData
} from '@/types/goal'

interface GoalContextType {
    goals: GoalInsight[]
    loading: boolean
    error: string | null
    stats: GoalStats | null

    // Goal operations
    createGoal: (data: CreateGoalData) => Promise<void>
    updateGoal: (id: string, data: Partial<CreateGoalData>) => Promise<void>
    deleteGoal: (id: string) => Promise<void>
    refreshGoals: () => Promise<void>

    // Goal entry operations
    addGoalEntry: (data: CreateGoalEntryData) => Promise<void>
    getGoalEntries: (goalId: string) => Promise<GoalEntry[]>
    deleteGoalEntry: (id: string) => Promise<void>
}

const GoalContext = createContext<GoalContextType | undefined>(undefined)

export function GoalProvider({ children }: { children: React.ReactNode }) {
    const [goals, setGoals] = useState<GoalInsight[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<GoalStats | null>(null)

    const fetchGoals = async () => {
        try {
            setLoading(true)
            setError(null)
            const [goalsData, statsData] = await Promise.all([
                GoalService.getGoals(),
                GoalService.getGoalStats()
            ])
            setGoals(goalsData)
            setStats(statsData)
        } catch (err) {
            console.error('Error fetching goals:', err)
            setError(err instanceof Error ? err.message : 'Error al cargar metas')
        } finally {
            setLoading(false)
        }
    }

    const createGoal = async (data: CreateGoalData) => {
        try {
            setError(null)
            await GoalService.createGoal(data)
            await fetchGoals() // Refresh the list
        } catch (err) {
            console.error('Error creating goal:', err)
            const errorMessage = err instanceof Error ? err.message : 'Error al crear meta'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const updateGoal = async (id: string, data: Partial<CreateGoalData>) => {
        try {
            setError(null)
            await GoalService.updateGoal(id, data)
            await fetchGoals() // Refresh the list
        } catch (err) {
            console.error('Error updating goal:', err)
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar meta'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const deleteGoal = async (id: string) => {
        try {
            setError(null)
            await GoalService.deleteGoal(id)
            await fetchGoals() // Refresh the list
        } catch (err) {
            console.error('Error deleting goal:', err)
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar meta'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const addGoalEntry = async (data: CreateGoalEntryData) => {
        try {
            setError(null)
            await GoalService.createGoalEntry(data)
            await fetchGoals() // Refresh to update progress
        } catch (err) {
            console.error('Error adding goal entry:', err)
            const errorMessage = err instanceof Error ? err.message : 'Error al agregar entrada'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const getGoalEntries = async (goalId: string): Promise<GoalEntry[]> => {
        try {
            setError(null)
            return await GoalService.getGoalEntries(goalId)
        } catch (err) {
            console.error('Error fetching goal entries:', err)
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar entradas'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const deleteGoalEntry = async (id: string) => {
        try {
            setError(null)
            await GoalService.deleteGoalEntry(id)
            await fetchGoals() // Refresh to update progress
        } catch (err) {
            console.error('Error deleting goal entry:', err)
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar entrada'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const refreshGoals = async () => {
        await fetchGoals()
    }

    useEffect(() => {
        fetchGoals()
    }, [])

    const value: GoalContextType = {
        goals,
        loading,
        error,
        stats,
        createGoal,
        updateGoal,
        deleteGoal,
        refreshGoals,
        addGoalEntry,
        getGoalEntries,
        deleteGoalEntry
    }

    return (
        <GoalContext.Provider value={value}>
            {children}
        </GoalContext.Provider>
    )
}

export function useGoalContext() {
    const context = useContext(GoalContext)
    if (context === undefined) {
        throw new Error('useGoalContext must be used within a GoalProvider')
    }
    return context
} 