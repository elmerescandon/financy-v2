import { createAuthenticatedClient } from './database'
import { AuthenticationError, handleApiError } from './errors'
import { corsHeaders, methodNotAllowedResponse, preflightResponse } from './responses'
import type { User } from '@supabase/supabase-js'

// Authentication middleware
export async function requireAuth(request: Request): Promise<{ user: User; supabase: any }> {
    try {
        const { user, supabase } = await createAuthenticatedClient()
        return { user, supabase }
    } catch (error) {
        throw new AuthenticationError('Authentication required')
    }
}

// CORS middleware
export function withCors<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T,
    allowedOrigins?: string[]
): T {
    return (async (request: Request, ...args: any[]) => {
        const origin = request.headers.get('Origin')

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return preflightResponse(origin || undefined)
        }

        // Check if origin is allowed
        if (allowedOrigins && origin && !allowedOrigins.includes(origin)) {
            return new Response('Origin not allowed', { status: 403 })
        }

        try {
            const response = await handler(request, ...args)

            // Add CORS headers to response
            const corsHeadersObj = corsHeaders(origin || undefined)
            Object.entries(corsHeadersObj).forEach(([key, value]) => {
                response.headers.set(key, value)
            })

            return response
        } catch (error) {
            return handleApiError(error)
        }
    }) as T
}

// Method validation middleware
export function withMethods<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T,
    allowedMethods: string[]
): T {
    return (async (request: Request, ...args: any[]) => {
        if (!allowedMethods.includes(request.method)) {
            return methodNotAllowedResponse(allowedMethods)
        }

        return handler(request, ...args)
    }) as T
}

// Rate limiting middleware (basic implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T,
    options: {
        windowMs: number
        maxRequests: number
        keyGenerator?: (request: Request) => string
    }
): T {
    return (async (request: Request, ...args: any[]) => {
        const key = options.keyGenerator
            ? options.keyGenerator(request)
            : request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP') || 'unknown'

        const now = Date.now()
        const windowStart = now - options.windowMs

        // Clean up old entries
        for (const [k, v] of rateLimitStore.entries()) {
            if (v.resetTime < windowStart) {
                rateLimitStore.delete(k)
            }
        }

        const current = rateLimitStore.get(key) || { count: 0, resetTime: now + options.windowMs }

        if (current.count >= options.maxRequests && current.resetTime > now) {
            const retryAfter = Math.ceil((current.resetTime - now) / 1000)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Rate limit exceeded',
                    code: 'RATE_LIMIT_EXCEEDED'
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': retryAfter.toString()
                    }
                }
            )
        }

        // Update counter
        current.count++
        rateLimitStore.set(key, current)

        return handler(request, ...args)
    }) as T
}

// Error handling middleware
export function withErrorHandling<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T
): T {
    return (async (request: Request, ...args: any[]) => {
        try {
            return await handler(request, ...args)
        } catch (error) {
            return handleApiError(error)
        }
    }) as T
}

// Content type validation middleware
export function withJsonBody<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T
): T {
    return (async (request: Request, ...args: any[]) => {
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
            const contentType = request.headers.get('Content-Type')
            if (!contentType || !contentType.includes('application/json')) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Content-Type must be application/json',
                        code: 'INVALID_CONTENT_TYPE'
                    }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            }
        }

        return handler(request, ...args)
    }) as T
}

// Combined middleware composer
export function createApiHandler<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T,
    options?: {
        auth?: boolean
        methods?: string[]
        cors?: boolean | string[]
        rateLimit?: {
            windowMs: number
            maxRequests: number
            keyGenerator?: (request: Request) => string
        }
        jsonBody?: boolean
    }
): T {
    let wrappedHandler = handler

    // Apply middlewares in reverse order (last applied runs first)

    // Error handling (outermost)
    wrappedHandler = withErrorHandling(wrappedHandler)

    // Rate limiting
    if (options?.rateLimit) {
        wrappedHandler = withRateLimit(wrappedHandler, options.rateLimit)
    }

    // CORS
    if (options?.cors) {
        const allowedOrigins = Array.isArray(options.cors) ? options.cors : undefined
        wrappedHandler = withCors(wrappedHandler, allowedOrigins)
    }

    // Method validation
    if (options?.methods) {
        wrappedHandler = withMethods(wrappedHandler, options.methods)
    }

    // JSON body validation
    if (options?.jsonBody) {
        wrappedHandler = withJsonBody(wrappedHandler)
    }

    // Authentication (innermost, closest to handler)
    if (options?.auth) {
        const originalHandler = wrappedHandler
        wrappedHandler = (async (request: Request, ...args: any[]) => {
            const { user, supabase } = await requireAuth(request)
            // Add user and supabase to the request context
            return originalHandler(request, { user, supabase }, ...args)
        }) as T
    }

    return wrappedHandler
}

// API key authentication (for integrations)
export async function validateApiKey(request: Request): Promise<string | null> {
    const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!apiKey) {
        return null
    }

    // In a real implementation, you would validate against a database
    // For now, just check against environment variable
    const validApiKey = process.env.API_KEY

    if (validApiKey && apiKey === validApiKey) {
        return apiKey
    }

    return null
}

// Request logging middleware (development only)
export function withLogging<T extends (request: Request, ...args: any[]) => Promise<Response>>(
    handler: T
): T {
    return (async (request: Request, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            const start = Date.now()
            console.log(`[API] ${request.method} ${request.url}`)

            const response = await handler(request, ...args)
            const duration = Date.now() - start

            console.log(`[API] ${request.method} ${request.url} - ${response.status} (${duration}ms)`)

            return response
        }

        return handler(request, ...args)
    }) as T
} 