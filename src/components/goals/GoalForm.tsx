'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { CreateGoalData } from '@/types/goal'
import type { GoalInsight } from '@/types/goal'

interface GoalFormProps {
    initialData?: GoalInsight | null
    onSubmit: (data: CreateGoalData) => Promise<void>
    onCancel: () => void
}

export function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<CreateGoalData>({
        name: initialData?.name || '',
        target_amount: initialData?.target_amount || 0,
        target_date: initialData?.target_date || ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Set minimum date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido'
        } else if (formData.name.length > 100) {
            newErrors.name = 'El nombre no puede exceder 100 caracteres'
        }

        if (!formData.target_amount || formData.target_amount <= 0) {
            newErrors.target_amount = 'El monto objetivo debe ser mayor a 0'
        } else if (formData.target_amount > 999999999.99) {
            newErrors.target_amount = 'El monto es demasiado grande'
        }

        if (!formData.target_date) {
            newErrors.target_date = 'La fecha objetivo es requerida'
        } else if (new Date(formData.target_date) <= new Date()) {
            newErrors.target_date = 'La fecha objetivo debe ser futura'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof CreateGoalData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            await onSubmit(formData)
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>
                    {initialData ? 'Editar Meta' : 'Crear Nueva Meta'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-sm font-medium pb-2">Nombre de la Meta *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Fondo de emergencia"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={errors.name ? 'border-destructive' : ''}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="target_amount" className="text-sm font-medium pb-2">Monto Objetivo *</Label>
                            <Input
                                id="target_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.target_amount || ''}
                                onChange={(e) => handleInputChange('target_amount', parseFloat(e.target.value) || 0)}
                                className={errors.target_amount ? 'border-destructive' : ''}
                                required
                            />
                            {errors.target_amount && (
                                <p className="text-sm text-destructive mt-1">{errors.target_amount}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="target_date" className="text-sm font-medium pb-2">Fecha Objetivo *</Label>
                            <Input
                                id="target_date"
                                type="date"
                                min={minDate}
                                value={formData.target_date}
                                onChange={(e) => handleInputChange('target_date', e.target.value)}
                                className={errors.target_date ? 'border-destructive' : ''}
                                required
                            />
                            {errors.target_date && (
                                <p className="text-sm text-destructive mt-1">{errors.target_date}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name || !formData.target_amount}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? 'Actualizar' : 'Crear'} Meta
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
} 