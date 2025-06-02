// Shared database types and utilities

export interface BaseEntity {
    id: string
    created_at: string
    updated_at: string
}

export interface UserOwnedEntity extends BaseEntity {
    user_id: string
}

// Payment method enum
export type PaymentMethod =
    | 'cash'
    | 'credit_card'
    | 'debit_card'
    | 'bank_transfer'
    | 'other'

// Expense source enum
export type ExpenseSource =
    | 'manual'
    | 'email_scrape'
    | 'iphone_shortcut'
    | 'api'

// Currency type (ISO 4217 codes)
export type Currency = 'USD' | 'EUR' | 'GBP' | 'MXN' | 'CAD' | 'AUD' | 'JPY'

// Database schema type for environment switching
export type DatabaseSchema = 'public' | 'development'

// Common validation constraints
export const VALIDATION_CONSTRAINTS = {
    CATEGORY_NAME_MAX_LENGTH: 100,
    SUBCATEGORY_NAME_MAX_LENGTH: 100,
    MERCHANT_MAX_LENGTH: 200,
    DESCRIPTION_REQUIRED: true,
    AMOUNT_MIN: 0.01,
    AMOUNT_MAX: 999999999.99,
    CONFIDENCE_SCORE_MIN: 0,
    CONFIDENCE_SCORE_MAX: 1,
    COLOR_HEX_PATTERN: /^#[0-9A-Fa-f]{6}$/,
    TRANSACTION_HASH_MAX_LENGTH: 64,
} as const

// API response wrapper types
export interface ApiResponse<T> {
    data: T | null
    error: string | null
    success: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    limit: number
    total_pages: number
}

// Form state types
export interface FormErrors {
    [key: string]: string | undefined
}

export interface FormState {
    isLoading: boolean
    errors: FormErrors
    isDirty: boolean
} 