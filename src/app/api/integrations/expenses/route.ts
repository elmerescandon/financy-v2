import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { validateApiKey } from '@/lib/api/auth'

// Validation schema for integration requests
const IntegrationExpenseSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required').max(500),
    source: z.enum(['iphone', 'email'], {
        errorMap: () => ({ message: 'Source must be either "iphone" or "email"' })
    }),
    merchant: z.string().max(200).optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    date: z.string().optional(), // ISO date string
    payment_method: z.enum([
        'efectivo', 'tarjeta_debito', 'tarjeta_credito',
        'transferencia', 'paypal', 'bizum', 'otro'
    ]).optional(),
    tags: z.array(z.string()).default([]),
    notes: z.string().max(1000).optional(),
    confidence_score: z.number().min(0).max(1).optional(), // For AI-parsed data
    raw_data: z.object({}).passthrough().optional() // Store original data for debugging
})

export async function POST(request: NextRequest) {
    try {
        // 1. Validate API key
        const authResult = await validateApiKey(request)
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized', message: authResult.error },
                { status: 401 }
            )
        }

        const { user } = authResult

        // 2. Parse and validate request body
        const body = await request.json()
        const validationResult = IntegrationExpenseSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.errors
                },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // 3. Set up Supabase client
        const supabase = await createClient()

        // 4. Auto-categorize if no category provided
        let categoryId = null
        let subcategoryId = null

        if (data.category) {
            // Find category by name
            const { data: categories } = await supabase
                .from('categories')
                .select('id, subcategories(id, name)')
                .eq('user_id', user.id)
                .ilike('name', `%${data.category}%`)
                .limit(1)

            if (categories && categories.length > 0) {
                categoryId = categories[0].id

                // Find subcategory if provided
                if (data.subcategory && categories[0].subcategories) {
                    const subcategory = categories[0].subcategories.find((sub: any) =>
                        sub.name.toLowerCase().includes(data.subcategory!.toLowerCase())
                    )
                    if (subcategory) {
                        subcategoryId = subcategory.id
                    }
                }
            }
        }

        // 5. Process date
        const expenseDate = data.date ? new Date(data.date).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0]

        // 6. Create expense record
        const expenseData = {
            user_id: user.id,
            amount: data.amount,
            currency: 'PEN' as const, // Default to PEN, could be configurable
            description: data.description,
            date: expenseDate,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            merchant: data.merchant || null,
            payment_method: data.payment_method || 'otro',
            notes: data.notes || null,
            tags: data.tags,
            source: data.source,
            confidence_score: data.confidence_score || null,
            raw_data: data.raw_data || null,
            needs_review: data.source === 'email' && (data.confidence_score || 0) < 0.8
        }

        const { data: expense, error } = await supabase
            .from('expenses')
            .insert([expenseData])
            .select(`
                *,
                category:categories(id, name, icon, color),
                subcategory:subcategories(id, name)
            `)
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to create expense', message: error.message },
                { status: 500 }
            )
        }

        // 7. Return success response
        return NextResponse.json({
            success: true,
            data: {
                id: expense.id,
                amount: expense.amount,
                description: expense.description,
                category: expense.category?.name || null,
                subcategory: expense.subcategory?.name || null,
                source: expense.source,
                needs_review: expense.needs_review,
                created_at: expense.created_at
            },
            message: `Expense created successfully from ${data.source}`
        }, { status: 201 })

    } catch (error) {
        console.error('Integration endpoint error:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'integrations/expenses',
        methods: ['POST'],
        description: 'Create expenses from external sources (iPhone, email scraper)'
    })
} 