import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, getApiKeyInstructions } from '@/lib/api/auth'

export async function POST(request: NextRequest) {
    try {
        // Validate API key
        const authResult = await validateApiKey(request)
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized', message: authResult.error },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()

        return NextResponse.json({
            success: true,
            message: 'Integration API is working!',
            user: {
                id: authResult.user.id,
                email: authResult.user.email
            },
            received_data: body,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        return NextResponse.json(
            {
                error: 'Test failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'Integration API Test Endpoint',
        description: 'Use POST to test your API key authentication',
        instructions: getApiKeyInstructions(),
        example_request: {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer <your-jwt-token>',
                'Content-Type': 'application/json'
            },
            body: {
                test_data: 'hello world'
            }
        }
    })
} 