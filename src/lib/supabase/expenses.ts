import { createClient } from './client'
import type { ExpenseWithDetails, CreateExpenseData, UpdateExpenseData } from '@/types/expense'

const supabase = createClient()

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

    // Get all expenses for current user
    static async getAll(limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .eq('type', 'expense')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error
        return data as ExpenseWithDetails[]
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

    // Get expenses by date range
    static async getByDateRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false })

        if (error) throw error
        return data as ExpenseWithDetails[]
    }

    // Get expenses by category
    static async getByCategory(categoryId: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        subcategory:subcategories(id, name, category_id)
      `)
            .eq('type', 'expense')
            .eq('category_id', categoryId)
            .order('date', { ascending: false })

        if (error) throw error
        return data as ExpenseWithDetails[]
    }
} 