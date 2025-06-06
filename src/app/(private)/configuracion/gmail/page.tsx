import { GmailConnection } from '@/components/gmail-connection'

export default function GmailConfigPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gmail Integration</h1>
                <p className="text-muted-foreground">
                    Connect your Gmail account to automatically import expenses from receipts and transaction emails.
                </p>
            </div>

            <GmailConnection />
        </div>
    )
} 