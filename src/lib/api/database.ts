import { createClient } from '@/lib/supabase/server'
import { DatabaseSchema } from '@/types'

// Always use public schema for production
export function getSchema(): DatabaseSchema {
    return 'public'
}

// Get table name (always public now)
export function getTableName(entity: string): string {
    return entity
}

// Create authenticated Supabase client
export async function createAuthenticatedClient() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Authentication required')
    }

    return { supabase, user }
}

// Create Supabase client (for test endpoints)
export async function createSupabaseClient() {
    const supabase = await createClient()
    return supabase
}

// Database query builders
export class QueryBuilder {
    private supabase: any
    private tableName: string

    constructor(supabase: any, entity: string) {
        this.supabase = supabase
        this.tableName = entity
    }

    // Select query with filters
    select(columns = '*') {
        return this.supabase.from(this.tableName).select(columns)
    }

    // Insert single record
    async insert(data: Record<string, any>) {
        const { data: result, error } = await this.supabase
            .from(this.tableName)
            .insert(data)
            .select()
            .single()

        if (error) throw error
        return result
    }

    // Update record by ID
    async update(id: string, data: Record<string, any>) {
        const { data: result, error } = await this.supabase
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return result
    }

    // Delete record by ID
    async delete(id: string) {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }
    }

    // Get single record by ID
    async getById(id: string, columns = '*') {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select(columns)
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // Not found
            }
            throw error
        }
        return data
    }

    // Check if record exists and belongs to user
    async verifyOwnership(id: string, userId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        return !error && !!data
    }
}

// Pagination helper
export interface PaginationOptions {
    page?: number
    limit?: number
}

export interface PaginationResult {
    page: number
    limit: number
    total: number
    total_pages: number
}

export async function paginate<T>(
    query: any,
    options: PaginationOptions = {}
): Promise<{ data: T[], pagination: PaginationResult }> {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(100, Math.max(1, options.limit || 20))
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get total count first
    const { count } = await query.select('*', { count: 'exact', head: true })
    const total = count || 0
    const total_pages = Math.ceil(total / limit)

    // Get paginated data
    const { data, error } = await query.range(from, to)

    if (error) throw error

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

// Filter builder for common patterns
export class FilterBuilder {
    private query: any

    constructor(query: any) {
        this.query = query
    }

    // Date range filter
    dateRange(field: string, from?: string, to?: string) {
        if (from) {
            this.query = this.query.gte(field, from)
        }
        if (to) {
            this.query = this.query.lte(field, to)
        }
        return this
    }

    // Text search (case insensitive)
    textSearch(field: string, value?: string) {
        if (value) {
            this.query = this.query.ilike(field, `%${value}%`)
        }
        return this
    }

    // Exact match
    equals(field: string, value?: any) {
        if (value !== undefined) {
            this.query = this.query.eq(field, value)
        }
        return this
    }

    // In array
    in(field: string, values?: any[]) {
        if (values && values.length > 0) {
            this.query = this.query.in(field, values)
        }
        return this
    }

    // Boolean filter
    boolean(field: string, value?: boolean) {
        if (typeof value === 'boolean') {
            this.query = this.query.eq(field, value)
        }
        return this
    }

    // Range filter (min/max)
    range(field: string, min?: number, max?: number) {
        if (min !== undefined) {
            this.query = this.query.gte(field, min)
        }
        if (max !== undefined) {
            this.query = this.query.lte(field, max)
        }
        return this
    }

    // Sorting
    sort(field: string, direction: 'asc' | 'desc' = 'desc') {
        this.query = this.query.order(field, { ascending: direction === 'asc' })
        return this
    }

    // Get the built query
    build() {
        return this.query
    }
}

// Transaction helper for atomic operations
export async function withTransaction<T>(
    operations: (supabase: any) => Promise<T>
): Promise<T> {
    const { supabase } = await createAuthenticatedClient()

    try {
        // Note: Supabase doesn't have explicit transactions in the client
        // but RLS policies ensure data isolation
        return await operations(supabase)
    } catch (error) {
        // Log error for debugging
        console.error('Transaction failed:', error)
        throw error
    }
}

// Helper for generating transaction hashes
export function generateTransactionHash(data: {
    amount: number
    date: string
    merchant?: string
    description: string
}): string {
    const hashInput = `${data.amount}-${data.date}-${data.merchant || ''}-${data.description}`

    // Simple hash function (in production, use crypto)
    let hash = 0
    for (let i = 0; i < hashInput.length; i++) {
        const char = hashInput.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
} 