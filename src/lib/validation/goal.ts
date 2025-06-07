import { z } from 'zod'

export const createGoalSchema = z.object({
    name: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    target_amount: z.number()
        .positive('El monto objetivo debe ser mayor a 0')
        .max(999999999.99, 'El monto es demasiado grande'),
    target_date: z.string()
        .min(1, 'La fecha objetivo es requerida')
        .refine(date => new Date(date) > new Date(), 'La fecha objetivo debe ser futura')
})

export const updateGoalSchema = createGoalSchema.partial()

export const createGoalEntrySchema = z.object({
    goal_id: z.string().uuid('ID de meta inválido'),
    amount: z.number()
        .refine(val => val !== 0, 'El monto no puede ser 0')
        .refine(val => Math.abs(val) <= 999999999.99, 'El monto es demasiado grande'),
    description: z.string().max(255, 'La descripción no puede exceder 255 caracteres').optional(),
    date: z.string().optional()
})

export type CreateGoalFormData = z.infer<typeof createGoalSchema>
export type UpdateGoalFormData = z.infer<typeof updateGoalSchema>
export type CreateGoalEntryFormData = z.infer<typeof createGoalEntrySchema> 