import { z } from 'zod'
import { VALIDATION_CONSTRAINTS } from '@/types'

// Common validation schemas
export const UUIDSchema = z.string().uuid('Invalid UUID format')
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
export const ColorHexSchema = z.string().regex(VALIDATION_CONSTRAINTS.COLOR_HEX_PATTERN, 'Color must be a valid hex code')

// Pagination schema
export const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Sort direction schema
export const SortDirectionSchema = z.enum(['asc', 'desc']).default('desc')

// Category validation schemas
export const CreateCategorySchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(VALIDATION_CONSTRAINTS.CATEGORY_NAME_MAX_LENGTH,
            `Name must be ${VALIDATION_CONSTRAINTS.CATEGORY_NAME_MAX_LENGTH} characters or less`),
    icon: z.string()
        .max(50, 'Icon must be 50 characters or less')
        .optional()
        .default('💰'),
    color: ColorHexSchema.optional().default('#6B7280'),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export const CategoryFiltersSchema = z.object({
    is_default: z.coerce.boolean().optional(),
    name_contains: z.string().optional(),
    created_after: DateSchema.optional(),
    created_before: DateSchema.optional(),
    sort: z.enum(['name', 'created_at', 'updated_at', 'expense_count', 'total_amount']).default('name'),
    order: SortDirectionSchema,
}).merge(PaginationSchema)

// Subcategory validation schemas
export const CreateSubcategorySchema = z.object({
    category_id: UUIDSchema,
    name: z.string()
        .min(1, 'Name is required')
        .max(VALIDATION_CONSTRAINTS.SUBCATEGORY_NAME_MAX_LENGTH,
            `Name must be ${VALIDATION_CONSTRAINTS.SUBCATEGORY_NAME_MAX_LENGTH} characters or less`),
})

export const UpdateSubcategorySchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(VALIDATION_CONSTRAINTS.SUBCATEGORY_NAME_MAX_LENGTH,
            `Name must be ${VALIDATION_CONSTRAINTS.SUBCATEGORY_NAME_MAX_LENGTH} characters or less`)
        .optional(),
    category_id: UUIDSchema.optional(),
})

export const SubcategoryFiltersSchema = z.object({
    category_id: UUIDSchema.optional(),
    category_ids: z.array(UUIDSchema).optional(),
    name_contains: z.string().optional(),
    created_after: DateSchema.optional(),
    created_before: DateSchema.optional(),
    sort: z.enum(['name', 'category_name', 'created_at', 'updated_at', 'expense_count', 'total_amount']).default('name'),
    order: SortDirectionSchema,
}).merge(PaginationSchema)

// Expense validation schemas
export const PaymentMethodSchema = z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'])
export const ExpenseSourceSchema = z.enum(['manual', 'email_scrape', 'iphone_shortcut', 'api'])
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'MXN', 'CAD', 'AUD', 'JPY'])

export const CreateExpenseSchema = z.object({
    amount: z.number()
        .min(VALIDATION_CONSTRAINTS.AMOUNT_MIN, `Amount must be at least ${VALIDATION_CONSTRAINTS.AMOUNT_MIN}`)
        .max(VALIDATION_CONSTRAINTS.AMOUNT_MAX, `Amount must be at most ${VALIDATION_CONSTRAINTS.AMOUNT_MAX}`),
    currency: CurrencySchema.default('USD'),
    description: z.string()
        .min(1, 'Description is required')
        .max(500, 'Description must be 500 characters or less'),
    date: DateSchema,
    category_id: UUIDSchema.optional(),
    subcategory_id: UUIDSchema.optional(),
    merchant: z.string()
        .max(VALIDATION_CONSTRAINTS.MERCHANT_MAX_LENGTH,
            `Merchant must be ${VALIDATION_CONSTRAINTS.MERCHANT_MAX_LENGTH} characters or less`)
        .optional(),
    payment_method: PaymentMethodSchema.default('cash'),
    notes: z.string()
        .max(1000, 'Notes must be 1000 characters or less')
        .optional(),
    tags: z.array(z.string()).default([]),
    receipt_url: z.string().url('Invalid receipt URL').optional(),
})

export const UpdateExpenseSchema = CreateExpenseSchema.partial().extend({
    needs_review: z.boolean().optional(),
})

export const ExpenseFiltersSchema = z.object({
    date_from: DateSchema.optional(),
    date_to: DateSchema.optional(),
    category_id: UUIDSchema.optional(),
    category_ids: z.array(UUIDSchema).optional(),
    subcategory_id: UUIDSchema.optional(),
    subcategory_ids: z.array(UUIDSchema).optional(),
    merchant: z.string().optional(),
    payment_method: PaymentMethodSchema.optional(),
    payment_methods: z.array(PaymentMethodSchema).optional(),
    amount_min: z.coerce.number().min(0).optional(),
    amount_max: z.coerce.number().min(0).optional(),
    currency: CurrencySchema.optional(),
    source: ExpenseSourceSchema.optional(),
    sources: z.array(ExpenseSourceSchema).optional(),
    needs_review: z.coerce.boolean().optional(),
    has_receipt: z.coerce.boolean().optional(),
    tags: z.array(z.string()).optional(),
    description_contains: z.string().optional(),
    sort: z.enum(['date', 'amount', 'description', 'merchant', 'category_name', 'created_at', 'updated_at']).default('date'),
    order: SortDirectionSchema,
}).merge(PaginationSchema)

// Bulk operations schema
export const BulkExpenseOperationSchema = z.object({
    action: z.enum(['update', 'delete', 'categorize']),
    expense_ids: z.array(UUIDSchema).min(1, 'At least one expense ID is required'),
    data: UpdateExpenseSchema.optional(),
})

// Integration schemas
export const iPhoneShortcutExpenseSchema = z.object({
    amount: z.number().min(VALIDATION_CONSTRAINTS.AMOUNT_MIN),
    description: z.string().min(1).max(500),
    merchant: z.string().max(VALIDATION_CONSTRAINTS.MERCHANT_MAX_LENGTH).optional(),
    category_guess: z.string().optional(),
    date: DateSchema.optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().optional(),
    }).optional(),
    shortcut_metadata: z.object({
        shortcut_name: z.string(),
        device_name: z.string(),
        timestamp: z.string(),
    }),
})

export const EmailScrapedExpenseSchema = z.object({
    raw_email_content: z.string(),
    extracted_data: z.object({
        amount: z.number().min(VALIDATION_CONSTRAINTS.AMOUNT_MIN),
        merchant: z.string(),
        date: DateSchema,
        description: z.string().optional(),
        confidence_score: z.number().min(0).max(1),
    }),
    parsing_metadata: z.object({
        email_subject: z.string(),
        email_from: z.string(),
        email_date: z.string(),
        parser_version: z.string(),
    }),
})

// Validation helper functions
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
    try {
        return schema.parse(body)
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError('Invalid request body', error.errors)
        }
        throw error
    }
}

export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
    try {
        const params: Record<string, any> = Object.fromEntries(searchParams.entries())

        // Handle array parameters (e.g., category_ids=1,2,3)
        Object.keys(params).forEach(key => {
            if (key.endsWith('_ids') || key === 'tags' || key.endsWith('_methods') || key.endsWith('_sources')) {
                const value = params[key]
                if (typeof value === 'string' && value.includes(',')) {
                    params[key] = value.split(',').map(v => v.trim()).filter(Boolean)
                }
            }
        })

        return schema.parse(params)
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError('Invalid query parameters', error.errors)
        }
        throw error
    }
}

// Custom error class for validation errors
export class ValidationError extends Error {
    public errors: z.ZodIssue[]

    constructor(message: string, errors: z.ZodIssue[]) {
        super(message)
        this.name = 'ValidationError'
        this.errors = errors
    }
}

// Schema for stats date range
export const StatsDateRangeSchema = z.object({
    from: DateSchema.optional(),
    to: DateSchema.optional(),
    period: z.enum(['day', 'week', 'month', 'year']).optional(),
    category_id: UUIDSchema.optional(),
    category_ids: z.array(UUIDSchema).optional(),
}) 