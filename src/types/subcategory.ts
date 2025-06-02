import { BaseEntity } from './shared'

// Database entity type
export interface Subcategory extends BaseEntity {
    category_id: string
    name: string
}

// Form types for creating/updating subcategories
export interface CreateSubcategoryData {
    category_id: string
    name: string
}

export interface UpdateSubcategoryData {
    id: string
    name?: string
    category_id?: string
}

// Subcategory with category information
export interface SubcategoryWithCategory extends Subcategory {
    category: {
        id: string
        name: string
        icon: string
        color: string
    }
}

// Subcategory for dropdown/selection components
export interface SubcategoryOption {
    id: string
    name: string
    category_id: string
    category_name: string
    category_icon: string
    category_color: string
}

// Subcategory statistics
export interface SubcategoryStats {
    id: string
    name: string
    category_id: string
    category_name: string
    category_icon: string
    category_color: string
    total_expenses: number
    expense_count: number
    average_expense: number
    percentage_of_category: number
    percentage_of_total: number
}

// Subcategory filters for queries
export interface SubcategoryFilters {
    category_id?: string
    category_ids?: string[]
    name_contains?: string
    created_after?: string
    created_before?: string
}

// Subcategory sort options
export type SubcategorySortBy =
    | 'name'
    | 'category_name'
    | 'created_at'
    | 'updated_at'
    | 'expense_count'
    | 'total_amount'

export interface SubcategorySort {
    field: SubcategorySortBy
    direction: 'asc' | 'desc'
}

// Grouped subcategories by category
export interface GroupedSubcategories {
    [categoryId: string]: {
        category: {
            id: string
            name: string
            icon: string
            color: string
        }
        subcategories: Subcategory[]
    }
}

// Validation schema
export interface SubcategoryValidation {
    name: {
        required: true
        maxLength: 100
        minLength: 1
    }
    category_id: {
        required: true
        exists: true // Must exist in categories table
    }
} 