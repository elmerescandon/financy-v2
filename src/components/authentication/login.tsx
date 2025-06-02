'use client'

import { useState } from 'react'
import { login } from '@/app/login/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LoginProps {
    onPasswordRecovery: () => void
}

export default function Login({ onPasswordRecovery }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        try {
            const user = await login(formData)
            toast.success('¡Inicio de sesión exitoso!', {
                description: 'Bienvenido de vuelta a Financy'
            })
            console.log("user", user)
            router.push('/home')
        } catch (error) {
            console.log("error", error)
            // console.error('Login error:', error)
            // toast.error('Error al iniciar sesión', {
            //     description: 'Credenciales incorrectas. Verifica tu email y contraseña.'
            // })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <form action={handleSubmit} className="space-y-4 flex-1">
                <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                        Correo Electrónico
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="tu@ejemplo.com"
                            required
                            className="pl-10 h-12 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                        Contraseña
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu contraseña"
                            required
                            className="pl-10 pr-12 h-12 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="text-right">
                    <button
                        type="button"
                        onClick={onPasswordRecovery}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Spacer to maintain consistent height with signup form */}
                <div className="h-16 flex items-center justify-center">
                    <div className="text-xs text-muted-foreground text-center">
                        <p>Inicia sesión para acceder a tu cuenta</p>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 warm-gradient border-0"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Iniciando Sesión...</span>
                        </div>
                    ) : (
                        <>
                            <LogIn className="w-4 h-4 mr-2" />
                            Iniciar Sesión
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
