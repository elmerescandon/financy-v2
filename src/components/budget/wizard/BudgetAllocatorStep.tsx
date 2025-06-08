import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { CURRENCY } from '@/lib/constants'

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

interface BudgetAllocatorStepProps {
    allocations: BudgetAllocation[]
    onAllocationsChange: (allocations: BudgetAllocation[]) => void
    availableAmount: number
}

export default function BudgetAllocatorStep({
    allocations,
    onAllocationsChange,
    availableAmount
}: BudgetAllocatorStepProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: CURRENCY,
        }).format(amount)
    }

    const formatPercentage = (percentage: number) => {
        return `${percentage.toFixed(1)}%`
    }

    const totalAllocatedPercentage = allocations.reduce((sum, allocation) => sum + allocation.userPercentage, 0)
    const totalAllocatedAmount = allocations.reduce((sum, allocation) => sum + allocation.amount, 0)
    const remainingAmount = availableAmount - totalAllocatedAmount
    const remainingPercentage = 100 - totalAllocatedPercentage

    const updateAllocation = (categoryId: string, field: 'userPercentage' | 'amount', value: number) => {
        const updatedAllocations = allocations.map(allocation => {
            if (allocation.categoryId === categoryId) {
                if (field === 'userPercentage') {
                    return {
                        ...allocation,
                        userPercentage: Math.max(0, Math.min(100, value)),
                        amount: Math.max(0, (value / 100) * availableAmount)
                    }
                } else {
                    const percentage = availableAmount > 0 ? (value / availableAmount) * 100 : 0
                    return {
                        ...allocation,
                        userPercentage: Math.max(0, Math.min(100, percentage)),
                        amount: Math.max(0, value)
                    }
                }
            }
            return allocation
        })
        onAllocationsChange(updatedAllocations)
    }

    const resetToSuggested = () => {
        const resetAllocations = allocations.map(allocation => ({
            ...allocation,
            userPercentage: allocation.suggestedPercentage,
            amount: (allocation.suggestedPercentage / 100) * availableAmount
        }))
        onAllocationsChange(resetAllocations)
    }

    const distributeEvenly = () => {
        const evenPercentage = 100 / allocations.length
        const evenAllocations = allocations.map(allocation => ({
            ...allocation,
            userPercentage: evenPercentage,
            amount: (evenPercentage / 100) * availableAmount
        }))
        onAllocationsChange(evenAllocations)
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Allocate Your Budget</h2>
                <p className="text-muted-foreground">
                    Set the percentage of your available funds for each category
                </p>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                    <div className="text-lg font-semibold">{formatCurrency(availableAmount)}</div>
                    <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold">{formatCurrency(totalAllocatedAmount)}</div>
                    <div className="text-sm text-muted-foreground">Allocated ({formatPercentage(totalAllocatedPercentage)})</div>
                </div>
                <div className="text-center">
                    <div className={`text-lg font-semibold ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(remainingAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining ({formatPercentage(remainingPercentage)})</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={resetToSuggested}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                    Reset to Suggested
                </button>
                <button
                    onClick={distributeEvenly}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                    Distribute Evenly
                </button>
            </div>

            {/* Allocation Controls */}
            <div className="space-y-6">
                {allocations.map((allocation) => (
                    <div key={allocation.categoryId} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                    style={{ backgroundColor: allocation.categoryColor || '#6B7280' }}
                                >
                                    {allocation.categoryIcon || allocation.categoryName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {allocation.categoryName}
                                        {allocation.isEssential && (
                                            <Badge variant="secondary" className="text-xs">Essential</Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Last month: {formatPercentage(allocation.lastMonthPercentage)} •
                                        Suggested: {formatPercentage(allocation.suggestedPercentage)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-lg">{formatCurrency(allocation.amount)}</div>
                                <div className="text-sm text-muted-foreground">
                                    {formatPercentage(allocation.userPercentage)}
                                </div>
                            </div>
                        </div>

                        {/* Percentage Slider */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Percentage: {formatPercentage(allocation.userPercentage)}</Label>
                            <Slider
                                value={[allocation.userPercentage]}
                                onValueChange={([value]) => updateAllocation(allocation.categoryId, 'userPercentage', value)}
                                max={100}
                                step={0.5}
                                className="w-full"
                            />
                        </div>

                        {/* Amount Input */}
                        <div className="flex items-center gap-4">
                            <Label className="text-sm font-medium w-16">Amount:</Label>
                            <Input
                                type="number"
                                value={allocation.amount.toFixed(2)}
                                onChange={(e) => updateAllocation(allocation.categoryId, 'amount', parseFloat(e.target.value) || 0)}
                                className="flex-1"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Validation Messages */}
            {remainingAmount < 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Over Budget</h4>
                    <p className="text-sm text-red-700">
                        You've allocated {formatCurrency(Math.abs(remainingAmount))} more than available.
                        Please reduce some category budgets.
                    </p>
                </div>
            )}

            {remainingAmount > availableAmount * 0.1 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 Suggestion</h4>
                    <p className="text-sm text-yellow-700">
                        You have {formatCurrency(remainingAmount)} unallocated. Consider adding more categories
                        or increasing existing budgets for better financial planning.
                    </p>
                </div>
            )}

            {Math.abs(remainingAmount) <= availableAmount * 0.05 && remainingAmount >= 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                        ✅ Great! Your budget allocation looks balanced with minimal remaining funds.
                    </p>
                </div>
            )}
        </div>
    )
} 