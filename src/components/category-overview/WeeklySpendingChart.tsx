'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatAmount } from '@/lib/utils/formats'
import type { WeeklySpendingData } from './utils'

interface WeeklySpendingChartProps {
    weeklyData: WeeklySpendingData[]
}

export function WeeklySpendingChart({ weeklyData }: WeeklySpendingChartProps) {
    // Prepare data for stacked bar chart
    const chartData = weeklyData.map(week => {
        const dataPoint: any = {
            week: week.week,
            total: week.totalAmount
        }

        // Add each category as a separate data key
        week.categoryBreakdown.forEach(category => {
            dataPoint[category.categoryName] = category.totalAmount
        })

        return dataPoint
    })

    // Get unique category names for bars
    const categoryNames = Array.from(
        new Set(
            weeklyData.flatMap(week =>
                week.categoryBreakdown.map(cat => cat.categoryName)
            )
        )
    )

    const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
    ]

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <div className="font-medium mb-2">{label}</div>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">{entry.name}:</span>
                            <span className="font-medium">{formatAmount(entry.value)}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Gastos Semanales por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="week"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickFormatter={(value) => formatAmount(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {categoryNames.map((categoryName, index) => (
                                <Bar
                                    key={categoryName}
                                    dataKey={categoryName}
                                    stackId="a"
                                    fill={colors[index % colors.length]}
                                    radius={[2, 2, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
} 