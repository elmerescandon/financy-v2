'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { CategoryWithSubcategories } from '@/types/category'
import type { ExpenseWithDetails } from '@/types/expense'

interface ExpenseFormProps {
    categories: CategoryWithSubcategories[]
    initialData?: ExpenseWithDetails | null
    onSubmit: (data: any) => void
    onCancel: () => void
}

const PAYMENT_METHODS = [
    'efectivo',
    'tarjeta_debito',
    'tarjeta_credito',
    'transferencia',
    'paypal',
    'bizum',
    'otro'
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta_debito: 'Tarjeta de débito',
    tarjeta_credito: 'Tarjeta de crédito',
    transferencia: 'Transferencia',
    paypal: 'PayPal',
    bizum: 'Bizum',
    otro: 'Otro'
}

export function ExpenseForm({ categories, initialData, onSubmit, onCancel }: ExpenseFormProps) {
    const [formData, setFormData] = useState({
        amount: initialData?.amount?.toString() || '',
        description: initialData?.description || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        category_id: initialData?.category_id || '',
        subcategory_id: initialData?.subcategory_id || '',
        merchant: initialData?.merchant || '',
        payment_method: initialData?.payment_method || 'tarjeta_debito'
    })

    const [tags, setTags] = useState<string[]>(initialData?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const selectedCategory = categories.find(cat => cat.id === formData.category_id)
    const subcategories = selectedCategory?.subcategories || []

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
        if (!formData.category_id) {
            newErrors.category_id = 'La categoría es obligatoria'
        }
        if (!formData.payment_method) {
            newErrors.payment_method = 'El método de pago es obligatorio'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        const submitData = {
            amount: parseFloat(formData.amount),
            description: formData.description.trim(),
            date: formData.date,
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id || null,
            merchant: formData.merchant.trim() || null,
            payment_method: formData.payment_method,
            tags: tags
        }

        onSubmit(submitData)
    }

    const handleInputChange = (field: string, value: string) => {
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

                {/* Date */}
                <div>
                    <Label htmlFor="date" className="text-sm font-medium mb-2">Fecha *</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                    {errors.date && (
                        <p className="text-sm text-destructive mt-1">{errors.date}</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description" className="text-sm font-medium mb-2">Descripción *</Label>
                <Input
                    id="description"
                    placeholder="Ej: Compra en supermercado"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                    <Label htmlFor="category" className="text-sm font-medium mb-2">Categoría *</Label>
                    <Select value={formData.category_id} onValueChange={handleCategoryChange}>
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
                    {errors.category_id && (
                        <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
                    )}
                </div>

                {/* Subcategory */}
                <div className="w-full">
                    <Label htmlFor="subcategory" className="text-sm font-medium mb-2">Subcategoría</Label>
                    <Select
                        value={formData.subcategory_id}
                        onValueChange={(value) => handleInputChange('subcategory_id', value)}
                        disabled={!formData.category_id || subcategories.length === 0}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {subcategories.map((subcategory) => (
                                <SelectItem key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Payment Method */}
                <div>
                    <Label htmlFor="payment_method" className="text-sm font-medium mb-2">Método de pago *</Label>
                    <Select
                        value={formData.payment_method}
                        onValueChange={(value) => handleInputChange('payment_method', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                                <SelectItem key={method} value={method}>
                                    {PAYMENT_METHOD_LABELS[method]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.payment_method && (
                        <p className="text-sm text-destructive mt-1">{errors.payment_method}</p>
                    )}
                </div>

                {/* Merchant */}
                <div>
                    <Label htmlFor="merchant" className="text-sm font-medium mb-2">Comercio</Label>
                    <Input
                        id="merchant"
                        placeholder="Ej: Mercadona, Amazon..."
                        value={formData.merchant}
                        onChange={(e) => handleInputChange('merchant', e.target.value)}
                    />
                </div>
            </div>

            {/* Tags */}
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
                            <Badge key={index} variant="outline" className="bg-sage-100 text-sage-700">
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <Button type="submit" variant="default">
                    {initialData ? 'Actualizar' : 'Crear'} Gasto
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    )
} 