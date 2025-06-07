import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Minus, Plus } from 'lucide-react'

interface BudgetAllocation {
    categoryId: string
    categoryName: string
    categoryIcon?: string
    categoryColor?: string
    lastMonthPercentage: number
    suggestedPercentage: number
    userPercentage: number
    amount: number
    isEssential: boolean
}

interface BudgetConflict {
    categoryId: string
    categoryName: string
    existingAmount: number
    existingPeriodStart: string
    existingPeriodEnd: string
    proposedAmount: number
    action: 'replace' | 'keep' | 'skip'
    budgetId: string
}

interface FinancialSummary {
    totalIncome: number
    goalSavings: number
    availableForBudgets: number
    month: number
    year: number
}

interface ConfirmationStepProps {
    allocations: BudgetAllocation[]
    conflicts: BudgetConflict[]
    summary: FinancialSummary
}

export default function ConfirmationStep({ allocations, conflicts, summary }: ConfirmationStepProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const formatPercentage = (percentage: number) => {
        return `${percentage.toFixed(1)}%`
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Filter allocations based on conflict actions
    const budgetsToCreate = allocations.filter(allocation => {
        const conflict = conflicts.find(c => c.categoryId === allocation.categoryId)
        return !conflict || conflict.action === 'replace'
    })

    const budgetsToKeep = conflicts.filter(c => c.action === 'keep')
    const budgetsToSkip = conflicts.filter(c => c.action === 'skip')

    const totalNewBudgets = budgetsToCreate.reduce((sum, budget) => sum + budget.amount, 0)
    const totalKeptBudgets = budgetsToKeep.reduce((sum, budget) => sum + budget.existingAmount, 0)
    const remainingAmount = summary.availableForBudgets - totalNewBudgets

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <Plus className="w-4 h-4 text-green-600" />
            case 'replace': return <CheckCircle className="w-4 h-4 text-orange-600" />
            case 'keep': return <Minus className="w-4 h-4 text-blue-600" />
            case 'skip': return <XCircle className="w-4 h-4 text-gray-600" />
            default: return null
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create': return 'bg-green-100 text-green-700'
            case 'replace': return 'bg-orange-100 text-orange-700'
            case 'keep': return 'bg-blue-100 text-blue-700'
            case 'skip': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
                <p className="text-muted-foreground">
                    Review your budget plan for {monthNames[summary.month]} {summary.year}
                </p>
            </div>

            {/* Summary Overview */}
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{budgetsToCreate.length}</div>
                    <div className="text-sm text-muted-foreground">New Budgets</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">{conflicts.filter(c => c.action === 'replace').length}</div>
                    <div className="text-sm text-muted-foreground">Replacements</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{budgetsToKeep.length}</div>
                    <div className="text-sm text-muted-foreground">Unchanged</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">{budgetsToSkip.length}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(summary.availableForBudgets)}</div>
                    <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-green-600">{formatCurrency(totalNewBudgets)}</div>
                    <div className="text-sm text-muted-foreground">New Budgets</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                    <div className={`text-xl font-bold ${remainingAmount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatCurrency(remainingAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
            </div>

            {/* New Budgets */}
            {budgetsToCreate.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-green-600" />
                        New Budgets ({budgetsToCreate.length})
                    </h3>
                    <div className="space-y-3">
                        {budgetsToCreate.map((budget) => {
                            const isReplacement = conflicts.find(c => c.categoryId === budget.categoryId && c.action === 'replace')
                            return (
                                <div key={budget.categoryId} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getActionIcon(isReplacement ? 'replace' : 'create')}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                            style={{ backgroundColor: budget.categoryColor || '#6B7280' }}
                                        >
                                            {budget.categoryIcon || budget.categoryName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {budget.categoryName}
                                                {budget.isEssential && (
                                                    <Badge variant="secondary" className="text-xs">Essential</Badge>
                                                )}
                                                <Badge className={getActionColor(isReplacement ? 'replace' : 'create')}>
                                                    {isReplacement ? 'Replace' : 'New'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatPercentage(budget.userPercentage)} of available funds
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-lg">{formatCurrency(budget.amount)}</div>
                                        {isReplacement && (
                                            <div className="text-sm text-muted-foreground">
                                                was {formatCurrency(isReplacement.existingAmount)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Unchanged Budgets */}
            {budgetsToKeep.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Minus className="w-5 h-5 text-blue-600" />
                        Unchanged Budgets ({budgetsToKeep.length})
                    </h3>
                    <div className="space-y-3">
                        {budgetsToKeep.map((budget) => (
                            <div key={budget.categoryId} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                                <div className="flex items-center gap-3">
                                    {getActionIcon('keep')}
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {budget.categoryName}
                                            <Badge className={getActionColor('keep')}>
                                                Keeping existing
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Current budget will remain active
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-lg">{formatCurrency(budget.existingAmount)}</div>
                                    <div className="text-sm text-muted-foreground">No changes</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skipped Categories */}
            {budgetsToSkip.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-gray-600" />
                        Skipped Categories ({budgetsToSkip.length})
                    </h3>
                    <div className="space-y-3">
                        {budgetsToSkip.map((budget) => (
                            <div key={budget.categoryId} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {getActionIcon('skip')}
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {budget.categoryName}
                                            <Badge className={getActionColor('skip')}>
                                                Skipped
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            No budget will be created by the wizard
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Validation Messages */}
            {remainingAmount < 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Budget Exceeds Available Funds</h4>
                    <p className="text-sm text-red-700">
                        Your new budgets total {formatCurrency(totalNewBudgets)} but you only have {formatCurrency(summary.availableForBudgets)} available.
                        Please go back and reduce some budget amounts.
                    </p>
                </div>
            )}

            {remainingAmount > summary.availableForBudgets * 0.1 && remainingAmount >= 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 Large Amount Unallocated</h4>
                    <p className="text-sm text-yellow-700">
                        You have {formatCurrency(remainingAmount)} ({formatPercentage((remainingAmount / summary.availableForBudgets) * 100)})
                        remaining unallocated. Consider increasing some budgets or adding more categories.
                    </p>
                </div>
            )}

            {Math.abs(remainingAmount) <= summary.availableForBudgets * 0.05 && remainingAmount >= 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                        ✅ Excellent! Your budget allocation is well-balanced with minimal remaining funds.
                    </p>
                </div>
            )}

            {/* Final Summary */}
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-3">📋 Summary</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>Total Available:</strong> {formatCurrency(summary.availableForBudgets)}</p>
                        <p><strong>New Budget Total:</strong> {formatCurrency(totalNewBudgets)}</p>
                        <p><strong>Budgets Created:</strong> {budgetsToCreate.length}</p>
                    </div>
                    <div>
                        <p><strong>Existing Kept:</strong> {budgetsToKeep.length}</p>
                        <p><strong>Categories Skipped:</strong> {budgetsToSkip.length}</p>
                        <p><strong>Remaining Unallocated:</strong> {formatCurrency(remainingAmount)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 