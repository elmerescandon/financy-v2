import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
    const [user, setUser] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        let mounted = true
        let unsub: (() => void) | undefined

        const getUser = async () => {
            try {
                setLoading(true)
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setUser(null)
                    setLoading(false)
                    return
                }

                if (mounted) {
                    setUser(user?.id ?? null)
                    setLoading(false)
                }

                const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                    if (mounted) setUser(session?.user?.id ?? null)
                })
                unsub = listener?.subscription?.unsubscribe
            } catch (error) {
                console.error(error)
            }
        }

        getUser()

        return () => {
            mounted = false
            if (unsub) unsub()
        }
    }, [])

    return { user, loading }
}
