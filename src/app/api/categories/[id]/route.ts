import { createApiHandler } from '@/lib/api/middleware'
import { QueryBuilder } from '@/lib/api/database'
import { validateRequestBody, validateQueryParams, UpdateCategorySchema, UUIDSchema } from '@/lib/api/validation'
import { successResponse, noContentResponse } from '@/lib/api/responses'
import { NotFoundError, ConflictError } from '@/lib/api/errors'
import { Category } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthContext {
    user: User
    supabase: any
}

// GET /api/categories/[id] - Get single category
async function getCategory(request: Request, context: AuthContext, params: { id: string }) {
    const { user, supabase } = context
    const categoryId = UUIDSchema.parse(params.id)

    const queryBuilder = new QueryBuilder(supabase, 'categories')
    const category = await queryBuilder.getById(categoryId)

    if (!category || category.user_id !== (user.id as string)) {
        throw new NotFoundError('Category not found')
    }

    return successResponse(category)
}

// PUT /api/categories/[id] - Update category
async function updateCategory(request: Request, context: AuthContext, params: { id: string }) {
    const { user, supabase } = context
    const categoryId = UUIDSchema.parse(params.id)

    // Check ownership
    const queryBuilder = new QueryBuilder(supabase, 'categories')
    const existing = await queryBuilder.getById(categoryId)

    if (!existing || existing.user_id !== (user.id as string)) {
        throw new NotFoundError('Category not found')
    }

    // Prevent editing default categories
    if (existing.is_default) {
        throw new ConflictError('Cannot edit default categories')
    }

    // Parse and validate request body
    const body = await request.json()
    const updateData = validateRequestBody(UpdateCategorySchema, body)

    // Update category
    const updatedCategory = await queryBuilder.update(categoryId, updateData)

    return successResponse(updatedCategory)
}

// DELETE /api/categories/[id] - Delete category
async function deleteCategory(request: Request, context: AuthContext, params: { id: string }) {
    const { user, supabase } = context
    const categoryId = UUIDSchema.parse(params.id)

    // Check ownership
    const queryBuilder = new QueryBuilder(supabase, 'categories')
    const existing = await queryBuilder.getById(categoryId)

    if (!existing || existing.user_id !== (user.id as string)) {
        throw new NotFoundError('Category not found')
    }

    // Prevent deleting default categories
    if (existing.is_default) {
        throw new ConflictError('Cannot delete default categories')
    }

    // Check for dependent subcategories
    const subcategoryQuery = new QueryBuilder(supabase, 'subcategories')
    const subcategoryResult = await subcategoryQuery.select('id').build().eq('category_id', categoryId)

    if (subcategoryResult.data && subcategoryResult.data.length > 0) {
        throw new ConflictError('Cannot delete category with subcategories')
    }

    // Check for dependent expenses
    const expenseQuery = new QueryBuilder(supabase, 'expenses')
    const expenseResult = await expenseQuery.select('id').build().eq('category_id', categoryId)

    if (expenseResult.data && expenseResult.data.length > 0) {
        throw new ConflictError('Cannot delete category with expenses')
    }

    // Delete category
    await queryBuilder.delete(categoryId)

    return noContentResponse()
}

// Main handler with middleware
const handler = createApiHandler(
    async (request: Request, context: AuthContext, { params }: { params: { id: string } }) => {
        switch (request.method) {
            case 'GET':
                return getCategory(request, context, params)
            case 'PUT':
                return updateCategory(request, context, params)
            case 'DELETE':
                return deleteCategory(request, context, params)
            default:
                throw new Error('Method not allowed')
        }
    },
    {
        auth: true,
        methods: ['GET', 'PUT', 'DELETE'],
        jsonBody: true,
        cors: true
    }
)

export { handler as GET, handler as PUT, handler as DELETE } 