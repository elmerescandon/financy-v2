'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createGoalSchema, type CreateGoalFormData } from '@/lib/validation/goal'
import type { CreateGoalData } from '@/types/goal'
import type { GoalInsight } from '@/types/goal'

interface GoalFormProps {
    initialData?: GoalInsight | null
    onSubmit: (data: CreateGoalData) => Promise<void>
    onCancel: () => void
}

export function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CreateGoalFormData>({
        resolver: zodResolver(createGoalSchema),
        defaultValues: {
            name: initialData?.name || '',
            target_amount: initialData?.target_amount || 0,
            target_date: initialData?.target_date || '',
            category_id: initialData?.category_id || '',
            budget_id: initialData?.budget_id || ''
        }
    })

    const handleFormSubmit = async (data: CreateGoalFormData) => {
        setLoading(true)
        try {
            await onSubmit(data)
            if (!initialData) {
                reset()
            }
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setLoading(false)
        }
    }

    // Set minimum date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Nombre de la Meta</Label>
                    <Input
                        id="name"
                        placeholder="Ej: Fondo de emergencia"
                        {...register('name')}
                        className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="target_amount">Monto Objetivo</Label>
                    <Input
                        id="target_amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('target_amount', { valueAsNumber: true })}
                        className={errors.target_amount ? 'border-destructive' : ''}
                    />
                    {errors.target_amount && (
                        <p className="text-sm text-destructive mt-1">{errors.target_amount.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="target_date">Fecha Objetivo</Label>
                    <Input
                        id="target_date"
                        type="date"
                        min={minDate}
                        {...register('target_date')}
                        className={errors.target_date ? 'border-destructive' : ''}
                    />
                    {errors.target_date && (
                        <p className="text-sm text-destructive mt-1">{errors.target_date.message}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? 'Guardando...' : initialData ? 'Actualizar Meta' : 'Crear Meta'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1"
                >
                    Cancelar
                </Button>
            </div>
        </form>
    )
} 