'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatAmount } from '@/lib/utils/formats'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CategorySpendingData, WeeklySpendingData } from './utils'
import type { ExpenseWithDetails } from '@/types/expense'
import { useState } from 'react'

interface CategoryBreakdownCardProps {
    category: CategorySpendingData
    weeklyData: WeeklySpendingData[]
    expenses: ExpenseWithDetails[]
    totalAmount: number
}

export function CategoryBreakdownCard({
    category,
    weeklyData,
    expenses,
    totalAmount
}: CategoryBreakdownCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Get expenses for this category
    const categoryExpenses = expenses.filter(expense =>
        expense.category?.id === category.categoryId
    )

    // Calculate weekly trend for this category
    const categoryWeeklyData = weeklyData.map(week => {
        const categoryWeek = week.categoryBreakdown.find(cat => cat.categoryId === category.categoryId)
        return categoryWeek?.totalAmount || 0
    })

    const currentWeek = categoryWeeklyData[categoryWeeklyData.length - 1] || 0
    const previousWeek = categoryWeeklyData[categoryWeeklyData.length - 2] || 0
    const trend = currentWeek - previousWeek

    const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
    const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'

    // Calculate percentage of total spending
    const percentageOfTotal = totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0

    return (
        <Card className="border-none">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.categoryColor }}
                        />
                        <div>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <span>{category.categoryIcon}</span>
                                {category.categoryName}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{category.expenseCount} gastos</span>
                                <span>Promedio: {formatAmount(category.averageAmount)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold">
                            {formatAmount(category.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {percentageOfTotal.toFixed(1)}% del total
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progreso del total</span>
                            <span className="font-medium">{percentageOfTotal.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentageOfTotal} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2">
                        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                        <span className={`text-sm font-medium ${trendColor}`}>
                            {formatAmount(Math.abs(trend))}
                        </span>
                        <Badge variant="outline" className="text-xs">
                            {trend > 0 ? 'Aumentó' : trend < 0 ? 'Disminuyó' : 'Estable'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Ver gastos recientes ({categoryExpenses.length})
                        </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {categoryExpenses.slice(0, 10).map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{expense.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(expense.date), 'dd MMM yyyy', { locale: es })}
                                            {expense.merchant && ` • ${expense.merchant}`}
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {formatAmount(expense.amount)}
                                    </div>
                                </div>
                            ))}

                            {categoryExpenses.length > 10 && (
                                <div className="text-center text-sm text-muted-foreground py-2">
                                    +{categoryExpenses.length - 10} gastos más
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    )
} 