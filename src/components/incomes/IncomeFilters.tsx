'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X, Calendar } from 'lucide-react'
import type { IncomeFilters, IncomeSource } from '@/types/income'
import type { CategoryWithSubcategories } from '@/types/category'

interface IncomeFiltersProps {
    filters: IncomeFilters
    onFiltersChange: (filters: IncomeFilters) => void
    categories?: CategoryWithSubcategories[]
    onClear?: () => void
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

export function IncomeFilters({ filters, onFiltersChange, categories = [], onClear }: IncomeFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const updateFilter = <K extends keyof IncomeFilters>(key: K, value: IncomeFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value })
    }

    const hasActiveFilters = Object.values(filters).some(value => {
        if (Array.isArray(value)) return value.length > 0
        return value !== undefined && value !== null && value !== ''
    })

    const clearFilters = () => {
        onFiltersChange({})
        onClear?.()
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                        {hasActiveFilters && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Activos
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Limpiar
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Contraer' : 'Expandir'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search */}
                <div>
                    <Label htmlFor="search" className="text-sm font-medium mb-2">
                        Buscar
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="search"
                            placeholder="Buscar por descripción..."
                            value={filters.description_contains || ''}
                            onChange={(e) => updateFilter('description_contains', e.target.value || undefined)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isExpanded && (
                    <>
                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="date_from" className="text-sm font-medium mb-2">
                                    Desde
                                </Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_to" className="text-sm font-medium mb-2">
                                    Hasta
                                </Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                                />
                            </div>
                        </div>

                        {/* Income Source */}
                        <div>
                            <Label htmlFor="source" className="text-sm font-medium mb-2">
                                Fuente de Ingresos
                            </Label>
                            <Select
                                value={filters.source || ''}
                                onValueChange={(value) => updateFilter('source', value as IncomeSource || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las fuentes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todas las fuentes</SelectItem>
                                    {INCOME_SOURCES.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {INCOME_SOURCE_LABELS[source]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        {categories.length > 0 && (
                            <div>
                                <Label htmlFor="category" className="text-sm font-medium mb-2">
                                    Categoría
                                </Label>
                                <Select
                                    value={filters.category_id || ''}
                                    onValueChange={(value) => updateFilter('category_id', value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las categorías" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas las categorías</SelectItem>
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
                        )}

                        {/* Amount Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="amount_min" className="text-sm font-medium mb-2">
                                    Cantidad mínima
                                </Label>
                                <Input
                                    id="amount_min"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={filters.amount_min || ''}
                                    onChange={(e) => updateFilter('amount_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="amount_max" className="text-sm font-medium mb-2">
                                    Cantidad máxima
                                </Label>
                                <Input
                                    id="amount_max"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={filters.amount_max || ''}
                                    onChange={(e) => updateFilter('amount_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                            </div>
                        </div>

                        {/* Employer/Client */}
                        <div>
                            <Label htmlFor="employer_client" className="text-sm font-medium mb-2">
                                Empleador/Cliente
                            </Label>
                            <Input
                                id="employer_client"
                                placeholder="Buscar por empleador o cliente..."
                                value={filters.employer_client || ''}
                                onChange={(e) => updateFilter('employer_client', e.target.value || undefined)}
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Opciones</Label>

                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.is_recurring === true}
                                            onChange={(e) => updateFilter('is_recurring', e.target.checked || undefined)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Solo recurrentes</span>
                                    </label>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.is_taxable === true}
                                            onChange={(e) => updateFilter('is_taxable', e.target.checked || undefined)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Solo gravables</span>
                                    </label>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.needs_review === true}
                                            onChange={(e) => updateFilter('needs_review', e.target.checked || undefined)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Necesita revisión</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
} 