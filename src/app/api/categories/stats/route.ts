import { createApiHandler } from '@/lib/api/middleware'
import { QueryBuilder, getTableName } from '@/lib/api/database'
import { validateQueryParams, StatsDateRangeSchema } from '@/lib/api/validation'
import { statsResponse } from '@/lib/api/responses'
import type { User } from '@supabase/supabase-js'

interface AuthContext {
    user: User
    supabase: any
}

// GET /api/categories/stats - Get category statistics
async function getCategoryStats(request: Request, context: AuthContext) {
    const { user, supabase } = context
    const url = new URL(request.url)

    // Validate query parameters
    const filters = validateQueryParams(StatsDateRangeSchema, url.searchParams)

    // Base query for category stats
    let query = `
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.color,
      c.is_default,
      COUNT(e.id) as expense_count,
      COALESCE(SUM(e.amount), 0) as total_amount,
      COALESCE(AVG(e.amount), 0) as avg_amount,
      MIN(e.date) as first_expense_date,
      MAX(e.date) as last_expense_date
    FROM ${getTableName('categories')} c
    LEFT JOIN ${getTableName('expenses')} e ON c.id = e.category_id
    WHERE c.user_id = $1
  `

    const queryParams: any[] = [user.id as string]
    let paramIndex = 2

    // Add date filters
    if (filters.from) {
        query += ` AND (e.date IS NULL OR e.date >= $${paramIndex})`
        queryParams.push(filters.from)
        paramIndex++
    }

    if (filters.to) {
        query += ` AND (e.date IS NULL OR e.date <= $${paramIndex})`
        queryParams.push(filters.to)
        paramIndex++
    }

    // Add category filters
    if (filters.category_id) {
        query += ` AND c.id = $${paramIndex}`
        queryParams.push(filters.category_id)
        paramIndex++
    }

    if (filters.category_ids && filters.category_ids.length > 0) {
        query += ` AND c.id = ANY($${paramIndex})`
        queryParams.push(filters.category_ids)
        paramIndex++
    }

    query += `
    GROUP BY c.id, c.name, c.icon, c.color, c.is_default
    ORDER BY total_amount DESC, expense_count DESC
  `

    // Execute query
    const { data: categoryStats, error } = await supabase.rpc('execute_sql', {
        query,
        params: queryParams
    })

    if (error) throw error

    // Get overall totals
    const totalQuery = `
    SELECT 
      COUNT(DISTINCT c.id) as total_categories,
      COUNT(e.id) as total_expenses,
      COALESCE(SUM(e.amount), 0) as total_amount,
      COUNT(DISTINCT CASE WHEN c.is_default THEN c.id END) as default_categories,
      COUNT(DISTINCT CASE WHEN NOT c.is_default THEN c.id END) as custom_categories
    FROM ${getTableName('categories')} c
    LEFT JOIN ${getTableName('expenses')} e ON c.id = e.category_id
    WHERE c.user_id = $1
  `

    let totalParams = [user.id as string]
    let totalQueryWithFilters = totalQuery

    if (filters.from || filters.to) {
        if (filters.from) {
            totalQueryWithFilters += ` AND (e.date IS NULL OR e.date >= $2)`
            totalParams.push(filters.from)
        }
        if (filters.to) {
            const paramIdx = filters.from ? 3 : 2
            totalQueryWithFilters += ` AND (e.date IS NULL OR e.date <= $${paramIdx})`
            totalParams.push(filters.to)
        }
    }

    const { data: totals, error: totalsError } = await supabase.rpc('execute_sql', {
        query: totalQueryWithFilters,
        params: totalParams
    })

    if (totalsError) throw totalsError

    // Calculate percentage breakdown
    const totalAmount = totals[0]?.total_amount || 0
    const statsWithPercentages = categoryStats.map((stat: any) => ({
        ...stat,
        percentage: totalAmount > 0 ? (stat.total_amount / totalAmount) * 100 : 0,
        expense_count: parseInt(stat.expense_count),
        total_amount: parseFloat(stat.total_amount),
        avg_amount: parseFloat(stat.avg_amount)
    }))

    return statsResponse({
        categories: statsWithPercentages,
        summary: {
            total_categories: parseInt(totals[0]?.total_categories || 0),
            total_expenses: parseInt(totals[0]?.total_expenses || 0),
            total_amount: parseFloat(totals[0]?.total_amount || 0),
            default_categories: parseInt(totals[0]?.default_categories || 0),
            custom_categories: parseInt(totals[0]?.custom_categories || 0)
        }
    }, {
        data_range: {
            from: filters.from || 'all-time',
            to: filters.to || 'all-time'
        }
    })
}

// Main handler with middleware
const handler = createApiHandler(
    async (request: Request, context: AuthContext) => {
        switch (request.method) {
            case 'GET':
                return getCategoryStats(request, context)
            default:
                throw new Error('Method not allowed')
        }
    },
    {
        auth: true,
        methods: ['GET'],
        cors: true
    }
)

export { handler as GET } 