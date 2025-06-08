interface FinancialSummaryStepProps {
    summary: {
        totalIncome: number
        goalSavings: number
        availableForBudgets: number
        month: number
        year: number
    }
}

export default function FinancialSummaryStep({ summary }: FinancialSummaryStepProps) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your Financial Summary</h2>
                <p className="text-muted-foreground">
                    Here's your financial overview for {monthNames[summary.month]} {summary.year}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(summary.totalIncome)}
                    </div>
                    <h3 className="font-semibold mb-1">Total Income</h3>
                    <p className="text-sm text-muted-foreground">
                        All income sources this month
                    </p>
                </div>

                <div className="text-center p-6 border rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatCurrency(summary.goalSavings)}
                    </div>
                    <h3 className="font-semibold mb-1">Goal Savings</h3>
                    <p className="text-sm text-muted-foreground">
                        Amount saved toward goals this month
                    </p>
                </div>

                <div className="text-center p-6 border rounded-lg border-primary">
                    <div className="text-3xl font-bold text-primary mb-2">
                        {formatCurrency(summary.availableForBudgets)}
                    </div>
                    <h3 className="font-semibold mb-1">Available for Budgets</h3>
                    <p className="text-sm text-muted-foreground">
                        Amount to allocate across categories
                    </p>
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Calculation</h4>
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span>Total Income:</span>
                        <span>{formatCurrency(summary.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Less: Goal Savings:</span>
                        <span>-{formatCurrency(summary.goalSavings)}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-semibold">
                        <span>Available for Budgets:</span>
                        <span>{formatCurrency(summary.availableForBudgets)}</span>
                    </div>
                </div>
            </div>

            {summary.availableForBudgets <= 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Low Available Funds</h4>
                    <p className="text-sm text-yellow-700">
                        You have little to no funds available for budgets. Consider reducing goal savings
                        or increasing income for more budget flexibility.
                    </p>
                </div>
            )}
        </div>
    )
} 