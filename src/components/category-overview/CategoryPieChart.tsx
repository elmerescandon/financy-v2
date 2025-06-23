'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatAmount } from '@/lib/utils/formats'
import type { CategorySpendingData } from './utils'

interface CategoryPieChartProps {
    categories: CategorySpendingData[]
}

export function CategoryPieChart({ categories }: CategoryPieChartProps) {
    const chartData = categories.map(category => ({
        name: category.categoryName,
        value: category.totalAmount,
        color: category.categoryColor,
        icon: category.categoryIcon
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0]
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: data.payload.color }}
                        />
                        <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="text-sm">
                        <div className="text-muted-foreground">Total: {formatAmount(data.value)}</div>
                        <div className="text-muted-foreground">
                            {((data.value / categories.reduce((sum, cat) => sum + cat.totalAmount, 0)) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    const CustomLegend = ({ payload }: any) => {
        return (
            <div className="flex flex-wrap gap-4 justify-center mt-4">
                {payload?.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Distribución por Categorías</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
} 