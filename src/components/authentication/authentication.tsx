'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogIn, UserPlus } from 'lucide-react'
import Login from './login'
import Signup from './signup'
import PasswordRecovery from './password-recovery'
import EmailConfirmation from './email-confirmation'

type AuthView = 'tabs' | 'password-recovery' | 'email-confirmation'

export default function Authentication() {
    const [currentView, setCurrentView] = useState<AuthView>('tabs')
    const [signupEmail, setSignupEmail] = useState('')

    const handlePasswordRecovery = () => {
        setCurrentView('password-recovery')
    }

    const handleBackToLogin = () => {
        setCurrentView('tabs')
    }

    const handleSignupSuccess = (email: string) => {
        setSignupEmail(email)
        setCurrentView('email-confirmation')
    }

    const renderContent = () => {
        switch (currentView) {
            case 'password-recovery':
                return (
                    <div className="min-h-[400px] flex flex-col">
                        <PasswordRecovery onBack={handleBackToLogin} />
                    </div>
                )
            case 'email-confirmation':
                return (
                    <div className="min-h-[400px] flex flex-col">
                        <EmailConfirmation
                            email={signupEmail}
                            onBack={handleBackToLogin}
                        />
                    </div>
                )
            default:
                return (
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
                            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">
                                <LogIn className="w-4 h-4 mr-2" />
                                Iniciar Sesión
                            </TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Registrarse
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[400px] flex flex-col">
                            <TabsContent value="login" className="flex-1 m-0">
                                <Login onPasswordRecovery={handlePasswordRecovery} />
                            </TabsContent>

                            <TabsContent value="signup" className="flex-1 m-0">
                                <Signup onSignupSuccess={handleSignupSuccess} />
                            </TabsContent>
                        </div>
                    </Tabs>
                )
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center earth-gradient p-4">
            <div className="w-full max-w-md">
                <Card className=" border rounded-2xl shadow-none">
                    <CardHeader className="space-y-2 text-center pb-8">
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Bienvenido a Financy
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Tu rastreador de gastos personal
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {renderContent()}

                        {currentView === 'tabs' && (
                            <div className="mt-8 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
