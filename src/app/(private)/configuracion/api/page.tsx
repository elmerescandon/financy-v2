'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Eye, EyeOff, RefreshCw, Smartphone, Mail, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function ApiKeysPage() {
    const [jwtToken, setJwtToken] = useState<string>('')
    const [showToken, setShowToken] = useState(false)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const getTokenAndUser = async () => {
            const supabase = createClient()

            // Get current session
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                setJwtToken(session.access_token)
                setUser(session.user)
            }

            setLoading(false)
        }

        getTokenAndUser()
    }, [])

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Copiado al portapapeles')
        } catch (err) {
            toast.error('Error al copiar')
        }
    }

    const refreshToken = async () => {
        setLoading(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase.auth.refreshSession()

            if (error) throw error

            if (data.session) {
                setJwtToken(data.session.access_token)
                toast.success('Token actualizado')
            }
        } catch (error) {
            toast.error('Error al actualizar el token')
        } finally {
            setLoading(false)
        }
    }

    const testApi = async () => {
        try {
            const response = await fetch('/api/integrations/test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ test: 'API key validation' })
            })

            const result = await response.json()

            if (response.ok) {
                toast.success('API key funciona correctamente')
            } else {
                toast.error(`Error: ${result.message}`)
            }
        } catch (error) {
            toast.error('Error al probar la API')
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Cargando configuración...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-warm-gray-900">Configuración API</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona tus claves API para integraciones externas
                </p>
            </div>

            <Tabs defaultValue="api-key" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="api-key">API Key</TabsTrigger>
                    <TabsTrigger value="iphone">iPhone Shortcuts</TabsTrigger>
                    <TabsTrigger value="email">Email Integration</TabsTrigger>
                </TabsList>

                <TabsContent value="api-key" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge variant="secondary">JWT Token</Badge>
                                Tu clave API actual
                            </CardTitle>
                            <CardDescription>
                                Usa este token para autenticar tus integraciones externas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Token de acceso</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type={showToken ? 'text' : 'password'}
                                        value={jwtToken}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowToken(!showToken)}
                                    >
                                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(jwtToken)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={testApi} variant="outline">
                                    Probar API
                                </Button>
                                <Button onClick={refreshToken} variant="outline">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Actualizar Token
                                </Button>
                            </div>

                            <div className="bg-muted p-4 rounded-md">
                                <h4 className="font-medium mb-2">Información del usuario</h4>
                                <div className="text-sm space-y-1">
                                    <p><strong>Email:</strong> {user?.email}</p>
                                    <p><strong>ID:</strong> <code className="bg-background px-1 rounded">{user?.id}</code></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="iphone" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                iPhone Shortcuts
                            </CardTitle>
                            <CardDescription>
                                Configura Siri para crear gastos por voz
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-medium">Configuración rápida:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm">
                                    <li>Abre la app "Atajos" en tu iPhone</li>
                                    <li>Toca el "+" para crear un nuevo atajo</li>
                                    <li>Añade la acción "Obtener contenido de URL"</li>
                                    <li>Configura la URL: <code className="bg-muted px-1 rounded">{window.location.origin}/api/integrations/expenses</code></li>
                                    <li>Método: POST</li>
                                    <li>Headers: Authorization: Bearer [tu token]</li>
                                </ol>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-md">
                                <h4 className="font-medium mb-2">Ejemplo de comando de voz:</h4>
                                <p className="text-sm">"Hey Siri, gasto 15 euros en café"</p>
                            </div>

                            <Button variant="outline" className="w-full">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver guía completa
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Integración por Email
                            </CardTitle>
                            <CardDescription>
                                Extrae gastos automáticamente de tus emails bancarios
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-medium">Bancos compatibles:</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <Badge variant="outline">BBVA</Badge>
                                    <Badge variant="outline">Santander</Badge>
                                    <Badge variant="outline">CaixaBank</Badge>
                                    <Badge variant="outline">PayPal</Badge>
                                    <Badge variant="outline">Bizum</Badge>
                                    <Badge variant="outline">N26</Badge>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-md">
                                <h4 className="font-medium mb-2">Estado:</h4>
                                <p className="text-sm">Funcionalidad en desarrollo. Próximamente disponible.</p>
                            </div>

                            <Button variant="outline" className="w-full" disabled>
                                <Mail className="h-4 w-4 mr-2" />
                                Configurar Email Parser
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 