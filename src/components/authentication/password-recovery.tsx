'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PasswordRecoveryProps {
    onBack: () => void
}

export default function PasswordRecovery({ onBack }: PasswordRecoveryProps) {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setError(error.message)
            } else {
                setIsSuccess(true)
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Inténtalo de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-secondary" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                        Correo Enviado
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
                    </p>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="mb-2">Revisa tu bandeja de entrada y spam</p>
                    <p>El enlace expirará en 1 hora</p>
                </div>

                <Button
                    onClick={onBack}
                    variant="outline"
                    className="w-full h-12"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio de sesión
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al inicio de sesión
                </button>

                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                        Recuperar Contraseña
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="recovery-email" className="text-sm font-medium">
                        Correo Electrónico
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="recovery-email"
                            type="email"
                            placeholder="tu@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 warm-gradient border-0"
                    disabled={isLoading || !email}
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                        </div>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Enlace de Recuperación
                        </>
                    )}
                </Button>
            </form>

            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p className="mb-1">¿No recuerdas tu correo electrónico?</p>
                <p>Contacta a nuestro soporte para obtener ayuda</p>
            </div>
        </div>
    )
}
