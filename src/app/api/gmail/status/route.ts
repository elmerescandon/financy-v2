import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has Gmail tokens
        const { data: tokenData } = await supabase
            .from('user_gmail_tokens')
            .select('id, updated_at')
            .eq('user_id', user.id)
            .single();

        const isConnected = !!tokenData;

        return NextResponse.json({
            connected: isConnected,
            last_updated: tokenData?.updated_at || null
        });

    } catch (error) {
        console.error('Gmail status check error:', error);
        return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }
} 