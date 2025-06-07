import { UserOwnedEntity, PaymentMethod, ExpenseSource, Currency } from './shared'

// Database entity type
export interface Expense extends UserOwnedEntity {
    amount: number
    currency: Currency
    description: string
    date: string // ISO date string (YYYY-MM-DD)
    category_id: string | null
    subcategory_id: string | null
    budget_id: string | null
    merchant: string | null
    payment_method: PaymentMethod
    notes: string | null
    tags: string[]
    source: ExpenseSource
    source_metadata: Record<string, any>
    confidence_score: number
    needs_review: boolean
    transaction_hash: string | null
    receipt_url: string | null
}

// Form types for creating/updating expenses
export interface CreateExpenseData {
    amount: number
    currency?: Currency
    description: string
    date: string
    category_id?: string | null
    subcategory_id?: string | null
    budget_id?: string | null
    merchant?: string | null
    payment_method?: PaymentMethod
    notes?: string | null
    tags?: string[]
    receipt_url?: string | null
}

export interface UpdateExpenseData {
    id: string
    amount?: number
    currency?: Currency
    description?: string
    date?: string
    category_id?: string | null
    subcategory_id?: string | null
    budget_id?: string | null
    merchant?: string | null
    payment_method?: PaymentMethod
    notes?: string | null
    tags?: string[]
    receipt_url?: string | null
    needs_review?: boolean
}

// Expense with category and subcategory information
export interface ExpenseWithDetails extends Expense {
    category: {
        id: string
        name: string
        icon: string
        color: string
    } | null
    subcategory: {
        id: string
        name: string
    } | null
}

// Expense list item (optimized for lists)
export interface ExpenseListItem {
    id: string
    amount: number
    currency: Currency
    description: string
    date: string
    merchant: string | null
    category_name: string | null
    category_icon: string | null
    category_color: string | null
    subcategory_name: string | null
    payment_method: PaymentMethod
    needs_review: boolean
    source: ExpenseSource
    created_at: string
}

// Expense statistics
export interface ExpenseStats {
    total_amount: number
    expense_count: number
    average_expense: number
    currency: Currency
    date_range: {
        start: string
        end: string
    }
}

// Monthly expense statistics
export interface MonthlyExpenseStats {
    year: number
    month: number
    total_amount: number
    expense_count: number
    average_expense: number
    currency: Currency
    categories: Array<{
        category_id: string
        category_name: string
        category_icon: string
        category_color: string
        total_amount: number
        expense_count: number
        percentage: number
    }>
}

// Expense filters for queries
export interface ExpenseFilters {
    date_from?: string
    date_to?: string
    category_id?: string
    category_ids?: string[]
    subcategory_id?: string
    subcategory_ids?: string[]
    merchant?: string
    payment_method?: PaymentMethod
    payment_methods?: PaymentMethod[]
    amount_min?: number
    amount_max?: number
    currency?: Currency
    source?: ExpenseSource
    sources?: ExpenseSource[]
    needs_review?: boolean
    has_receipt?: boolean
    tags?: string[]
    description_contains?: string
}

// Expense sort options
export type ExpenseSortBy =
    | 'date'
    | 'amount'
    | 'description'
    | 'merchant'
    | 'category_name'
    | 'created_at'
    | 'updated_at'

export interface ExpenseSort {
    field: ExpenseSortBy
    direction: 'asc' | 'desc'
}

// Integration-specific types
export interface EmailScrapedExpense {
    raw_email_content: string
    extracted_data: {
        amount: number
        merchant: string
        date: string
        description?: string
        confidence_score: number
    }
    parsing_metadata: {
        email_subject: string
        email_from: string
        email_date: string
        parser_version: string
    }
}

export interface iPhoneShortcutExpense {
    amount: number
    description: string
    merchant?: string
    category_guess?: string
    date?: string
    location?: {
        latitude: number
        longitude: number
        address?: string
    }
    shortcut_metadata: {
        shortcut_name: string
        device_name: string
        timestamp: string
    }
}

// Bulk operations
export interface BulkExpenseOperation {
    action: 'update' | 'delete' | 'categorize'
    expense_ids: string[]
    data?: Partial<UpdateExpenseData>
}

export interface BulkExpenseResult {
    success_count: number
    error_count: number
    errors: Array<{
        expense_id: string
        error_message: string
    }>
}

// Validation schema
export interface ExpenseValidation {
    amount: {
        required: true
        min: 0.01
        max: 999999999.99
    }
    description: {
        required: true
        maxLength: 500
        minLength: 1
    }
    date: {
        required: true
        format: 'YYYY-MM-DD'
        max_future_days: 0
    }
    merchant: {
        required: false
        maxLength: 200
    }
    notes: {
        required: false
        maxLength: 1000
    }
}

// Expense summary for dashboards
export interface ExpenseSummary {
    today: ExpenseStats
    this_week: ExpenseStats
    this_month: ExpenseStats
    this_year: ExpenseStats
    recent_expenses: ExpenseListItem[]
    top_categories: Array<{
        category_id: string
        category_name: string
        category_icon: string
        category_color: string
        total_amount: number
        percentage: number
    }>
    spending_trend: Array<{
        date: string
        amount: number
    }>
} 