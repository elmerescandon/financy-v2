'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Check, ChevronDown } from 'lucide-react'
import type { CategoryWithSubcategories } from '@/types/category'
import { Label } from '../ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

export interface ExpenseFilters {
    dateRange: 'all' | 'this_month' | 'prev_month' | 'last_3_months' | 'this_year'
    categoryIds?: string[]
}

interface ExpenseFiltersProps {
    categories: CategoryWithSubcategories[]
    filters: ExpenseFilters
    onFiltersChange: (filters: ExpenseFilters) => void
}

const DATE_RANGE_LABELS = {
    all: 'Todo',
    this_month: 'Este mes',
    prev_month: 'Mes anterior',
    last_3_months: 'Últimos 3 meses',
    this_year: 'Este año'
}

// Helper function to convert UI filters to database filters
export const convertToDatabaseFilters = (uiFilters: ExpenseFilters) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let date_from: string | undefined
    let date_to: string | undefined

    switch (uiFilters.dateRange) {
        case 'this_month':
            date_from = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
            date_to = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
            break
        case 'prev_month':
            date_from = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
            date_to = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
            break
        case 'last_3_months':
            date_from = new Date(currentYear, currentMonth - 2, 1).toISOString().split('T')[0]
            date_to = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
            break
        case 'this_year':
            date_from = new Date(currentYear, 0, 1).toISOString().split('T')[0]
            date_to = new Date(currentYear, 11, 31).toISOString().split('T')[0]
            break
        case 'all':
        default:
            date_from = undefined
            date_to = undefined
            break
    }

    return {
        date_from,
        date_to,
        category_ids: uiFilters.categoryIds?.length ? uiFilters.categoryIds : undefined
    }
}

export function ExpenseFilters({ categories, filters, onFiltersChange }: ExpenseFiltersProps) {
    const [open, setOpen] = useState(false)

    const handleDateRangeChange = (range: ExpenseFilters['dateRange']) => {
        onFiltersChange({ ...filters, dateRange: range })
    }

    const handleCategoryToggle = (categoryId: string) => {
        const currentCategoryIds = filters.categoryIds || []
        const newCategoryIds = currentCategoryIds.includes(categoryId)
            ? currentCategoryIds.filter(id => id !== categoryId)
            : [...currentCategoryIds, categoryId]

        onFiltersChange({
            ...filters,
            categoryIds: newCategoryIds.length > 0 ? newCategoryIds : undefined
        })
    }

    const clearFilters = () => {
        onFiltersChange({ dateRange: 'all' })
    }

    const removeCategory = (categoryId: string) => {
        const newCategoryIds = (filters.categoryIds || []).filter(id => id !== categoryId)
        onFiltersChange({
            ...filters,
            categoryIds: newCategoryIds.length > 0 ? newCategoryIds : undefined
        })
    }

    const hasActiveFilters = filters.dateRange !== 'all' || (filters.categoryIds && filters.categoryIds.length > 0)
    const selectedCategories = categories.filter(c => filters.categoryIds?.includes(c.id) || false)

    const getCategoryDisplayText = () => {
        if (!filters.categoryIds || filters.categoryIds.length === 0) {
            return "Todas las categorías"
        }
        if (filters.categoryIds.length === 1) {
            const category = categories.find(c => c.id === filters.categoryIds![0])
            return category?.name || "Categoría seleccionada"
        }
        return `${filters.categoryIds.length} categorías seleccionadas`
    }

    return (
        <div className="space-y-4 p-4">
            {/* Date Range Buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                    <Label className='text-sm font-medium text-muted-foreground mb-2 block'>Fecha</Label>
                    <div className='flex flex-wrap gap-2'>
                        {Object.entries(DATE_RANGE_LABELS).map(([key, label]) => (
                            <Button
                                key={key}
                                variant={filters.dateRange === key ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleDateRangeChange(key as ExpenseFilters['dateRange'])}
                                className={`text-xs sm:text-sm ${filters.dateRange === key ? 'bg-primary hover:bg-primary/90' : ''}`}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-w-0 sm:max-w-xs">
                    <Label className='text-sm font-medium text-muted-foreground mb-2 block'>Categorías</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                <span className="truncate">{getCategoryDisplayText()}</span>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full sm:w-[300px] p-0" align="start">
                            <div className="p-2">
                                <div className="text-sm font-medium mb-2 px-2">Seleccionar categorías</div>
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-1">
                                        {categories.map((category) => {
                                            const isSelected = filters.categoryIds?.includes(category.id) || false
                                            return (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                    onClick={() => handleCategoryToggle(category.id)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleCategoryToggle(category.id)}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-lg">{category.icon}</span>
                                                    <span className="flex-1 text-sm">{category.name}</span>
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        {filters.dateRange !== 'all' && (
                            <Badge variant="secondary" className="gap-1">
                                {DATE_RANGE_LABELS[filters.dateRange]}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                                    onClick={() => handleDateRangeChange('all')}
                                />
                            </Badge>
                        )}
                        {selectedCategories.map((category) => (
                            <Badge key={category.id} variant="secondary" className="gap-1">
                                <span>{category.icon}</span>
                                {category.name}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCategory(category.id)}
                                    className='cursor-pointer hover:text-destructive p-0 h-auto'
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Limpiar filtros
                    </Button>
                </div>
            )}
        </div>
    )
} 