import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface ApiKeyValidationResult {
    success: boolean
    user?: any
    error?: string
}

export async function validateApiKey(request: NextRequest): Promise<ApiKeyValidationResult> {
    try {
        // Extract API key from Authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return { success: false, error: 'Missing Authorization header' }
        }

        // Check for Bearer token format
        const apiKey = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader

        if (!apiKey) {
            return { success: false, error: 'Invalid API key format' }
        }

        // Get Supabase client
        const supabase = await createClient()

        // For now, we'll use a simple approach where the API key is the user's JWT token
        // In production, you might want to create separate API keys table

        // Verify the JWT token
        const { data: { user }, error } = await supabase.auth.getUser(apiKey)

        if (error || !user) {
            return { success: false, error: 'Invalid API key' }
        }

        return { success: true, user }

    } catch (error) {
        console.error('API key validation error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
        }
    }
}

// Helper function to generate API instructions for users
export function getApiKeyInstructions() {
    return {
        description: 'Use your JWT token as API key for external integrations',
        format: 'Bearer <your-jwt-token>',
        example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        note: 'Get your JWT token from Settings → API Keys in the Financy app',
        app_location: '/configuracion/api'
    }
} 