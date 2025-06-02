import { PaginationResult } from './database'

// Standard success response
export function successResponse<T>(
    data: T,
    status: number = 200,
    headers?: HeadersInit
): Response {
    return Response.json({
        success: true,
        data
    }, {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    })
}

// Paginated response
export function paginatedResponse<T>(
    data: T[],
    pagination: PaginationResult,
    status: number = 200,
    headers?: HeadersInit
): Response {
    return Response.json({
        success: true,
        data,
        pagination
    }, {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    })
}

// Created response (201)
export function createdResponse<T>(
    data: T,
    headers?: HeadersInit
): Response {
    return successResponse(data, 201, headers)
}

// No content response (204)
export function noContentResponse(headers?: HeadersInit): Response {
    return new Response(null, {
        status: 204,
        headers: {
            ...headers
        }
    })
}

// Error response
export function errorResponse(
    message: string,
    status: number = 400,
    code: string = 'ERROR',
    details?: any,
    headers?: HeadersInit
): Response {
    return Response.json({
        success: false,
        error: message,
        code,
        details
    }, {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    })
}

// Validation error response
export function validationErrorResponse(
    message: string = 'Validation failed',
    errors: Record<string, string> = {},
    headers?: HeadersInit
): Response {
    return errorResponse(
        message,
        400,
        'VALIDATION_ERROR',
        { fields: errors },
        headers
    )
}

// Not found response
export function notFoundResponse(
    message: string = 'Resource not found',
    headers?: HeadersInit
): Response {
    return errorResponse(message, 404, 'NOT_FOUND', undefined, headers)
}

// Unauthorized response
export function unauthorizedResponse(
    message: string = 'Authentication required',
    headers?: HeadersInit
): Response {
    return errorResponse(message, 401, 'UNAUTHORIZED', undefined, headers)
}

// Forbidden response
export function forbiddenResponse(
    message: string = 'Access denied',
    headers?: HeadersInit
): Response {
    return errorResponse(message, 403, 'FORBIDDEN', undefined, headers)
}

// Conflict response
export function conflictResponse(
    message: string = 'Resource conflict',
    headers?: HeadersInit
): Response {
    return errorResponse(message, 409, 'CONFLICT', undefined, headers)
}

// Internal server error response
export function internalErrorResponse(
    message: string = 'Internal server error',
    headers?: HeadersInit
): Response {
    return errorResponse(message, 500, 'INTERNAL_ERROR', undefined, headers)
}

// Method not allowed response
export function methodNotAllowedResponse(
    allowedMethods: string[] = [],
    headers?: HeadersInit
): Response {
    return errorResponse(
        'Method not allowed',
        405,
        'METHOD_NOT_ALLOWED',
        { allowed_methods: allowedMethods },
        {
            'Allow': allowedMethods.join(', '),
            ...headers
        }
    )
}

// Rate limit response
export function rateLimitResponse(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    headers?: HeadersInit
): Response {
    const responseHeaders: Record<string, string> = {
        ...headers as Record<string, string>
    }

    if (retryAfter) {
        responseHeaders['Retry-After'] = retryAfter.toString()
    }

    return errorResponse(
        message,
        429,
        'RATE_LIMIT_EXCEEDED',
        { retry_after: retryAfter },
        responseHeaders
    )
}

// CORS headers for integration endpoints
export function corsHeaders(origin?: string): HeadersInit {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
    }
}

// Response with CORS headers
export function corsResponse<T>(
    data: T,
    status: number = 200,
    origin?: string
): Response {
    return successResponse(data, status, corsHeaders(origin))
}

// Preflight OPTIONS response
export function preflightResponse(origin?: string): Response {
    return new Response(null, {
        status: 200,
        headers: corsHeaders(origin)
    })
}

// Statistics response with metadata
export function statsResponse<T>(
    data: T,
    metadata?: {
        generated_at?: string
        cache_duration?: number
        data_range?: { from: string; to: string }
    }
): Response {
    return Response.json({
        success: true,
        data,
        metadata: {
            generated_at: new Date().toISOString(),
            ...metadata
        }
    })
}

// Bulk operation response
export function bulkOperationResponse<T>(
    results: T[],
    summary: {
        total: number
        success: number
        failed: number
        errors?: Array<{ id: string; error: string }>
    }
): Response {
    return Response.json({
        success: summary.failed === 0,
        data: results,
        summary
    }, {
        status: summary.failed === 0 ? 200 : 207 // 207 Multi-Status for partial success
    })
}

// File upload response
export function uploadResponse(
    fileUrl: string,
    metadata?: {
        filename?: string
        size?: number
        type?: string
    }
): Response {
    return createdResponse({
        url: fileUrl,
        metadata
    })
}

// Health check response
export function healthResponse(
    status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy',
    checks?: Record<string, {
        status: 'pass' | 'fail' | 'warn'
        message?: string
        duration?: number
    }>
): Response {
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

    return Response.json({
        status,
        timestamp: new Date().toISOString(),
        checks
    }, { status: httpStatus })
} 