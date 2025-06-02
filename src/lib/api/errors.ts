import { z } from 'zod'

// Base API error class
export class ApiError extends Error {
    public status: number
    public code: string
    public details?: any

    constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.details = details
    }
}

// Specific error classes
export class ValidationError extends ApiError {
    constructor(message: string = 'Validation failed', errors?: z.ZodIssue[]) {
        super(message, 400, 'VALIDATION_ERROR', errors)
    }
}

export class AuthenticationError extends ApiError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR')
    }
}

export class AuthorizationError extends ApiError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR')
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND')
    }
}

export class ConflictError extends ApiError {
    constructor(message: string = 'Resource conflict') {
        super(message, 409, 'CONFLICT')
    }
}

export class DatabaseError extends ApiError {
    constructor(message: string = 'Database operation failed', details?: any) {
        super(message, 500, 'DATABASE_ERROR', details)
    }
}

export class IntegrationError extends ApiError {
    constructor(message: string = 'Integration service error', details?: any) {
        super(message, 502, 'INTEGRATION_ERROR', details)
    }
}

// Error mapping for common Supabase/Postgres errors
export function mapDatabaseError(error: any): ApiError {
    const message = error.message || 'Database operation failed'

    // PostgreSQL error codes
    switch (error.code) {
        case '23505': // unique_violation
            return new ConflictError('Resource already exists')

        case '23503': // foreign_key_violation
            return new ValidationError('Referenced resource does not exist')

        case '23502': // not_null_violation
            return new ValidationError('Required field is missing')

        case '23514': // check_violation
            return new ValidationError('Data violates constraints')

        case 'PGRST116': // Supabase: no rows returned
            return new NotFoundError('Resource not found')

        case 'PGRST301': // Supabase: row level security violation
            return new AuthorizationError('Access denied to resource')

        case 'PGRST204': // Supabase: schema cache reload
            return new ApiError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE')

        default:
            // Log unexpected database errors for debugging
            console.error('Unexpected database error:', error)
            return new DatabaseError(message, {
                code: error.code,
                hint: error.hint,
                detail: error.detail
            })
    }
}

// Global error handler for API routes
export function handleApiError(error: unknown): Response {
    console.error('API Error:', error)

    if (error instanceof ApiError) {
        return Response.json({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
        }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
        return Response.json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
                code: err.code
            }))
        }, { status: 400 })
    }

    // Handle unknown errors
    return Response.json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    }, { status: 500 })
}

// Async error wrapper for API handlers
export function withErrorHandling<T extends any[], R>(
    handler: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R> => {
        try {
            return await handler(...args)
        } catch (error) {
            // Transform database errors
            if (error && typeof error === 'object' && 'code' in error) {
                throw mapDatabaseError(error)
            }

            // Re-throw ApiErrors as-is
            if (error instanceof ApiError) {
                throw error
            }

            // Wrap unknown errors
            throw new ApiError(
                error instanceof Error ? error.message : 'Unknown error occurred'
            )
        }
    }
}

// Validation error formatter
export function formatValidationErrors(errors: z.ZodIssue[]): Record<string, string> {
    const formatted: Record<string, string> = {}

    errors.forEach(error => {
        const path = error.path.join('.')
        formatted[path] = error.message
    })

    return formatted
}

// Check if error is a specific type
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}

export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
    return error instanceof AuthenticationError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError
} 