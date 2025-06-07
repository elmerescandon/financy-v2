import { createClient } from './client'
import type { IncomeWithDetails, CreateIncomeData, UpdateIncomeData, IncomeListItem, IncomeFilters, IncomeSort } from '@/types/income'

const supabase = createClient()

export class IncomeService {
    // Create income (using expenses table with type: 'income')
    static async create(income: CreateIncomeData) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Extract income-specific fields that need mapping
        console.log('income', income)
        const { employer_client, is_recurring, is_taxable, recurring_end_date, source, ...baseData } = income

        const incomeData = {
            ...baseData,
            user_id: user.id,
            type: 'income',
            // Map income-specific fields to expense table columns
            merchant: employer_client,
            recurring: is_recurring || false,
            recurring_frequency: income.recurring_frequency,
            source: 'manual', // ExpenseSource type
            source_metadata: {
                income_source: source,
                is_taxable: is_taxable || false,
                recurring_end_date: recurring_end_date
            },
            confidence_score: 1.0,
            needs_review: false
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert(incomeData)
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .single()

        if (error) throw error
        return this.mapToIncomeWithDetails(data)
    }

    // Get all incomes for current user
    static async getAll(limit = 50, offset = 0, filters?: IncomeFilters, sort?: IncomeSort) {
        let query = supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .eq('type', 'income')

        // Apply filters
        if (filters) {
            if (filters.date_from) query = query.gte('date', filters.date_from)
            if (filters.date_to) query = query.lte('date', filters.date_to)
            if (filters.source) query = query.eq('source_metadata->>income_source', filters.source)
            if (filters.sources) query = query.in('source_metadata->>income_source', filters.sources)
            if (filters.category_id) query = query.eq('category_id', filters.category_id)
            if (filters.category_ids) query = query.in('category_id', filters.category_ids)
            if (filters.employer_client) query = query.ilike('merchant', `%${filters.employer_client}%`)
            if (filters.amount_min) query = query.gte('amount', filters.amount_min)
            if (filters.amount_max) query = query.lte('amount', filters.amount_max)
            if (filters.currency) query = query.eq('currency', filters.currency)
            if (typeof filters.is_recurring === 'boolean') query = query.eq('recurring', filters.is_recurring)
            if (typeof filters.is_taxable === 'boolean') query = query.eq('source_metadata->>is_taxable', filters.is_taxable.toString())
            if (typeof filters.needs_review === 'boolean') query = query.eq('needs_review', filters.needs_review)
            if (filters.description_contains) query = query.ilike('description', `%${filters.description_contains}%`)
        }

        // Apply sorting
        if (sort) {
            query = query.order(sort.field, { ascending: sort.direction === 'asc' })
        } else {
            query = query.order('date', { ascending: false }).order('created_at', { ascending: false })
        }

        const { data, error } = await query.range(offset, offset + limit - 1)

        if (error) throw error
        return data?.map(this.mapToIncomeWithDetails) || []
    }

    // Get income by ID
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .eq('id', id)
            .eq('type', 'income')
            .single()

        if (error) throw error
        return this.mapToIncomeWithDetails(data)
    }

    // Update income
    static async update(id: string, updates: UpdateIncomeData) {
        // Extract income-specific fields that need mapping
        const { employer_client, is_recurring, is_taxable, recurring_end_date, source, ...baseUpdates } = updates

        const updateData = {
            ...baseUpdates,
            // Map income-specific fields to expense table columns
            merchant: employer_client,
            recurring: is_recurring,
            recurring_frequency: updates.recurring_frequency,
            source_metadata: {
                income_source: source,
                is_taxable: is_taxable,
                recurring_end_date: recurring_end_date
            }
        }

        const { data, error } = await supabase
            .from('expenses')
            .update(updateData)
            .eq('id', id)
            .eq('type', 'income')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .single()

        if (error) throw error
        return this.mapToIncomeWithDetails(data)
    }

    // Delete income
    static async delete(id: string) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)
            .eq('type', 'income')

        if (error) throw error
    }

    // Get incomes by date range
    static async getByDateRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .eq('type', 'income')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false })

        if (error) throw error
        return data?.map(this.mapToIncomeWithDetails) || []
    }

    // Get recurring incomes
    static async getRecurring() {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .eq('type', 'income')
            .eq('recurring', true)
            .order('date', { ascending: false })

        if (error) throw error
        return data?.map(this.mapToIncomeWithDetails) || []
    }

    // Get income statistics
    static async getStats(startDate?: string, endDate?: string) {
        let query = supabase
            .from('expenses')
            .select('amount, currency')
            .eq('type', 'income')

        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data, error } = await query

        if (error) throw error

        const total_amount = data?.reduce((sum, income) => sum + income.amount, 0) || 0
        const income_count = data?.length || 0
        const average_income = income_count > 0 ? total_amount / income_count : 0

        return {
            total_amount,
            income_count,
            average_income,
            currency: data?.[0]?.currency || 'USD',
            date_range: {
                start: startDate || '',
                end: endDate || ''
            }
        }
    }

    // Helper method to map expense data to income format
    private static mapToIncomeWithDetails(data: any): IncomeWithDetails {
        return {
            id: data.id,
            user_id: data.user_id,
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            date: data.date,
            source: data.source_metadata?.income_source || 'other',
            employer_client: data.merchant,
            category_id: data.category_id,
            notes: data.notes,
            is_recurring: data.recurring || false,
            recurring_frequency: data.recurring_frequency,
            recurring_end_date: data.source_metadata?.recurring_end_date,
            is_taxable: data.source_metadata?.is_taxable || false,
            tags: data.tags || [],
            confidence_score: data.confidence_score,
            needs_review: data.needs_review,
            transaction_hash: data.transaction_hash,
            created_at: data.created_at,
            updated_at: data.updated_at,
            category: data.category
        }
    }
} 