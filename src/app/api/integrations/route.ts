import { NextResponse } from 'next/server'
import { getApiKeyInstructions } from '@/lib/api/auth'

export async function GET() {
    return NextResponse.json({
        title: 'Financy Integration API',
        version: '1.0.0',
        description: 'API for creating expenses from external sources (iPhone shortcuts, email scraper)',

        authentication: getApiKeyInstructions(),

        endpoints: {
            '/api/integrations/test': {
                methods: ['GET', 'POST'],
                description: 'Test endpoint to verify API key authentication'
            },
            '/api/integrations/expenses': {
                methods: ['GET', 'POST'],
                description: 'Create expenses from external sources'
            }
        },

        examples: {
            iphone_shortcut: {
                description: 'Create expense from iPhone Siri shortcut',
                request: {
                    method: 'POST',
                    url: '/api/integrations/expenses',
                    headers: {
                        'Authorization': 'Bearer <your-jwt-token>',
                        'Content-Type': 'application/json'
                    },
                    body: {
                        amount: 15.50,
                        description: 'Café con leche',
                        source: 'iphone',
                        merchant: 'Starbucks',
                        category: 'Food & Dining',
                        payment_method: 'tarjeta_credito'
                    }
                }
            },

            email_scraper: {
                description: 'Create expense from email transaction parsing',
                request: {
                    method: 'POST',
                    url: '/api/integrations/expenses',
                    headers: {
                        'Authorization': 'Bearer <your-jwt-token>',
                        'Content-Type': 'application/json'
                    },
                    body: {
                        amount: 85.00,
                        description: 'Compra en supermercado',
                        source: 'email',
                        merchant: 'Mercadona',
                        category: 'Shopping',
                        date: '2024-01-15',
                        confidence_score: 0.92,
                        raw_data: {
                            email_subject: 'Compra realizada - Mercadona',
                            transaction_id: 'TXN123456789'
                        }
                    }
                }
            }
        },

        response_format: {
            success: {
                success: true,
                data: {
                    id: 'expense-uuid',
                    amount: 15.50,
                    description: 'Café con leche',
                    category: 'Food & Dining',
                    source: 'iphone',
                    needs_review: false,
                    created_at: '2024-01-15T10:30:00Z'
                },
                message: 'Expense created successfully from iphone'
            },
            error: {
                error: 'Validation failed',
                details: [
                    {
                        code: 'too_small',
                        minimum: 0.01,
                        type: 'number',
                        inclusive: false,
                        exact: false,
                        message: 'Amount must be greater than 0',
                        path: ['amount']
                    }
                ]
            }
        }
    })
} 