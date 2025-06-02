import { createApiHandler } from '@/lib/api/middleware'
import { QueryBuilder, FilterBuilder, paginate } from '@/lib/api/database'
import { validateRequestBody, validateQueryParams, CreateCategorySchema, CategoryFiltersSchema } from '@/lib/api/validation'
import { successResponse, createdResponse, paginatedResponse } from '@/lib/api/responses'
import { Category } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthContext {
    user: User
    supabase: any
}

// GET /api/categories - List categories with optional filtering
async function getCategories(request: Request, context: AuthContext) {
    const { user, supabase } = context
    const url = new URL(request.url)

    if (!user.id) {
        throw new Error('User ID is required')
    }

    // Validate query parameters
    const filters = validateQueryParams(CategoryFiltersSchema, url.searchParams)

    // Build query
    const queryBuilder = new QueryBuilder(supabase, 'categories')
    let query = queryBuilder.select(`
    id,
    name,
    icon,
    color,
    is_default,
    created_at,
    updated_at
  `)

    // Apply filters
    const filterBuilder = new FilterBuilder(query)
        .equals('user_id', user.id as string)
        .boolean('is_default', filters.is_default)
        .textSearch('name', filters.name_contains ?? '')
        .dateRange('created_at', filters.created_after ?? '', filters.created_before ?? '')
        .sort(filters.sort ?? 'created_at', filters.order ?? 'desc')

    const finalQuery = filterBuilder.build()
    const result = await paginate<Category>(finalQuery, {
        page: filters.page,
        limit: filters.limit
    })

    return paginatedResponse(result.data, result.pagination)
}

// POST /api/categories - Create new category
async function createCategory(request: Request, context: AuthContext) {
    const { user, supabase } = context

    if (!user.id) {
        throw new Error('User ID is required')
    }

    // Parse and validate request body
    const body = await request.json()
    const categoryData = validateRequestBody(CreateCategorySchema, body)

    // Create category
    const queryBuilder = new QueryBuilder(supabase, 'categories')
    const newCategory = await queryBuilder.insert({
        ...categoryData,
        user_id: user.id as string,
        is_default: false
    })

    return createdResponse(newCategory)
}

// Main handler with middleware
const handler = createApiHandler(
    async (request: Request, context: AuthContext) => {
        switch (request.method) {
            case 'GET':
                return getCategories(request, context)
            case 'POST':
                return createCategory(request, context)
            default:
                throw new Error('Method not allowed')
        }
    },
    {
        auth: true,
        methods: ['GET', 'POST'],
        jsonBody: true,
        cors: true
    }
)

export { handler as GET, handler as POST } 