import { UserOwnedEntity, Currency, ExpenseSource } from './shared'

// Income frequency types
export type IncomeFrequency =
    | 'one-time'
    | 'weekly'
    | 'bi-weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'

// Income source types
export type IncomeSource =
    | 'salary'
    | 'freelance'
    | 'investment'
    | 'rental'
    | 'business'
    | 'gift'
    | 'refund'
    | 'other'

// Database entity type
export interface Income extends UserOwnedEntity {
    amount: number
    currency: Currency
    description: string
    date: string // ISO date string (YYYY-MM-DD)
    source: IncomeSource
    employer_client: string | null
    category_id: string | null
    notes: string | null
    is_recurring: boolean
    recurring_frequency: IncomeFrequency | null
    recurring_end_date: string | null
    is_taxable: boolean
    tags: string[]
    confidence_score: number
    needs_review: boolean
    transaction_hash: string | null
}

// Form types for creating/updating incomes
export interface CreateIncomeData {
    amount: number
    currency?: Currency
    description: string
    date: string
    source: IncomeSource
    employer_client?: string | null
    category_id?: string | null
    notes?: string | null
    is_recurring?: boolean
    recurring_frequency?: IncomeFrequency | null
    recurring_end_date?: string | null
    is_taxable?: boolean
    tags?: string[]
}

export interface UpdateIncomeData {
    id: string
    amount?: number
    currency?: Currency
    description?: string
    date?: string
    source?: IncomeSource
    employer_client?: string | null
    category_id?: string | null
    notes?: string | null
    is_recurring?: boolean
    recurring_frequency?: IncomeFrequency | null
    recurring_end_date?: string | null
    is_taxable?: boolean
    tags?: string[]
    needs_review?: boolean
}

// Income with category information
export interface IncomeWithDetails extends Income {
    category: {
        id: string
        name: string
        icon: string
        color: string
    } | null
}

// Income list item (optimized for lists)
export interface IncomeListItem {
    id: string
    amount: number
    currency: Currency
    description: string
    date: string
    source: IncomeSource
    employer_client: string | null
    category_name: string | null
    category_icon: string | null
    category_color: string | null
    is_recurring: boolean
    is_taxable: boolean
    needs_review: boolean
    created_at: string
}

// Income statistics
export interface IncomeStats {
    total_amount: number
    income_count: number
    average_income: number
    currency: Currency
    date_range: {
        start: string
        end: string
    }
}

// Monthly income statistics
export interface MonthlyIncomeStats {
    year: number
    month: number
    total_amount: number
    income_count: number
    average_income: number
    currency: Currency
    sources: Array<{
        source: IncomeSource
        total_amount: number
        income_count: number
        percentage: number
    }>
}

// Income filters for queries
export interface IncomeFilters {
    date_from?: string
    date_to?: string
    source?: IncomeSource
    sources?: IncomeSource[]
    category_id?: string
    category_ids?: string[]
    employer_client?: string
    amount_min?: number
    amount_max?: number
    currency?: Currency
    is_recurring?: boolean
    is_taxable?: boolean
    needs_review?: boolean
    tags?: string[]
    description_contains?: string
}

// Income sort options
export type IncomeSortBy =
    | 'date'
    | 'amount'
    | 'description'
    | 'source'
    | 'employer_client'
    | 'created_at'
    | 'updated_at'

export interface IncomeSort {
    field: IncomeSortBy
    direction: 'asc' | 'desc'
}

// Income summary for dashboards
export interface IncomeSummary {
    today: IncomeStats
    this_week: IncomeStats
    this_month: IncomeStats
    this_year: IncomeStats
    recent_incomes: IncomeListItem[]
    top_sources: Array<{
        source: IncomeSource
        total_amount: number
        percentage: number
    }>
    income_trend: Array<{
        date: string
        amount: number
    }>
    recurring_incomes: Array<{
        id: string
        description: string
        amount: number
        frequency: IncomeFrequency
        next_expected_date: string
    }>
} 