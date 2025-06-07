import { UserOwnedEntity, Currency } from './shared'

// Database entity type
export interface Budget extends UserOwnedEntity {
    category_id: string
    amount: number
    period_start: string // ISO date string (YYYY-MM-DD)
    period_end: string   // ISO date string (YYYY-MM-DD)
    rollover_amount: number
    allocation_percentage: number
    priority: number
}

// Form types for creating/updating budgets
export interface CreateBudgetData {
    user_id: string
    category_id: string
    amount: number
    period_start: string
    period_end: string
    rollover_amount?: number
    allocation_percentage?: number
    priority?: number
}

export interface UpdateBudgetData {
    id: string
    category_id?: string
    amount?: number
    period_start?: string
    period_end?: string
    rollover_amount?: number
    allocation_percentage?: number
    priority?: number
}

// Budget with category information
export interface BudgetWithDetails extends Budget {
    category: {
        id: string
        name: string
        icon: string
        color: string
    }
}

// Budget insights from the view
export interface BudgetInsight {
    id: string
    user_id: string
    category_id: string
    budget_amount: number
    period_start: string
    period_end: string
    allocation_percentage: number
    rollover_amount: number
    category_name: string
    category_icon: string
    category_color: string
    spent_amount: number
    remaining_amount: number
    spent_percentage: number
}

// Budget statistics
export interface BudgetStats {
    total_budget: number
    total_spent: number
    total_remaining: number
    budget_count: number
    over_budget_count: number
    currency: Currency
    period: {
        start: string
        end: string
    }
}

// Budget filters for queries
export interface BudgetFilters {
    category_id?: string
    category_ids?: string[]
    period_start?: string
    period_end?: string
    is_active?: boolean
    is_over_budget?: boolean
    priority_min?: number
    priority_max?: number
}

// Budget sort options
export type BudgetSortBy =
    | 'category_name'
    | 'amount'
    | 'spent_amount'
    | 'remaining_amount'
    | 'spent_percentage'
    | 'period_start'
    | 'period_end'
    | 'priority'
    | 'created_at'

export interface BudgetSort {
    field: BudgetSortBy
    direction: 'asc' | 'desc'
}

// Budget period types
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

// Budget creation helper
export interface BudgetPeriodConfig {
    type: BudgetPeriod
    start_date?: string // For custom periods
    end_date?: string   // For custom periods
}

// Budget summary for dashboards
export interface BudgetSummary {
    current_period: BudgetStats
    budgets: BudgetInsight[]
    top_categories: Array<{
        category_id: string
        category_name: string
        category_icon: string
        category_color: string
        budget_amount: number
        spent_amount: number
        spent_percentage: number
    }>
    alerts: Array<{
        type: 'over_budget' | 'near_limit' | 'no_budget'
        category_name: string
        message: string
        severity: 'low' | 'medium' | 'high'
    }>
}

// Validation schema
export interface BudgetValidation {
    amount: {
        required: true
        min: 0.01
        max: 999999999.99
    }
    allocation_percentage: {
        required: false
        min: 0
        max: 100
    }
    priority: {
        required: false
        min: 1
        max: 10
    }
    period: {
        required: true
        min_days: 1
        max_days: 365
    }
} 