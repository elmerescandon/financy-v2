import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
        prompt: 'consent' // Force consent screen to get refresh token
    });
}

export async function getTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

export function setCredentials(tokens: any) {
    oauth2Client.setCredentials(tokens);
    return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function refreshTokens(refreshToken: string) {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
}

export async function getGmailWithRefresh(tokens: any) {
    oauth2Client.setCredentials(tokens);

    try {
        // Test the credentials
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        await gmail.users.getProfile({ userId: 'me' });
        return gmail;
    } catch (error: any) {
        if (error.code === 401 && tokens.refresh_token) {
            // Refresh the token
            const newTokens = await refreshTokens(tokens.refresh_token);
            oauth2Client.setCredentials(newTokens);
            return google.gmail({ version: 'v1', auth: oauth2Client });
        }
        throw error;
    }
}

export async function validateGmailAccess(tokens: any): Promise<{ valid: boolean; email?: string; error?: string }> {
    try {
        const gmail = await getGmailWithRefresh(tokens);
        const profile = await gmail.users.getProfile({ userId: 'me' });

        return {
            valid: true,
            email: profile.data.emailAddress || undefined
        };
    } catch (error: any) {
        return {
            valid: false,
            error: error.message
        };
    }
}

export async function getGmailStats(tokens: any): Promise<{ messageCount: number; threadsCount: number }> {
    try {
        const gmail = await getGmailWithRefresh(tokens);
        const profile = await gmail.users.getProfile({ userId: 'me' });

        return {
            messageCount: profile.data.messagesTotal || 0,
            threadsCount: profile.data.threadsTotal || 0
        };
    } catch (error) {
        throw new Error('Failed to get Gmail stats');
    }
}

export { oauth2Client }; 