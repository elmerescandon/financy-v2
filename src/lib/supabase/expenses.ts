import { createClient } from './client'
import type { ExpenseWithDetails, CreateExpenseData, UpdateExpenseData } from '@/types/expense'

const supabase = createClient()

// Simple pagination result interface
interface PaginationResult {
    page: number
    limit: number
    total: number
    total_pages: number
}

// Simple filter interface - updated to support multiple categories
interface SimpleFilters {
    date_from?: string
    date_to?: string
    category_id?: string
    category_ids?: string[]
    page?: number
    limit?: number
}

export class ExpenseService {
    private userId: string

    constructor(userId: string) {
        if (!userId) {
            throw new Error('ExpenseService requires a userId to be initialized')
        }
        this.userId = userId
    }

    // Create expense
    async create(expense: CreateExpenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .insert({ ...expense, user_id: this.userId })
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .single()

        if (error) throw error
        return data as ExpenseWithDetails
    }

    // Get filtered expenses with pagination (simplified)
    async getFilteredWithPagination(
        filters: SimpleFilters = {},
        page = 1,
        limit = 20
    ): Promise<{ data: ExpenseWithDetails[], pagination: PaginationResult }> {

        let query = supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon),
                subcategory:subcategories(id, name, category_id)
            `, { count: 'exact' })
            .eq('user_id', this.userId)
            .eq('type', 'expense')

        // Apply date filters
        if (filters.date_from) {
            query = query.gte('date', filters.date_from)
        }
        if (filters.date_to) {
            query = query.lte('date', filters.date_to)
        }

        // Apply category filters - support both single and multiple categories
        if (filters.category_ids && Array.isArray(filters.category_ids) && filters.category_ids.length > 0) {
            query = query.in('category_id', filters.category_ids)
        } else if (filters.category_id) {
            query = query.eq('category_id', filters.category_id)
        }

        // Apply sorting
        query = query.order('date', { ascending: false })

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query
        if (error) {
            console.error('ExpenseService - Query error:', error)
            throw error
        }

        const total = count || 0
        const total_pages = Math.ceil(total / limit)

        console.log('ExpenseService - Query result:', { total, dataLength: data?.length })

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total,
                total_pages
            }
        }
    }

    // Get expense by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .eq('id', id)
            .eq('user_id', this.userId)
            .eq('type', 'expense')
            .single()

        if (error) throw error
        return data as ExpenseWithDetails
    }

    // Update expense
    async update(id: string, updates: UpdateExpenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .update(updates)
            .eq('id', id)
            .eq('user_id', this.userId)
            .eq('type', 'expense')
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .single()

        if (error) throw error
        return data as ExpenseWithDetails
    }

    // Delete expense
    async delete(id: string) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)
            .eq('user_id', this.userId)
            .eq('type', 'expense')

        if (error) throw error
    }

    // Get all filtered expenses without pagination (for summary calculations)
    async getAllFiltered(filters: SimpleFilters = {}): Promise<ExpenseWithDetails[]> {
        console.log('ExpenseService getAllFiltered - Filters received:', filters)
        console.log('ExpenseService getAllFiltered - category_ids:', filters.category_ids)

        let query = supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon),
                subcategory:subcategories(id, name, category_id)
            `)
            .eq('user_id', this.userId)
            .eq('type', 'expense')

        // Apply date filters
        if (filters.date_from) {
            query = query.gte('date', filters.date_from)
        }
        if (filters.date_to) {
            query = query.lte('date', filters.date_to)
        }

        // Apply category filters - support both single and multiple categories
        if (filters.category_ids && Array.isArray(filters.category_ids) && filters.category_ids.length > 0) {
            console.log('ExpenseService getAllFiltered - Applying multiple category filter with:', filters.category_ids)
            query = query.in('category_id', filters.category_ids)
        } else if (filters.category_id) {
            console.log('ExpenseService getAllFiltered - Applying single category filter with:', filters.category_id)
            query = query.eq('category_id', filters.category_id)
        } else {
            console.log('ExpenseService getAllFiltered - No category filter applied')
        }

        // Apply sorting
        query = query.order('date', { ascending: false })

        const { data, error } = await query

        if (error) {
            console.error('ExpenseService getAllFiltered - Query error:', error)
            throw error
        }

        console.log('ExpenseService getAllFiltered - Query result length:', data?.length)
        return data || []
    }
} 