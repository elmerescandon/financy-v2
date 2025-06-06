import { NextRequest, NextResponse } from 'next/server';
import { setCredentials } from '@/lib/gmail';
import { parseEmailToExpense } from '@/lib/expense-parser';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's Gmail tokens
        const { data: tokenData } = await supabase
            .from('user_gmail_tokens')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!tokenData) {
            return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
        }

        // Setup Gmail API
        const gmail = setCredentials({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
        });

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const daysBack = parseInt(searchParams.get('days') || '7');
        const query = searchParams.get('query') || 'subject:(transaction OR receipt OR payment OR charge)';

        // Calculate date filter
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysBack);
        const dateQuery = `after:${Math.floor(fromDate.getTime() / 1000)}`;

        // Fetch emails
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: `${query} ${dateQuery}`,
            maxResults: 50,
        });

        const messages = response.data.messages || [];
        const processedExpenses = [];
        const errors = [];

        // Process each email
        for (const message of messages) {
            try {
                const emailData = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                });

                const expense = parseEmailToExpense(emailData.data);

                if (expense) {
                    // Check if expense already exists
                    const { data: existing } = await supabase
                        .from('expenses')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('description', expense.description)
                        .eq('amount', expense.amount)
                        .eq('merchant', expense.merchant)
                        .single();

                    if (!existing) {
                        // Save new expense
                        const { data: newExpense, error } = await supabase
                            .from('expenses')
                            .insert({
                                user_id: user.id,
                                amount: expense.amount,
                                merchant: expense.merchant,
                                description: expense.description,
                                category: expense.category,
                                date: expense.date.toISOString(),
                                source: 'gmail',
                                metadata: { gmail_message_id: message.id }
                            })
                            .select()
                            .single();

                        if (error) {
                            errors.push(`Failed to save expense: ${error.message}`);
                        } else {
                            processedExpenses.push(newExpense);
                        }
                    }
                }
            } catch (error) {
                errors.push(`Failed to process message ${message.id}: ${error}`);
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedExpenses.length,
            total_emails: messages.length,
            expenses: processedExpenses,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Gmail sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
} 