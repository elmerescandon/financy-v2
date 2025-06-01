'use client'

import { useState } from 'react'
import { signup } from '@/app/login/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface SignupProps {
    onSignupSuccess: (email: string) => void
}

export default function Signup({ onSignupSuccess }: SignupProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        try {
            const email = formData.get('email') as string
            await signup(formData)
            // If signup was successful (no error thrown), show confirmation
            toast.success('¡Cuenta creada exitosamente!', {
                description: 'Revisa tu correo para confirmar tu cuenta'
            })
            onSignupSuccess(email)
        } catch (error) {
            console.error('Signup error:', error)
            toast.error('Error al crear la cuenta', {
                description: 'El correo ya está registrado o hubo un problema. Inténtalo de nuevo.'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <form action={handleSubmit} className="space-y-4 flex-1">
                <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                        Correo Electrónico
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="tu@ejemplo.com"
                            required
                            className="pl-10 h-12 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                        Contraseña
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Crea una contraseña segura"
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

                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg min-h-[64px] flex flex-col justify-center">
                    <p className="mb-1">La contraseña debe contener:</p>
                    <ul className="space-y-1">
                        <li>• Al menos 8 caracteres</li>
                        <li>• Combinación de letras y números</li>
                        <li>• Al menos una letra mayúscula</li>
                    </ul>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 warm-gradient border-0"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Creando Cuenta...</span>
                        </div>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Crear Cuenta
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
