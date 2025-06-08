import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Calendar, DollarSign } from 'lucide-react'

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

interface ConflictResolutionStepProps {
    conflicts: BudgetConflict[]
    onConflictsChange: (conflicts: BudgetConflict[]) => void
}

export default function ConflictResolutionStep({ conflicts, onConflictsChange }: ConflictResolutionStepProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const updateConflictAction = (categoryId: string, action: 'replace' | 'keep' | 'skip') => {
        const updatedConflicts = conflicts.map(conflict =>
            conflict.categoryId === categoryId ? { ...conflict, action } : conflict
        )
        onConflictsChange(updatedConflicts)
    }

    const setAllActions = (action: 'replace' | 'keep' | 'skip') => {
        const updatedConflicts = conflicts.map(conflict => ({ ...conflict, action }))
        onConflictsChange(updatedConflicts)
    }

    const getActionLabel = (action: 'replace' | 'keep' | 'skip') => {
        switch (action) {
            case 'replace': return 'Replace existing'
            case 'keep': return 'Keep existing'
            case 'skip': return 'Skip this category'
        }
    }

    const getActionColor = (action: 'replace' | 'keep' | 'skip') => {
        switch (action) {
            case 'replace': return 'bg-red-100 text-red-700'
            case 'keep': return 'bg-blue-100 text-blue-700'
            case 'skip': return 'bg-gray-100 text-gray-700'
        }
    }

    const replaceCount = conflicts.filter(c => c.action === 'replace').length
    const keepCount = conflicts.filter(c => c.action === 'keep').length
    const skipCount = conflicts.filter(c => c.action === 'skip').length

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    Budget Conflicts Detected
                </h2>
                <p className="text-muted-foreground">
                    You already have budgets for some categories. Choose how to handle each conflict.
                </p>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                    <div className="text-lg font-semibold">{conflicts.length}</div>
                    <div className="text-sm text-muted-foreground">Total Conflicts</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{replaceCount}</div>
                    <div className="text-sm text-muted-foreground">Replace</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{keepCount}</div>
                    <div className="text-sm text-muted-foreground">Keep</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">{skipCount}</div>
                    <div className="text-sm text-muted-foreground">Skip</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllActions('replace')}
                    className="text-red-600"
                >
                    Replace All
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllActions('keep')}
                    className="text-blue-600"
                >
                    Keep All
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllActions('skip')}
                    className="text-gray-600"
                >
                    Skip All
                </Button>
            </div>

            {/* Conflicts List */}
            <div className="space-y-4">
                {conflicts.map((conflict) => (
                    <div key={conflict.categoryId} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{conflict.categoryName}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(conflict.existingPeriodStart)} - {formatDate(conflict.existingPeriodEnd)}
                                    </div>
                                </div>
                            </div>
                            <Badge className={getActionColor(conflict.action)}>
                                {getActionLabel(conflict.action)}
                            </Badge>
                        </div>

                        {/* Budget Comparison */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Existing Budget
                                </h4>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(conflict.existingAmount)}
                                </div>
                                <p className="text-sm text-blue-700 mt-1">
                                    Currently active for this period
                                </p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Proposed Budget
                                </h4>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(conflict.proposedAmount)}
                                </div>
                                <p className="text-sm text-green-700 mt-1">
                                    Smart wizard suggestion
                                </p>
                            </div>
                        </div>

                        {/* Action Selection */}
                        <div>
                            <Label className="text-sm font-medium mb-3 block">Choose action:</Label>
                            <RadioGroup
                                value={conflict.action}
                                onValueChange={(value: 'replace' | 'keep' | 'skip') => updateConflictAction(conflict.categoryId, value)}
                            >
                                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-red-50">
                                    <RadioGroupItem value="replace" id={`replace-${conflict.categoryId}`} />
                                    <Label htmlFor={`replace-${conflict.categoryId}`} className="flex-1 cursor-pointer">
                                        <div className="font-medium">Replace existing budget</div>
                                        <div className="text-sm text-muted-foreground">
                                            Delete the existing budget and create new one with {formatCurrency(conflict.proposedAmount)}
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-blue-50">
                                    <RadioGroupItem value="keep" id={`keep-${conflict.categoryId}`} />
                                    <Label htmlFor={`keep-${conflict.categoryId}`} className="flex-1 cursor-pointer">
                                        <div className="font-medium">Keep existing budget</div>
                                        <div className="text-sm text-muted-foreground">
                                            Leave the current budget of {formatCurrency(conflict.existingAmount)} unchanged
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                                    <RadioGroupItem value="skip" id={`skip-${conflict.categoryId}`} />
                                    <Label htmlFor={`skip-${conflict.categoryId}`} className="flex-1 cursor-pointer">
                                        <div className="font-medium">Skip this category</div>
                                        <div className="text-sm text-muted-foreground">
                                            Don't create any budget for this category in the wizard
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Info */}
            <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 What happens next?</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Replace:</strong> The existing budget will be deleted and replaced with the new amount.</p>
                    <p><strong>Keep:</strong> The existing budget remains unchanged, no new budget is created.</p>
                    <p><strong>Skip:</strong> No budget will be created for this category in the wizard.</p>
                </div>
            </div>
        </div>
    )
} 