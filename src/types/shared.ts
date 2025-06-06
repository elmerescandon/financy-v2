// Shared database types and utilities

export interface BaseEntity {
    id: string
    created_at: string
    updated_at: string
}

export interface UserOwnedEntity extends BaseEntity {
    user_id: string
}

// Payment method enum - matches database enum
export type PaymentMethod =
    | 'cash'
    | 'credit_card'
    | 'debit_card'
    | 'bank_transfer'
    | 'other'

// Expense source enum - matches database enum
export type ExpenseSource =
    | 'manual'
    | 'iphone'
    | 'email'
    | 'import'
    | 'api'

// Currency type (ISO 4217 codes)
export type Currency = 'USD' | 'EUR' | 'GBP' | 'MXN' | 'CAD' | 'AUD' | 'JPY' | 'PEN'

// Database schema type for environment switching
export type DatabaseSchema = 'public' | 'development'

// Enum metadata for validation and display
export const EXPENSE_SOURCE_OPTIONS = [
    { value: 'manual', label: 'Manual', description: 'Ingresado manualmente' },
    { value: 'iphone', label: 'iPhone', description: 'Atajo de Siri/iPhone' },
    { value: 'email', label: 'Email', description: 'Extraído de email bancario' },
    { value: 'import', label: 'Importación', description: 'Importado desde archivo' },
    { value: 'api', label: 'API', description: 'Creado vía API externa' },
] as const

export const PAYMENT_METHOD_OPTIONS = [
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'tarjeta_debito', label: 'Tarjeta de débito', icon: '💳' },
    { value: 'tarjeta_credito', label: 'Tarjeta de crédito', icon: '💳' },
    { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
    { value: 'paypal', label: 'PayPal', icon: '🅿️' },
    { value: 'bizum', label: 'Bizum', icon: '📱' },
    { value: 'otro', label: 'Otro', icon: '❓' },
] as const

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