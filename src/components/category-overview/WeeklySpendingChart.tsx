'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatAmount } from '@/lib/utils/formats'
import { useTheme } from 'next-themes'
import type { WeeklySpendingData } from './utils'

interface WeeklySpendingChartProps {
    weeklyData: WeeklySpendingData[]
}

export function WeeklySpendingChart({ weeklyData }: WeeklySpendingChartProps) {
    const { theme, systemTheme } = useTheme()
    const currentTheme = theme === 'system' ? systemTheme : theme

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

    // Theme-aware hex colors with high contrast and accessibility
    const lightColors = [
        '#3B82F6', // blue
        '#10B981', // emerald  
        '#F59E0B', // amber
        '#EF4444', // red
        '#8B5CF6', // violet
        '#06B6D4', // cyan
        '#84CC16', // lime
        '#F97316', // orange
        '#EC4899', // pink
        '#6366F1'  // indigo
    ]

    const darkColors = [
        '#60A5FA', // light blue
        '#34D399', // light emerald
        '#FBBF24', // light amber
        '#F87171', // light red
        '#A78BFA', // light violet
        '#22D3EE', // light cyan
        '#A3E635', // light lime
        '#FB923C', // light orange
        '#F472B6', // light pink
        '#818CF8'  // light indigo
    ]

    const colors = currentTheme === 'dark' ? darkColors : lightColors

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
                        <BarChart data={chartData} >
                            <XAxis
                                dataKey="week"
                                fontSize={12}
                                tick={{ stroke: currentTheme === 'dark' ? 'white' : 'black', strokeWidth: 0.1 }}
                                stroke={currentTheme === 'dark' ? 'white' : 'black'}
                            />
                            <YAxis
                                fontSize={12}
                                dataKey="total"
                                tick={{ stroke: currentTheme === 'dark' ? 'white' : 'black', strokeWidth: 0.1 }}
                                stroke={currentTheme === 'dark' ? 'white' : 'black'}
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