export interface Goal {
    id: string
    user_id: string
    name: string
    target_amount: number
    current_amount: number
    target_date: string
    category_id?: string
    budget_id?: string
    created_at: string
    updated_at: string
}

export interface GoalEntry {
    id: string
    goal_id: string
    amount: number
    description?: string
    date: string
    created_at: string
    updated_at: string
}

export interface GoalWithEntries extends Goal {
    entries: GoalEntry[]
}

export interface GoalProgress {
    percentage: number
    remaining_amount: number
    days_remaining: number | null
    daily_target: number | null
    monthly_target: number | null
    on_track: boolean
    status: 'not_started' | 'in_progress' | 'achieved' | 'overdue'
}

export interface GoalInsight extends Goal {
    progress: GoalProgress
    recent_entries: GoalEntry[]
}

export interface CreateGoalData {
    name: string
    target_amount: number
    target_date: string
    category_id?: string
    budget_id?: string
}

export interface CreateGoalEntryData {
    goal_id: string
    amount: number
    description?: string
    date?: string
}

export interface GoalStats {
    total_goals: number
    achieved_goals: number
    in_progress_goals: number
    overdue_goals: number
    total_saved: number
    total_target: number
} 