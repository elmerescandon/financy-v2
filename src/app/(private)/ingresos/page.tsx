'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, TrendingUp, Calendar, Calculator } from 'lucide-react'
import { IncomeList } from '@/components/incomes/IncomeList'
import { IncomeFilters } from '@/components/incomes/IncomeFilters'
import { useIncomeContext } from '@/lib/context/IncomeContext'
import { useCategories } from '@/hooks/useCategories'
import type { IncomeFilters as IncomeFiltersType } from '@/types/income'
import { toast } from 'sonner'
import { formatAmount } from '@/lib/utils/formats'

export default function IncresosPage() {
    const [filters, setFilters] = useState<IncomeFiltersType>({})
    const router = useRouter()
    const { incomes, loading, error, deleteIncome } = useIncomeContEext()
    const { categories } = useCategories()

    const handleDeleteIncome = async (id: string) => {
        try {
            await deleteIncome(id)
            toast.success('Ingreso eliminado exitosamente')
        } catch (error) {
            console.error('Error deleting income:', error)
            toast.error('Error al eliminar ingreso')
        }
    }

    const handleFiltersChange = (newFilters: IncomeFiltersType) => {
        setFilters(newFilters)
    }

    // Filter incomes based on current filters
    const filteredIncomes = useMemo(() => {
        let filtered = incomes

        if (filters.date_from || filters.date_to) {
            filtered = filtered.filter(income => {
                const incomeDate = new Date(income.date)
                if (filters.date_from && incomeDate < new Date(filters.date_from)) return false
                if (filters.date_to && incomeDate > new Date(filters.date_to)) return false
                return true
            })
        }

        if (filters.source) {
            filtered = filtered.filter(income => income.source === filters.source)
        }

        if (filters.category_id) {
            filtered = filtered.filter(income => income.category_id === filters.category_id)
        }

        if (filters.employer_client) {
            filtered = filtered.filter(income =>
                income.employer_client?.toLowerCase().includes(filters.employer_client!.toLowerCase())
            )
        }

        if (filters.amount_min !== undefined) {
            filtered = filtered.filter(income => income.amount >= filters.amount_min!)
        }

        if (filters.amount_max !== undefined) {
            filtered = filtered.filter(income => income.amount <= filters.amount_max!)
        }

        if (typeof filters.is_recurring === 'boolean') {
            filtered = filtered.filter(income => income.is_recurring === filters.is_recurring)
        }

        if (typeof filters.is_taxable === 'boolean') {
            filtered = filtered.filter(income => income.is_taxable === filters.is_taxable)
        }

        return filtered
    }, [incomes, filters])

    // Calculate stats
    const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
    const monthlyIncomes = filteredIncomes.filter(income => {
        const incomeDate = new Date(income.date)
        const now = new Date()
        return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear()
    })
    const monthlyTotal = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0)
    const recurringIncomes = filteredIncomes.filter(income => income.is_recurring)
    // const averageIncome = filteredIncomes.length > 0 ? totalIncome / filteredIncomes.length : 0

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Cargando ingresos...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray-900">Ingresos</h1>
                <Button
                    onClick={() => router.push('/ingresos/new')}
                    className="w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Ingreso
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatAmount(totalIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {filteredIncomes.length} ingresos registrados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatAmount(monthlyTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {monthlyIncomes.length} ingresos este mes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recurrentes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {recurringIncomes.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ingresos automáticos
                        </p>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatAmount(averageIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Por ingreso registrado
                        </p>
                    </CardContent>
                </Card> */}
            </div>

            {/* Filters */}
            <IncomeFilters
                categories={categories}
                filters={filters}
                onFiltersChange={handleFiltersChange}
            />

            {/* Incomes List */}
            {filteredIncomes.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                        {incomes.length === 0
                            ? 'No tienes ingresos registrados aún.'
                            : 'No se encontraron ingresos con los filtros aplicados.'
                        }
                    </p>
                    <Button
                        onClick={() => router.push('/ingresos/new')}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        Agregar tu primer ingreso
                    </Button>
                </div>
            ) : (
                <IncomeList
                    incomes={filteredIncomes}
                    onDelete={handleDeleteIncome}
                />
            )}
        </div>
    )
} 