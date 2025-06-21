'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { CategoryWithSubcategories } from '@/types/category'
import { Label } from '../ui/label'

export interface ExpenseFilters {
    dateRange: 'all' | 'this_month' | 'prev_month' | 'last_3_months' | 'this_year'
    categoryId?: string
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
        category_id: uiFilters.categoryId
    }
}

export function ExpenseFilters({ categories, filters, onFiltersChange }: ExpenseFiltersProps) {
    const handleDateRangeChange = (range: ExpenseFilters['dateRange']) => {
        onFiltersChange({ ...filters, dateRange: range })
    }

    const handleCategoryChange = (categoryId: string) => {
        console.log('Category changed:', categoryId)
        onFiltersChange({
            ...filters,
            categoryId: categoryId === 'all' ? undefined : categoryId
        })
    }

    const clearFilters = () => {
        onFiltersChange({ dateRange: 'all' })
    }

    const hasActiveFilters = filters.dateRange !== 'all' || filters.categoryId
    const selectedCategory = categories.find(c => c.id === filters.categoryId)

    return (
        <div className="space-y-4">
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
                    <Label className='text-sm font-medium text-muted-foreground mb-2 block'>Categoría</Label>
                    <Select
                        value={filters.categoryId || 'all'}
                        onValueChange={handleCategoryChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Escoge una categoría">
                                {filters.categoryId ?
                                    categories.find(c => c.id === filters.categoryId)?.name || 'Categoría no encontrada' :
                                    'Escoge una categoría'
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
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
                        {selectedCategory && (
                            <Badge variant="secondary" className="gap-1">
                                <span>{selectedCategory.icon}</span>
                                {selectedCategory.name}
                                <Button variant="ghost" size="icon" onClick={() => handleCategoryChange('all')} className='cursor-pointer hover:text-destructive p-0 h-auto'>
                                    <X className="w-4 h-4" />
                                </Button>
                            </Badge>
                        )}
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