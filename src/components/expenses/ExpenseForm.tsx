'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MobileInput, MobileNumberInput } from '@/components/ui/mobile-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    MobileSelect, 
    MobileSelectContent, 
    MobileSelectItem, 
    MobileSelectTrigger, 
    MobileSelectValue 
} from '@/components/ui/mobile-select'
import { Badge } from '@/components/ui/badge'
import { Loader2, LogIn, Plus, X } from 'lucide-react'
import type { CategoryWithSubcategories } from '@/types/category'
import type { ExpenseWithDetails } from '@/types/expense'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Accordion, AccordionTrigger, AccordionItem, AccordionContent } from '../ui/accordion'
import { DateTimePicker24h } from '../ui/date-time-picker'
import { useFormStatus } from 'react-dom'
import { CURRENCY } from '@/lib/constants'

interface ExpenseFormProps {
    categories: CategoryWithSubcategories[]
    initialData?: ExpenseWithDetails | null
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
}

const PAYMENT_METHODS = [
    // 'cash',
    'debit_card',
    'credit_card',
    // 'bank_transfer',
    // 'other'
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Efectivo',
    debit_card: 'Tarjeta de débito',
    credit_card: 'Tarjeta de crédito',
    bank_transfer: 'Transferencia',
    other: 'Otro'
}

export function ExpenseForm({ categories, initialData, onSubmit, onCancel }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: initialData?.amount?.toString() || '',
        description: initialData?.description || '',
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        category_id: initialData?.category_id || '',
        subcategory_id: initialData?.subcategory_id || '',
        merchant: initialData?.merchant || '',
        payment_method: initialData?.payment_method || '',
        type: 'expense',
        currency: CURRENCY
    })

    const [tags, setTags] = useState<string[]>(initialData?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showTimeInput, setShowTimeInput] = useState(false)
    const [hasModifiedDate, setHasModifiedDate] = useState(false)

    const selectedCategory = categories.find(cat => cat.id === formData.category_id)
    const subcategories = selectedCategory?.subcategories || []

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'La cantidad es obligatoria y debe ser mayor a 0'
        }

        if (!formData.date) {
            newErrors.date = 'La fecha es obligatoria'
        }
        if (!formData.category_id) {
            newErrors.category_id = 'La categoría es obligatoria'
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
                date: `${formatDate(formData.date)} 12:00:00`, // Add explicit time to avoid timezone conversion
                category_id: formData.category_id,
                subcategory_id: formData.subcategory_id || null,
                merchant: formData.merchant.trim() || null,
                payment_method: formData.payment_method || 'other',
                tags: tags
            }
            await onSubmit(submitData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateChange = (dateString: string) => {
        let dateObj: Date

        // If user selects a date, set time to 12:00 PM
        if (dateString) {
            // Parse date in local timezone to avoid UTC conversion
            const [year, month, day] = dateString.split('-').map(Number)
            dateObj = new Date(year, month - 1, day, 12, 0, 0, 0) // month is 0-indexed
            setHasModifiedDate(true)
        } else {
            // If no date, use current time
            dateObj = new Date()
            setHasModifiedDate(false)
        }

        handleInputChange('date', dateObj)
    }

    const handleTimeChange = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number)
        const newDate = new Date(formData.date)
        newDate.setHours(hours, minutes, 0, 0)
        handleInputChange('date', newDate)
    }

    const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const handleInputChange = (field: string, value: string | Date) => {
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

    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            subcategory_id: '' // Reset subcategory when category changes
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl w-full min-w-full lg:space-y-2">
            {/* Amount */}
            <div>
                <Label htmlFor="amount" className="text-sm font-medium mb-2">Cantidad *</Label>
                <MobileNumberInput
                    id="amount"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    touchEnhanced
                />
                {errors.amount && (
                    <p className="text-sm text-destructive mt-1">{errors.amount}</p>
                )}
            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Category */}
                <div>
                    <Label htmlFor="category" className="text-sm font-medium mb-2">Categoría *</Label>
                    <MobileSelect value={formData.category_id} onValueChange={handleCategoryChange}>
                        <MobileSelectTrigger className="w-full">
                            <MobileSelectValue placeholder="Selecciona una categoría" />
                        </MobileSelectTrigger>
                        <MobileSelectContent>
                            {categories.map((category) => (
                                <MobileSelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        <span>{category.name}</span>
                                    </div>
                                </MobileSelectItem>
                            ))}
                        </MobileSelectContent>
                    </MobileSelect>
                    {errors.category_id && (
                        <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
                    )}
                </div>

                {/* Subcategory */}
                <div className="w-full">
                    <Label htmlFor="subcategory" className="text-sm font-medium mb-2">Subcategoría</Label>
                    <MobileSelect
                        value={formData.subcategory_id}
                        onValueChange={(value) => handleInputChange('subcategory_id', value)}
                        disabled={!formData.category_id || subcategories.length === 0}
                    >
                        <MobileSelectTrigger className="w-full">
                            <MobileSelectValue placeholder="Selecciona una subcategoría" />
                        </MobileSelectTrigger>
                        <MobileSelectContent>
                            {subcategories.map((subcategory) => (
                                <MobileSelectItem key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                </MobileSelectItem>
                            ))}
                        </MobileSelectContent>
                    </MobileSelect>
                </div>
            </div>

            <div className={hasModifiedDate ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : ""}>
                {/* Date */}
                <div>
                    <Label htmlFor="date" className="text-sm font-medium mb-2">Fecha *</Label>
                    <MobileInput
                        type="date"
                        value={formatDate(formData.date)}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className='w-full'
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Deja sin modificar para usar la fecha y hora actual
                    </p>
                    {errors.date && (
                        <p className="text-sm text-destructive mt-1">{errors.date}</p>
                    )}
                </div>

                {/* Time - Only show if user modified the date */}
                {hasModifiedDate && (
                    <div>
                        <Label htmlFor="time" className="text-sm font-medium mb-2">Hora</Label>
                        <MobileInput
                            type="time"
                            value={formatTime(formData.date)}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className='w-full'
                        />
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description" className="text-sm font-medium mb-2">Descripción</Label>
                <MobileInput
                    id="description"
                    placeholder="Ej: Compra en supermercado (opcional)"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
            </div>

            <div className='w-full'>
                <Label htmlFor="payment_method" className="text-sm font-medium mb-2">Método de pago</Label>
                
                {/* <MobileSelect
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                >
                    <MobileSelectTrigger className="w-full">
                        <MobileSelectValue placeholder="Selecciona método de pago (opcional)" />
                    </MobileSelectTrigger>
                    <MobileSelectContent>
                        {PAYMENT_METHODS.map((method) => (
                            <MobileSelectItem key={method} value={method}>
                                {PAYMENT_METHOD_LABELS[method]}
                            </MobileSelectItem>
                        ))}
                    </MobileSelectContent>
                </MobileSelect> */}
                {errors.payment_method && (
                    <p className="text-sm text-destructive mt-1">{errors.payment_method}</p>
                )}
            </div>

            {/* <Accordion type='single' collapsible>
                <AccordionItem value="item-1" className='my-2 max-w-5xl w-full'>
                    <AccordionTrigger type='button' className='w-full'>
                        <span className="text-sm font-medium">Agregar detalles</span>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-4'>
                        <div>
                            <Label htmlFor="merchant" className="text-sm font-medium mb-2">Comercio</Label>
                            <MobileInput
                                id="merchant"
                                placeholder="Ej: Mercadona, Amazon..."
                                value={formData.merchant}
                                onChange={(e) => handleInputChange('merchant', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="tags" className="text-sm font-medium mb-2">Etiquetas</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Agregar etiqueta"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                />
                            <Button type="button" onClick={addTag} variant="outline">
                                Agregar
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">
                                        #{tag}
                                        <Button
                                            variant="ghost"
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="m-0 p-0"
                                        >
                                            <X className="w-2 h-2" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div> 
                    </AccordionContent>
                </AccordionItem>
            </Accordion> */}


            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button 
                    type="submit" 
                    variant="default" 
                    size="touch"
                    disabled={loading} 
                    className='w-full sm:w-[120px] cursor-pointer bg-primary dark:bg-primary'
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary dark:text-primary-foreground" /> : "Crear"}
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="touch"
                    onClick={onCancel} 
                    className='w-full sm:w-[120px] cursor-pointer'
                >
                    Cancelar
                </Button>
            </div>
        </form >
    )
} 