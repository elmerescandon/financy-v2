'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, X } from 'lucide-react'
import type { CategoryWithSubcategories } from '@/types/category'
import type { IncomeWithDetails, IncomeSource, IncomeFrequency } from '@/types/income'
import { Accordion, AccordionTrigger, AccordionItem, AccordionContent } from '../ui/accordion'
import { DateTimePicker24h } from '../ui/date-time-picker'

interface IncomeFormProps {
    categories: CategoryWithSubcategories[]
    initialData?: IncomeWithDetails | null
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
}

const INCOME_SOURCES: IncomeSource[] = [
    'salary',
    'freelance',
    'investment',
    'rental',
    'business',
    'gift',
    'refund',
    'other'
]

const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
    salary: 'Salario',
    freelance: 'Freelance',
    investment: 'Inversiones',
    rental: 'Alquiler',
    business: 'Negocio',
    gift: 'Regalo',
    refund: 'Reembolso',
    other: 'Otro'
}

const INCOME_FREQUENCIES: IncomeFrequency[] = [
    'one-time',
    'weekly',
    'bi-weekly',
    'monthly',
    'quarterly',
    'yearly'
]

const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
    'one-time': 'Una vez',
    'weekly': 'Semanal',
    'bi-weekly': 'Quincenal',
    'monthly': 'Mensual',
    'quarterly': 'Trimestral',
    'yearly': 'Anual'
}

export function IncomeForm({ categories, initialData, onSubmit, onCancel }: IncomeFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: initialData?.amount?.toString() || '',
        description: initialData?.description || '',
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        source: initialData?.source || 'salary' as IncomeSource,
        employer_client: initialData?.employer_client || '',
        category_id: initialData?.category_id || '',
        notes: initialData?.notes || '',
        is_recurring: initialData?.is_recurring || false,
        recurring_frequency: initialData?.recurring_frequency || 'monthly' as IncomeFrequency,
        recurring_end_date: initialData?.recurring_end_date ? new Date(initialData.recurring_end_date) : null,
        is_taxable: initialData?.is_taxable || true
    })

    const [tags, setTags] = useState<string[]>(initialData?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'La cantidad es obligatoria y debe ser mayor a 0'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es obligatoria'
        }

        if (!formData.date) {
            newErrors.date = 'La fecha es obligatoria'
        }

        if (!formData.source) {
            newErrors.source = 'La fuente de ingresos es obligatoria'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            setLoading(true)
            if (!validateForm()) return

            const submitData = {
                amount: parseFloat(formData.amount),
                description: formData.description.trim(),
                date: formData.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD
                source: formData.source,
                employer_client: formData.employer_client.trim() || null,
                category_id: formData.category_id || null,
                notes: formData.notes.trim() || null,
                is_recurring: formData.is_recurring,
                recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
                recurring_end_date: formData.is_recurring && formData.recurring_end_date
                    ? formData.recurring_end_date.toISOString().split('T')[0]
                    : null,
                is_taxable: formData.is_taxable,
                tags: tags
            }

            await onSubmit(submitData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | Date | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags(prev => [...prev, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl w-full">
            {/* Amount */}
            <div>
                <Label htmlFor="amount" className="text-sm font-medium mb-2">Cantidad *</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                />
                {errors.amount && (
                    <p className="text-sm text-destructive mt-1">{errors.amount}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description" className="text-sm font-medium mb-2">Descripción *</Label>
                <Input
                    id="description"
                    placeholder="Descripción del ingreso"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Income Source */}
                <div>
                    <Label htmlFor="source" className="text-sm font-medium mb-2">Fuente de Ingresos *</Label>
                    <Select value={formData.source} onValueChange={(value: IncomeSource) => handleInputChange('source', value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona la fuente" />
                        </SelectTrigger>
                        <SelectContent>
                            {INCOME_SOURCES.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {INCOME_SOURCE_LABELS[source]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.source && (
                        <p className="text-sm text-destructive mt-1">{errors.source}</p>
                    )}
                </div>

                {/* Date */}
                <div>
                    <Label htmlFor="date" className="text-sm font-medium mb-2">Fecha *</Label>
                    <DateTimePicker24h
                        date={formData.date}
                        onDateChange={(date: Date) => handleInputChange('date', date)}
                    />
                    {errors.date && (
                        <p className="text-sm text-destructive mt-1">{errors.date}</p>
                    )}
                </div>
            </div>

            {/* Recurring Income */}
            <div className="flex items-center space-x-2">
                <input
                    id="is_recurring"
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                    className="rounded"
                />
                <Label htmlFor="is_recurring" className="text-sm font-medium">
                    Ingreso recurrente
                </Label>
            </div>

            {formData.is_recurring && (
                <div className="grid grid-cols-2 gap-4">
                    {/* Frequency */}
                    <div>
                        <Label htmlFor="frequency" className="text-sm font-medium mb-2">Frecuencia</Label>
                        <Select
                            value={formData.recurring_frequency}
                            onValueChange={(value: IncomeFrequency) => handleInputChange('recurring_frequency', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona frecuencia" />
                            </SelectTrigger>
                            <SelectContent>
                                {INCOME_FREQUENCIES.map((frequency) => (
                                    <SelectItem key={frequency} value={frequency}>
                                        {FREQUENCY_LABELS[frequency]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* End Date */}
                    <div>
                        <Label htmlFor="end_date" className="text-sm font-medium mb-2">Fecha de fin (opcional)</Label>
                        <DateTimePicker24h
                            date={formData.recurring_end_date || new Date()}
                            onDateChange={(date: Date) => handleInputChange('recurring_end_date', date)}
                        />
                    </div>
                </div>
            )}

            <Accordion type='single' collapsible>
                <AccordionItem value="item-1" className='my-2 max-w-5xl w-full'>
                    <AccordionTrigger type='button' className='w-full'>
                        <span className="text-sm font-medium">Agregar detalles</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {/* Employer/Client */}
                        <div>
                            <Label htmlFor="employer_client" className="text-sm font-medium mb-2">Empleador/Cliente</Label>
                            <Input
                                id="employer_client"
                                placeholder="Nombre del empleador o cliente"
                                value={formData.employer_client}
                                onChange={(e) => handleInputChange('employer_client', e.target.value)}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <Label htmlFor="category" className="text-sm font-medium mb-2">Categoría</Label>
                            <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{category.icon}</span>
                                                <span>{category.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Taxable */}
                        <div className="flex items-center space-x-2">
                            <input
                                id="is_taxable"
                                type="checkbox"
                                checked={formData.is_taxable}
                                onChange={(e) => handleInputChange('is_taxable', e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="is_taxable" className="text-sm font-medium">
                                Ingreso gravable
                            </Label>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes" className="text-sm font-medium mb-2">Notas</Label>
                            <Textarea
                                id="notes"
                                placeholder="Notas adicionales sobre este ingreso"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <Label htmlFor="tags" className="text-sm font-medium mb-2">Etiquetas</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    id="tags"
                                    placeholder="Agregar etiqueta"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button type="button" onClick={addTag} size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Actualizar' : 'Crear'} Ingreso
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    )
} 