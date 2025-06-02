'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navigation from './navigation'
import type { User } from '@supabase/supabase-js'

interface NavWrapperProps {
    children: React.ReactNode
}

export default function NavWrapper({ children }: NavWrapperProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Don't render navigation while loading or if no user
    if (loading) {
        return <>{children}</>
    }

    if (!user) {
        return <>{children}</>
    }

    return (
        <Navigation user={user}>
            {children}
        </Navigation>
    )
} 