'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn, formatCurrency } from '@/lib/utils'
import type { CategoryWithSubcategories } from '@/types/category'
import type { BudgetInsight, CreateBudgetData, BudgetPeriod, BudgetAssignmentPreview } from '@/types/budget'
import { useBudgetContext } from '@/lib/context/BudgetContext'

interface BudgetFormProps {
    categories: CategoryWithSubcategories[]
    initialData?: BudgetInsight | null
    onSubmit: (data: CreateBudgetData) => Promise<void>
    onCancel: () => void
}

export default function BudgetForm({ categories, initialData, onSubmit, onCancel }: BudgetFormProps) {
    const { previewAssignment } = useBudgetContext()

    const [formData, setFormData] = useState<CreateBudgetData>({
        user_id: '', // Will be set by service
        category_id: initialData?.category_id || '',
        amount: initialData?.budget_amount || 0,
        period_start: initialData?.period_start || '',
        period_end: initialData?.period_end || '',
        allocation_percentage: initialData?.allocation_percentage || undefined,
        priority: 5,
        rollover_amount: initialData?.rollover_amount || 0,
        assignToExisting: false
    })

    const [period, setPeriod] = useState<BudgetPeriod>('monthly')
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialData?.period_start ? new Date(initialData.period_start) : undefined
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialData?.period_end ? new Date(initialData.period_end) : undefined
    )
    const [isLoading, setIsLoading] = useState(false)
    const [previewData, setPreviewData] = useState<BudgetAssignmentPreview | null>(null)
    const [loadingPreview, setLoadingPreview] = useState(false)

    // Update dates when period changes
    useEffect(() => {
        if (period === 'custom') return

        const now = new Date()
        let start = new Date()
        let end = new Date()

        switch (period) {
            case 'weekly':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
                break
            case 'monthly':
                start = new Date(now.getFullYear(), now.getMonth(), 1)
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                break
            case 'quarterly':
                const quarter = Math.floor(now.getMonth() / 3)
                start = new Date(now.getFullYear(), quarter * 3, 1)
                end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
                break
            case 'yearly':
                start = new Date(now.getFullYear(), 0, 1)
                end = new Date(now.getFullYear(), 11, 31)
                break
        }

        setStartDate(start)
        setEndDate(end)
        setFormData(prev => ({
            ...prev,
            period_start: start.toISOString().split('T')[0],
            period_end: end.toISOString().split('T')[0]
        }))
    }, [period])

    const handleDateChange = (date: Date | undefined, field: 'start' | 'end') => {
        if (!date) return

        if (field === 'start') {
            setStartDate(date)
            setFormData(prev => ({
                ...prev,
                period_start: date.toISOString().split('T')[0]
            }))
        } else {
            setEndDate(date)
            setFormData(prev => ({
                ...prev,
                period_end: date.toISOString().split('T')[0]
            }))
        }
    }

    // Load preview when category and dates change
    useEffect(() => {
        if (formData.category_id && formData.period_start && formData.period_end) {
            loadPreview()
        }
    }, [formData.category_id, formData.period_start, formData.period_end])

    const loadPreview = async () => {
        if (!formData.category_id || !formData.period_start || !formData.period_end) return

        try {
            setLoadingPreview(true)
            const preview = await previewAssignment(formData.category_id, formData.period_start, formData.period_end)
            setPreviewData(preview)
            setFormData(prev => ({ ...prev, previewData: preview }))
        } catch (error) {
            console.error('Error loading preview:', error)
            setPreviewData(null)
        } finally {
            setLoadingPreview(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await onSubmit(formData)
        } catch (error) {
            console.error('Error submitting budget:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>
                    {initialData ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select
                            value={formData.category_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-white"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                {category.icon}
                                            </span>
                                            {category.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto del Presupuesto *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                amount: parseFloat(e.target.value) || 0
                            }))}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Period Type */}
                    <div className="space-y-2">
                        <Label>Período</Label>
                        <Select
                            value={period}
                            onValueChange={(value: BudgetPeriod) => setPeriod(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensual</SelectItem>
                                <SelectItem value="quarterly">Trimestral</SelectItem>
                                <SelectItem value="yearly">Anual</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha de Inicio *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => handleDateChange(date, 'start')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Fin *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => handleDateChange(date, 'end')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="allocation">% de Asignación de Ingresos</Label>
                            <Input
                                id="allocation"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={formData.allocation_percentage || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    allocation_percentage: parseFloat(e.target.value) || undefined
                                }))}
                                placeholder="25.0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad (1-10)</Label>
                            <Input
                                id="priority"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.priority || 5}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    priority: parseInt(e.target.value) || 5
                                }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rollover">Monto Acumulado del Período Anterior</Label>
                        <Input
                            id="rollover"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.rollover_amount || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                rollover_amount: parseFloat(e.target.value) || 0
                            }))}
                            placeholder="0.00"
                        />
                    </div>

                    {/* Assignment to Existing Expenses */}
                    {previewData && previewData.matchingExpenses > 0 && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="assignToExisting"
                                    checked={formData.assignToExisting}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        assignToExisting: e.target.checked
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="assignToExisting" className="font-medium">
                                    Asignar a gastos existentes
                                </Label>
                            </div>

                            {loadingPreview ? (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                    Cargando gastos...
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>
                                        Se encontraron <strong>{previewData.matchingExpenses}</strong> gastos sin presupuesto asignado
                                        por un total de <strong>{formatCurrency(previewData.totalAmount)}</strong>
                                    </p>
                                    {previewData.hasConflicts && (
                                        <p className="text-yellow-600">
                                            ⚠️ {previewData.conflictCount} gastos ya tienen presupuesto asignado y serán omitidos
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {previewData && previewData.matchingExpenses === 0 && (
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                                No se encontraron gastos sin asignar para esta categoría y período
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.category_id || !formData.amount}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? 'Actualizar' : 'Crear'} Presupuesto
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
} 