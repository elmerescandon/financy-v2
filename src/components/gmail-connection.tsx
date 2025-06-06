'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface GmailConnectionProps {
    onConnectionChange?: (connected: boolean) => void
}

export function GmailConnection({ onConnectionChange }: GmailConnectionProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        checkGmailConnection()
    }, [])

    const checkGmailConnection = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data } = await supabase
                .from('user_gmail_tokens')
                .select('id')
                .eq('user_id', user.id)
                .single()

            const connected = !!data
            setIsConnected(connected)
            onConnectionChange?.(connected)
        } catch (error) {
            console.error('Error checking Gmail connection:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const connectGmail = () => {
        window.location.href = '/api/gmail/auth'
    }

    const syncEmails = async () => {
        setIsSyncing(true)
        try {
            const response = await fetch('/api/gmail/sync?days=30', {
                method: 'POST'
            })

            const result = await response.json()

            if (result.success) {
                toast.success(`Synced ${result.processed} new expenses from ${result.total_emails} emails`)
            } else {
                toast.error('Sync failed: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            toast.error('Failed to sync emails')
        } finally {
            setIsSyncing(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-6">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Checking Gmail connection...
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Gmail Integration
                        </CardTitle>
                        <CardDescription>
                            Automatically import expenses from your Gmail receipts
                        </CardDescription>
                    </div>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                        {isConnected ? (
                            <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Connected
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isConnected ? (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            <p>Connect your Gmail account to:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Automatically detect purchase receipts</li>
                                <li>Extract transaction details</li>
                                <li>Create expenses from emails</li>
                            </ul>
                        </div>
                        <Button onClick={connectGmail} className="w-full">
                            <Mail className="h-4 w-4 mr-2" />
                            Connect Gmail Account
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            We only read emails to find receipts and transactions.
                            Your email content is processed securely and not stored.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Gmail account connected successfully
                        </div>
                        <Button
                            onClick={syncEmails}
                            disabled={isSyncing}
                            className="w-full"
                        >
                            {isSyncing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Syncing Emails...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Sync Recent Emails
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            This will scan your last 30 days of emails for receipts and transactions.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 