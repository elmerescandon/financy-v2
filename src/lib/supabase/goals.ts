import { createClient } from './client'
import type {
    Goal,
    GoalEntry,
    GoalInsight,
    GoalProgress,
    GoalStats,
    CreateGoalData,
    CreateGoalEntryData
} from '@/types/goal'

const supabase = createClient()

// Helper function to calculate goal progress
function calculateProgress(goal: Goal, targetDate: string): GoalProgress {
    const percentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
    const remaining_amount = Math.max(0, goal.target_amount - goal.current_amount)

    const today = new Date()
    const target = new Date(targetDate)
    const days_remaining = target > today ? Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null

    let daily_target: number | null = null
    let monthly_target: number | null = null

    if (days_remaining && days_remaining > 0 && remaining_amount > 0) {
        daily_target = remaining_amount / days_remaining
        monthly_target = (remaining_amount / days_remaining) * 30
    }

    // Determine status
    let status: GoalProgress['status'] = 'not_started'
    if (percentage >= 100) {
        status = 'achieved'
    } else if (percentage > 0) {
        if (days_remaining !== null && days_remaining < 0) {
            status = 'overdue'
        } else {
            status = 'in_progress'
        }
    } else if (days_remaining !== null && days_remaining < 0) {
        status = 'overdue'
    }

    // Determine if on track (simplified logic)
    const on_track = percentage >= 100 || (days_remaining !== null && days_remaining > 0 && daily_target !== null && daily_target <= remaining_amount / Math.max(days_remaining, 1))

    return {
        percentage: Math.min(percentage, 100),
        remaining_amount,
        days_remaining,
        daily_target,
        monthly_target,
        on_track,
        status
    }
}

export class GoalService {
    static async getGoals(): Promise<GoalInsight[]> {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('User not authenticated')

        const { data: goals, error } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        if (!goals) return []

        // Get goal entries and calculate current amounts
        const goalsWithProgress = await Promise.all(
            goals.map(async (goal: any) => {
                // Get entries for this goal
                const { data: entries } = await supabase
                    .from('goal_entries')
                    .select('*')
                    .eq('goal_id', goal.id)
                    .order('date', { ascending: false })

                const allEntries = entries || []
                const current_amount = allEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0)

                // Update goal with calculated current amount
                const updatedGoal: Goal = {
                    ...goal,
                    current_amount
                }

                const progress = calculateProgress(updatedGoal, goal.target_date)
                const recent_entries = allEntries.slice(0, 5) // Last 5 entries

                return {
                    ...updatedGoal,
                    progress,
                    recent_entries
                } as GoalInsight
            })
        )

        return goalsWithProgress
    }

    static async getGoal(id: string): Promise<GoalInsight | null> {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('User not authenticated')

        const { data: goal, error } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) throw error
        if (!goal) return null

        // Get entries for this goal
        const { data: entries } = await supabase
            .from('goal_entries')
            .select('*')
            .eq('goal_id', goal.id)
            .order('date', { ascending: false })

        const allEntries = entries || []
        const current_amount = allEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0)

        const updatedGoal: Goal = {
            ...goal,
            current_amount
        }

        const progress = calculateProgress(updatedGoal, goal.target_date)
        const recent_entries = allEntries.slice(0, 10)

        return {
            ...updatedGoal,
            progress,
            recent_entries
        }
    }

    static async createGoal(data: CreateGoalData): Promise<Goal> {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('User not authenticated')
        const { data: goal, error } = await supabase
            .from('savings_goals')
            .insert({
                ...data,
                user_id: user.id,
                current_amount: 0
            })
            .select()
            .single()

        return {} as Goal
    }

    static async updateGoal(id: string, data: Partial<CreateGoalData>): Promise<Goal> {
        const { data: goal, error } = await supabase
            .from('savings_goals')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return goal
    }

    static async deleteGoal(id: string): Promise<void> {
        const { error } = await supabase
            .from('savings_goals')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Goal Entries
    static async createGoalEntry(data: CreateGoalEntryData): Promise<GoalEntry> {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('User not authenticated')

        const { data: entry, error } = await supabase
            .from('goal_entries')
            .insert({
                ...data,
                user_id: user.id,
                date: data.date || new Date().toISOString().split('T')[0]
            })
            .select()
            .single()

        if (error) throw error
        return entry
    }

    static async getGoalEntries(goalId: string): Promise<GoalEntry[]> {
        const { data: entries, error } = await supabase
            .from('goal_entries')
            .select('*')
            .eq('goal_id', goalId)
            .order('date', { ascending: false })

        if (error) throw error
        return entries || []
    }

    static async deleteGoalEntry(id: string): Promise<void> {
        const { error } = await supabase
            .from('goal_entries')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    static async getGoalStats(): Promise<GoalStats> {
        const goals = await this.getGoals()

        const total_goals = goals.length
        const achieved_goals = goals.filter(g => g.progress.status === 'achieved').length
        const in_progress_goals = goals.filter(g => g.progress.status === 'in_progress').length
        const overdue_goals = goals.filter(g => g.progress.status === 'overdue').length
        const total_saved = goals.reduce((sum, g) => sum + g.current_amount, 0)
        const total_target = goals.reduce((sum, g) => sum + g.target_amount, 0)

        return {
            total_goals,
            achieved_goals,
            in_progress_goals,
            overdue_goals,
            total_saved,
            total_target
        }
    }
} 