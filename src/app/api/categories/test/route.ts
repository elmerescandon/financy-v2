import { createApiHandler } from '@/lib/api/middleware'
import { QueryBuilder, FilterBuilder, paginate, createSupabaseClient } from '@/lib/api/database'
import { validateRequestBody, validateQueryParams, CreateCategorySchema, CategoryFiltersSchema } from '@/lib/api/validation'
import { successResponse, createdResponse, paginatedResponse } from '@/lib/api/responses'
import { Category } from '@/types'

// Test context interface
interface TestContext {
    user: { id: string }
    supabase: any
}

// GET /api/categories/test - List categories with test user_id
async function getCategories(request: Request) {
    const url = new URL(request.url)
    const testUserId = url.searchParams.get('user_id')

    if (!testUserId) {
        return Response.json({
            success: false,
            error: 'user_id query parameter is required for testing'
        }, { status: 400 })
    }

    // Create Supabase client with correct schema
    const supabase = await createSupabaseClient()
    const context: TestContext = {
        user: { id: testUserId },
        supabase
    }

    // Validate query parameters (remove user_id from filters)
    const searchParams = new URLSearchParams(url.searchParams)
    searchParams.delete('user_id')
    const filters = validateQueryParams(CategoryFiltersSchema, searchParams)

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
        .equals('user_id', testUserId)
        .boolean('is_default', filters.is_default)
        .textSearch('name', filters.name_contains || '')
        .dateRange('created_at', filters.created_after || '', filters.created_before || '')
        .sort(filters.sort || 'created_at', filters.order || 'desc')

    const finalQuery = filterBuilder.build()
    const result = await paginate<Category>(finalQuery, {
        page: filters.page,
        limit: filters.limit
    })

    return paginatedResponse(result.data, result.pagination)
}

// POST /api/categories/test - Create new category with test user_id
async function createCategory(request: Request) {
    const url = new URL(request.url)
    const testUserId = url.searchParams.get('user_id')

    if (!testUserId) {
        return Response.json({
            success: false,
            error: 'user_id query parameter is required for testing'
        }, { status: 400 })
    }

    // Create Supabase client with correct schema
    const supabase = await createSupabaseClient()

    // Parse and validate request body
    const body = await request.json()
    const categoryData = validateRequestBody(CreateCategorySchema, body)

    // Create category
    const queryBuilder = new QueryBuilder(supabase, 'categories')
    const newCategory = await queryBuilder.insert({
        ...categoryData,
        user_id: testUserId,
        is_default: false
    })

    return createdResponse(newCategory)
}

// Main handler with minimal middleware (no auth)
const handler = createApiHandler(
    async (request: Request) => {
        switch (request.method) {
            case 'GET':
                return getCategories(request)
            case 'POST':
                return createCategory(request)
            default:
                throw new Error('Method not allowed')
        }
    },
    {
        auth: false, // Disable auth for testing
        methods: ['GET', 'POST'],
        jsonBody: true,
        cors: true
    }
)

export { handler as GET, handler as POST } 