'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navigation from './navigation'
import type { User } from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NavWrapperProps {
    children: React.ReactNode
}

function NavigationSkeleton({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <Sidebar className="border-r border-border/50 bg-card/95 backdrop-blur-sm">
                    <SidebarHeader className="p-6">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="flex flex-col space-y-1">
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
                                <Skeleton className="h-3 w-20" />
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenuItem className='list-none'>
                                    <SidebarMenuButton>
                                        <Skeleton className="w-5 h-5 mr-3" />
                                        <Skeleton className="h-4 w-16" />
                                    </SidebarMenuButton>
                                    <div className="ml-8 mt-2 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </SidebarMenuItem>

                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="w-full justify-start">
                                            <Skeleton className="w-5 h-5 mr-3" />
                                            <Skeleton className="h-4 w-20" />
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4">
                        <div className="w-full justify-start p-3 h-auto">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex flex-col space-y-1 flex-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-4 w-4" />
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground cursor-pointer" />
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-32 hidden sm:block" />
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto bg-background p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default function NavWrapper({ children }: NavWrapperProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        const supabase = createClient()
        const initializeUser = async () => {
            try{
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)
                setLoading(false)
                return;
            } catch (error){
                toast("Un error ocurrió al iniciar sesión, inténtalo más tarde.")
                router.push('/login')
            }


        }
        initializeUser()
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    // Show skeleton while loading
    if (loading) {
        return <NavigationSkeleton>{children}</NavigationSkeleton>
    }

    if (!user) {
        router.push('/login')
        return <>{children}</>
    }

    return (
        <Navigation user={user}>
            {children}
        </Navigation>
    )
} 