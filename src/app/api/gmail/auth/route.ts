import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl, getTokens } from '@/lib/gmail';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        // Redirect to Google OAuth
        const authUrl = getAuthUrl();
        return NextResponse.redirect(authUrl);
    }

    try {
        // Exchange code for tokens
        const tokens = await getTokens(code);

        // Store tokens in Supabase
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await supabase
            .from('user_gmail_tokens')
            .upsert({
                user_id: user.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                updated_at: new Date()
            });

        return NextResponse.redirect(new URL('/dashboard?gmail=connected', request.url));
    } catch (error) {
        console.error('Gmail auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
} 