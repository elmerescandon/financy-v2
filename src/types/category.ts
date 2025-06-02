import { UserOwnedEntity } from './shared'

// Database entity type
export interface Category extends UserOwnedEntity {
    name: string
    icon: string
    color: string
    is_default: boolean
}

// Form types for creating/updating categories
export interface CreateCategoryData {
    name: string
    icon?: string
    color?: string
}

export interface UpdateCategoryData {
    id: string
    name?: string
    icon?: string
    color?: string
}

// Category with subcategories included
export interface CategoryWithSubcategories extends Category {
    subcategories: Array<{
        id: string
        name: string
        created_at: string
        updated_at: string
    }>
}

// Category for dropdown/selection components
export interface CategoryOption {
    id: string
    name: string
    icon: string
    color: string
}

// Category statistics
export interface CategoryStats {
    id: string
    name: string
    icon: string
    color: string
    total_expenses: number
    expense_count: number
    average_expense: number
    percentage_of_total: number
}

// Default category data for seeding
export interface DefaultCategoryData {
    name: string
    icon: string
    color: string
    subcategories: string[]
}

// Category validation schema
export interface CategoryValidation {
    name: {
        required: true
        maxLength: 100
        minLength: 1
    }
    icon: {
        required: false
        maxLength: 50
    }
    color: {
        required: false
        pattern: string // hex color pattern
    }
}

// Category filters for queries
export interface CategoryFilters {
    is_default?: boolean
    name_contains?: string
    created_after?: string
    created_before?: string
}

// Category sort options
export type CategorySortBy =
    | 'name'
    | 'created_at'
    | 'updated_at'
    | 'expense_count'
    | 'total_amount'

export interface CategorySort {
    field: CategorySortBy
    direction: 'asc' | 'desc'
} 