'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import type { CategoryWithSubcategories } from '@/types/category'

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

export function ExpenseFilters({ categories, filters, onFiltersChange }: ExpenseFiltersProps) {
    const handleDateRangeChange = (range: ExpenseFilters['dateRange']) => {
        onFiltersChange({ ...filters, dateRange: range })
    }

    const handleCategoryChange = (categoryId: string) => {
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
            <div className="flex flex-wrap gap-2">
                {Object.entries(DATE_RANGE_LABELS).map(([key, label]) => (
                    <Button
                        key={key}
                        variant={filters.dateRange === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDateRangeChange(key as ExpenseFilters['dateRange'])}
                        className={filters.dateRange === key ? 'bg-sage-600 hover:bg-sage-700' : ''}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select
                        value={filters.categoryId || 'all'}
                        onValueChange={handleCategoryChange}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por categoría" />
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

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
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
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                onClick={() => handleCategoryChange('all')}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
} 