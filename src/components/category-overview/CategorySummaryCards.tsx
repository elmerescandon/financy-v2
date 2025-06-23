'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Tag } from 'lucide-react'
import { formatAmount } from '@/lib/utils/formats'
import type { CategorySpendingData, WeeklySpendingData } from './utils'

interface CategorySummaryCardsProps {
    categories: CategorySpendingData[]
    weeklyData: WeeklySpendingData[]
    totalAmount: number
    totalExpenses: number
}

export function CategorySummaryCards({
    categories,
    weeklyData,
    totalAmount,
    totalExpenses
}: CategorySummaryCardsProps) {
    const topCategory = categories[0]
    const averagePerCategory = categories.length > 0 ? totalAmount / categories.length : 0

    // Calculate trend from weekly data
    const trend = weeklyData.length >= 2
        ? weeklyData[weeklyData.length - 1].totalAmount - weeklyData[weeklyData.length - 2].totalAmount
        : 0

    const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
    const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {formatAmount(totalAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {totalExpenses} gastos registrados
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {categories.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Promedio {formatAmount(averagePerCategory)} por categoría
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categoría Principal</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {topCategory ? formatAmount(topCategory.totalAmount) : 'S/ 0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {topCategory?.categoryName || 'Sin datos'}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tendencia Semanal</CardTitle>
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${trendColor}`}>
                        {formatAmount(Math.abs(trend))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {trend > 0 ? 'Aumentó' : trend < 0 ? 'Disminuyó' : 'Estable'} esta semana
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 