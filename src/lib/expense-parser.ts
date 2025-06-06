interface ExpenseData {
    amount: number;
    merchant: string;
    date: Date;
    description: string;
    category?: string;
    currency?: string;
}

export function parseEmailToExpense(emailData: any): ExpenseData | null {
    const subject = emailData.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || '';
    const body = extractEmailBody(emailData);
    const sender = emailData.payload?.headers?.find((h: any) => h.name === 'From')?.value || '';

    // Skip non-financial emails
    if (!isFinancialEmail(subject, body, sender)) {
        return null;
    }

    const amount = extractAmount(body + ' ' + subject);
    const merchant = extractMerchant(body, subject, sender);
    const date = extractDate(emailData);

    if (!amount || !merchant) {
        return null;
    }

    return {
        amount,
        merchant,
        date,
        description: subject,
        category: categorizeExpense(merchant, subject, body),
        currency: 'USD'
    };
}

function extractEmailBody(emailData: any): string {
    let body = '';

    if (emailData.payload?.body?.data) {
        body = Buffer.from(emailData.payload.body.data, 'base64').toString();
    } else if (emailData.payload?.parts) {
        for (const part of emailData.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                body += Buffer.from(part.body.data, 'base64').toString();
            }
        }
    }

    return body;
}

function isFinancialEmail(subject: string, body: string, sender: string): boolean {
    const financialKeywords = [
        'transaction', 'payment', 'charge', 'purchase', 'receipt', 'invoice',
        'debit', 'credit', 'bank', 'card', 'venmo', 'paypal', 'chase', 'wells fargo'
    ];

    const text = (subject + ' ' + body + ' ' + sender).toLowerCase();
    return financialKeywords.some(keyword => text.includes(keyword));
}

function extractAmount(text: string): number | null {
    const patterns = [
        /\$(\d{1,3}(?:,\d{3})*\.?\d{0,2})/g,
        /(\d{1,3}(?:,\d{3})*\.?\d{0,2})\s*USD/g,
        /amount:?\s*\$?(\d{1,3}(?:,\d{3})*\.?\d{0,2})/gi
    ];

    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
            const amount = parseFloat(matches[0].replace(/[$,USD\s]/g, ''));
            if (amount > 0) return amount;
        }
    }

    return null;
}

function extractMerchant(body: string, subject: string, sender: string): string | null {
    // Try merchant patterns
    const merchantPatterns = [
        /at\s+([A-Z][A-Za-z\s&]+?)(?:\s+on|\s+\d)/gi,
        /from\s+([A-Z][A-Za-z\s&]+?)(?:\s+on|\s+\d)/gi,
        /merchant:?\s*([A-Za-z\s&]+)/gi
    ];

    for (const pattern of merchantPatterns) {
        const match = body.match(pattern);
        if (match?.[1]) {
            return match[1].trim();
        }
    }

    // Extract from sender domain
    const domainMatch = sender.match(/@([^.]+)/);
    if (domainMatch?.[1]) {
        return domainMatch[1].replace(/[_-]/g, ' ').toUpperCase();
    }

    return 'Unknown Merchant';
}

function extractDate(emailData: any): Date {
    const dateHeader = emailData.payload?.headers?.find((h: any) => h.name === 'Date')?.value;
    return dateHeader ? new Date(dateHeader) : new Date();
}

function categorizeExpense(merchant: string, subject: string, body: string): string {
    const text = (merchant + ' ' + subject + ' ' + body).toLowerCase();

    const categories = {
        'food': ['restaurant', 'food', 'uber eats', 'doordash', 'grubhub', 'starbucks', 'mcdonald'],
        'transportation': ['uber', 'lyft', 'gas', 'parking', 'metro', 'taxi'],
        'shopping': ['amazon', 'target', 'walmart', 'costco', 'purchase'],
        'utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
        'subscriptions': ['netflix', 'spotify', 'subscription', 'monthly'],
        'healthcare': ['pharmacy', 'doctor', 'medical', 'health'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }

    return 'other';
} 