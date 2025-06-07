import { Progress } from '@/components/ui/progress'
import { TrendingUp, AlertTriangle } from 'lucide-react'

interface SpendingInsightsStepProps {
    insights: {
        lastMonth: {
            categoryId: string
            categoryName: string
            categoryIcon?: string
            categoryColor?: string
            totalSpending: number
            percentage: number
            transactionCount: number
        }[]
        quarterAverage: {
            categoryId: string
            categoryName: string
            categoryIcon?: string
            categoryColor?: string
            totalSpending: number
            percentage: number
            transactionCount: number
        }[]
        atypicalExpenses: {
            categoryId: string
            categoryName: string
            lastMonthAmount: number
            quarterAverage: number
            percentageIncrease: number
            isSignificant: boolean
        }[]
        totalLastMonth: number
        totalQuarterAverage: number
    }
}

export default function SpendingInsightsStep({ insights }: SpendingInsightsStepProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const formatPercentage = (percentage: number) => {
        return `${percentage.toFixed(1)}%`
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your Spending Insights</h2>
                <p className="text-muted-foreground">
                    Analysis of your spending patterns to help create smarter budgets
                </p>
            </div>

            {/* Overall Summary */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-6 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                        {formatCurrency(insights.totalLastMonth)}
                    </div>
                    <h3 className="font-semibold mb-1">Last Month Total</h3>
                    <p className="text-sm text-muted-foreground">
                        Total spending in previous month
                    </p>
                </div>

                <div className="text-center p-6 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                        {formatCurrency(insights.totalQuarterAverage)}
                    </div>
                    <h3 className="font-semibold mb-1">3-Month Average</h3>
                    <p className="text-sm text-muted-foreground">
                        Average monthly spending
                    </p>
                </div>
            </div>

            {/* Top Categories */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Top Spending Categories (Last Month)</h3>
                <div className="space-y-4">
                    {insights.lastMonth.slice(0, 5).map((category) => (
                        <div key={category.categoryId} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                    style={{ backgroundColor: category.categoryColor || '#6B7280' }}
                                >
                                    {category.categoryIcon || category.categoryName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium">{category.categoryName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {category.transactionCount} transactions
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">{formatCurrency(category.totalSpending)}</div>
                                <div className="text-sm text-muted-foreground">
                                    {formatPercentage(category.percentage)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Spending Distribution */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Spending Distribution</h3>
                <div className="space-y-3">
                    {insights.quarterAverage.slice(0, 8).map((category) => (
                        <div key={category.categoryId} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{category.categoryName}</span>
                                <span>{formatCurrency(category.totalSpending)} ({formatPercentage(category.percentage)})</span>
                            </div>
                            <Progress value={category.percentage} className="h-2" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Atypical Expenses */}
            {insights.atypicalExpenses.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Atypical Expenses
                    </h3>
                    <div className="space-y-3">
                        {insights.atypicalExpenses.map((expense) => (
                            <div
                                key={expense.categoryId}
                                className={`p-4 rounded-lg border-l-4 ${expense.isSignificant
                                    ? 'bg-red-50 border-red-500'
                                    : 'bg-yellow-50 border-yellow-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {expense.categoryName}
                                            <TrendingUp className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatPercentage(expense.percentageIncrease)} increase from average
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-red-600">
                                            {formatCurrency(expense.lastMonthAmount)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            vs {formatCurrency(expense.quarterAverage)} avg
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            💡 <strong>Tip:</strong> Consider whether these higher expenses were one-time events
                            or represent a new spending pattern when setting your budgets.
                        </p>
                    </div>
                </div>
            )}

            {insights.atypicalExpenses.length === 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                        ✅ Your spending patterns look consistent with no major unusual expenses detected.
                    </p>
                </div>
            )}
        </div>
    )
} 