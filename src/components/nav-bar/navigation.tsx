'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import {
    LogOut,
    User,
    Settings,
    CreditCard,
    PieChart,
    Home,
    TrendingUp,
    Receipt,
    Target,
    ChevronUp,
    Monitor,
    Moon,
    Sun,
    Palette,
    Mail,
    DollarSign
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NavigationProps {
    user?: {
        id: string
        email?: string
        user_metadata?: {
            full_name?: string
            avatar_url?: string
        }
    }
    children: React.ReactNode
}

export default function Navigation({ user, children }: NavigationProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signOut()

            if (error) {
                toast.error('Error al cerrar sesión', {
                    description: 'No se pudo cerrar la sesión. Inténtalo de nuevo.'
                })
            } else {
                toast.success('Sesión cerrada', {
                    description: 'Has cerrado sesión exitosamente'
                })
                router.push('/login')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Error inesperado', {
                description: 'Ocurrió un problema al cerrar sesión'
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    const getUserDisplayName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name
        }
        if (user?.email) {
            return user.email.split('@')[0]
        }
        return 'Usuario'
    }

    const getUserInitials = () => {
        const name = getUserDisplayName()
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const navigationItems = [
        { icon: Receipt, label: 'Gastos', href: '/gastos' },
        { icon: DollarSign, label: 'Ingresos', href: '/ingresos' },
        { icon: PieChart, label: 'Presupuestos', href: '/presupuesto' },
        { icon: Target, label: 'Metas', href: '/metas' },
    ]

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <Sidebar className="border-r border-border/50 bg-card/95 backdrop-blur-sm">
                    <SidebarHeader className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl warm-gradient flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-foreground">
                                    Financy
                                </span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
                                Navegación
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigationItems.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                onClick={() => router.push(item.href)}
                                                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group cursor-pointer"
                                            >
                                                <item.icon className="w-5 h-5 mr-3 group-hover:text-primary transition-colors" />
                                                <span className="font-medium">{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start p-3 h-auto hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <Avatar className="h-8 w-8 mr-3">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar" />
                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-none text-foreground truncate max-w-full">
                                            {getUserDisplayName()}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground truncate max-w-full mt-1">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 mb-2"
                                align="end"
                                alignOffset={-4}
                                side="top"
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {getUserDisplayName()}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/configuracion')} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configuración</span>
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="cursor-pointer">
                                        <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span className='ml-2'>Tema</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                                            <Sun className="mr-2 h-4 w-4" />
                                            <span>Claro</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                                            <Moon className="mr-2 h-4 w-4" />
                                            <span>Oscuro</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("system")}>
                                            <Monitor className="mr-2 h-4 w-4" />
                                            <span>Sistema</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem onClick={() => router.push('/configuracion/api')} className="cursor-pointer">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>API Keys</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/configuracion/gmail')} className="cursor-pointer">
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Gmail Integration</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-muted-foreground hidden sm:block">
                                    ¡Hola, {getUserDisplayName()}!
                                </span>
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