// Shared types and utilities
export * from './shared'

// Entity types
export * from './category'
export * from './subcategory'
export * from './expense'

// Type guards for runtime type checking
export function isCategory(obj: any): obj is import('./category').Category {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.user_id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.icon === 'string' &&
        typeof obj.color === 'string' &&
        typeof obj.is_default === 'boolean'
}

export function isSubcategory(obj: any): obj is import('./subcategory').Subcategory {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.category_id === 'string' &&
        typeof obj.name === 'string'
}

export function isExpense(obj: any): obj is import('./expense').Expense {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.user_id === 'string' &&
        typeof obj.amount === 'number' &&
        typeof obj.description === 'string' &&
        typeof obj.date === 'string' &&
        typeof obj.payment_method === 'string' &&
        typeof obj.source === 'string' &&
        typeof obj.confidence_score === 'number' &&
        typeof obj.needs_review === 'boolean'
}

// Utility type for database operations
export type DatabaseOperation<T> = {
    create: (data: T) => Promise<T>
    read: (id: string) => Promise<T | null>
    update: (id: string, data: Partial<T>) => Promise<T>
    delete: (id: string) => Promise<void>
    list: (filters?: any) => Promise<T[]>
}

// Environment configuration type
export interface AppConfig {
    environment: 'development' | 'production'
    database_schema: import('./shared').DatabaseSchema
    supabase_url: string
    supabase_anon_key: string
    features: {
        email_scraping_enabled: boolean
        iphone_shortcuts_enabled: boolean
        receipt_upload_enabled: boolean
        ai_categorization_enabled: boolean
    }
} 