'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface EmailConfirmationProps {
    email: string
    onBack: () => void
}

export default function EmailConfirmation({ email, onBack }: EmailConfirmationProps) {
    const [isResending, setIsResending] = useState(false)

    const handleResendEmail = async () => {
        setIsResending(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            })

            if (error) {
                console.error('Resend email error:', error)
                toast.error('Error al reenviar', {
                    description: 'No se pudo reenviar el correo de confirmación. Inténtalo de nuevo.'
                })
            } else {
                toast.success('Correo reenviado', {
                    description: 'Se ha enviado un nuevo correo de confirmación'
                })
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            toast.error('Error inesperado', {
                description: 'No se pudo reenviar el correo. Inténtalo más tarde.'
            })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="space-y-6 text-center flex flex-col h-full">
            <div className="flex-1 space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-secondary" />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-secondary" />
                        <h3 className="text-lg font-semibold text-foreground">
                            ¡Cuenta Creada!
                        </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Hemos enviado un enlace de confirmación a tu correo electrónico
                    </p>
                    <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm font-medium text-foreground break-all">
                            {email}
                        </p>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex items-start space-x-2">
                        <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div className="text-left">
                            <p className="mb-2 font-medium">Instrucciones:</p>
                            <ul className="space-y-1">
                                <li>• Revisa tu bandeja de entrada</li>
                                <li>• No olvides verificar la carpeta de spam</li>
                                <li>• Haz clic en el enlace para activar tu cuenta</li>
                                <li>• El enlace expira en 24 horas</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <p className="text-xs text-muted-foreground mb-3">
                        ¿No recibiste el correo?
                    </p>
                    <Button
                        onClick={handleResendEmail}
                        variant="outline"
                        size="sm"
                        className="text-sm mb-4"
                        disabled={isResending}
                    >
                        {isResending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin mr-2" />
                                Reenviando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reenviar correo
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Button
                onClick={onBack}
                variant="outline"
                className="w-full h-12 mt-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
            </Button>
        </div>
    )
} 