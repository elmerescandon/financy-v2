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

// Simple filter interface
interface SimpleFilters {
    date_from?: string
    date_to?: string
    category_id?: string
    page?: number
    limit?: number
}

export class ExpenseService {
    // Create expense
    static async create(expense: CreateExpenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .insert(expense)
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
    static async getFilteredWithPagination(
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
            .eq('type', 'expense')

        // Apply date filters
        if (filters.date_from) {
            query = query.gte('date', filters.date_from)
        }
        if (filters.date_to) {
            query = query.lte('date', filters.date_to)
        }

        // Apply category filter
        if (filters.category_id) {
            query = query.eq('category_id', filters.category_id)
        }

        // Apply sorting
        query = query.order('date', { ascending: false })

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) throw error

        const total = count || 0
        const total_pages = Math.ceil(total / limit)


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
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .eq('id', id)
            .eq('type', 'expense')
            .single()

        if (error) throw error
        return data as ExpenseWithDetails
    }

    // Update expense
    static async update(id: string, updates: UpdateExpenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .update(updates)
            .eq('id', id)
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
    static async delete(id: string) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)
            .eq('type', 'expense')

        if (error) throw error
    }

    // Get all filtered expenses without pagination (for summary calculations)
    static async getAllFiltered(filters: SimpleFilters = {}): Promise<ExpenseWithDetails[]> {
        let query = supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon),
                subcategory:subcategories(id, name, category_id)
            `)
            .eq('type', 'expense')

        // Apply date filters
        if (filters.date_from) {
            query = query.gte('date', filters.date_from)
        }
        if (filters.date_to) {
            query = query.lte('date', filters.date_to)
        }

        // Apply category filter
        if (filters.category_id) {
            query = query.eq('category_id', filters.category_id)
        }

        // Apply sorting
        query = query.order('date', { ascending: false })

        const { data, error } = await query

        if (error) throw error
        return data || []
    }
} 