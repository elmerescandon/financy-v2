'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import {
    FinancialSummary,
    SpendingInsights,
    BudgetAllocation,
    BudgetConflict,
    EligibleCategory
} from '@/types/budgetWizard'
import {
    getFinancialSummary,
    getSpendingInsights,
    getEligibleCategories,
    detectBudgetConflicts,
    generateBudgets,
    canUseWizard
} from '@/lib/supabase/budgetWizard'
import FinancialSummaryStep from './wizard/FinancialSummaryStep'
import SpendingInsightsStep from './wizard/SpendingInsightsStep'
import BudgetAllocatorStep from './wizard/BudgetAllocatorStep'
import ConflictResolutionStep from './wizard/ConflictResolutionStep'
import ConfirmationStep from './wizard/ConfirmationStep'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const STEPS = [
    { id: 1, title: 'Financial Summary', description: 'Current income & savings' },
    { id: 2, title: 'Spending Insights', description: 'Historical patterns' },
    { id: 3, title: 'Budget Allocation', description: 'Set percentages' },
    { id: 4, title: 'Conflict Resolution', description: 'Handle existing budgets' },
    { id: 5, title: 'Confirmation', description: 'Review & create' }
]

interface SmartBudgetWizardProps {
    onComplete?: () => void
    onCancel?: () => void
}

export default function SmartBudgetWizard({ onComplete, onCancel }: SmartBudgetWizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [canUse, setCanUse] = useState(false)
    const { user, loading: userLoading } = useAuth()
    // Data states
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
    const [spendingInsights, setSpendingInsights] = useState<SpendingInsights | null>(null)
    const [eligibleCategories, setEligibleCategories] = useState<EligibleCategory[]>([])
    const [allocations, setAllocations] = useState<BudgetAllocation[]>([])
    const [conflicts, setConflicts] = useState<BudgetConflict[]>([])

    // Check if wizard can be used
    useEffect(() => {
        if (!user) return
        const checkEligibility = async () => {
            try {
                const eligible = await canUseWizard(user)
                setCanUse(eligible)

                if (!eligible) {
                    toast.error('Smart Budget Wizard not available', {
                        description: 'Ensure you have income this month and are early in the month'
                    })
                }
            } catch (error) {
                console.error('Error checking wizard eligibility:', error)
            }
        }

        checkEligibility()
    }, [user])

    // Load initial data when wizard becomes available
    useEffect(() => {
        if (!user || !canUse) return

        const loadInitialData = async () => {
            setLoading(true)
            try {
                const [summary, insights, categories] = await Promise.all([
                    getFinancialSummary(user),
                    getSpendingInsights(user),
                    getEligibleCategories(user)
                ])

                setFinancialSummary(summary)
                setSpendingInsights(insights)
                setEligibleCategories(categories)

                // Initialize allocations with smart defaults
                const defaultAllocations: BudgetAllocation[] = categories.map(cat => {
                    const lastMonthSpending = insights.lastMonth.find(c => c.categoryId === cat.id)
                    const quarterAvgSpending = insights.quarterAverage.find(c => c.categoryId === cat.id)

                    // Use quarter average for more stable suggestions
                    const suggestedAmount = quarterAvgSpending?.totalSpending || lastMonthSpending?.totalSpending || 0
                    const suggestedPercentage = summary.availableForBudgets > 0
                        ? (suggestedAmount / summary.availableForBudgets) * 100
                        : 0

                    return {
                        categoryId: cat.id,
                        categoryName: cat.name,
                        categoryIcon: cat.icon,
                        categoryColor: cat.color,
                        lastMonthPercentage: lastMonthSpending?.percentage || 0,
                        suggestedPercentage: Math.min(suggestedPercentage, 50), // Cap at 50%
                        userPercentage: Math.min(suggestedPercentage, 50),
                        amount: Math.min(suggestedAmount, summary.availableForBudgets * 0.5),
                        isEssential: cat.isEssential
                    }
                })

                setAllocations(defaultAllocations)
            } catch (error) {
                console.error('Error loading wizard data:', error)
                toast.error('Failed to load wizard data')
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
    }, [user, canUse])

    const handleNext = async () => {
        if (currentStep === 3 && financialSummary) {
            // Before going to conflict resolution, check for conflicts
            try {
                setLoading(true)
                const categoryIds = allocations.map(a => a.categoryId)
                const detectedConflicts = await detectBudgetConflicts(
                    user!,
                    categoryIds,
                    financialSummary.month,
                    financialSummary.year
                )

                // Update conflicts with proposed amounts
                const conflictsWithAmounts = detectedConflicts.map(conflict => ({
                    ...conflict,
                    proposedAmount: allocations.find(a => a.categoryId === conflict.categoryId)?.amount || 0
                }))

                setConflicts(conflictsWithAmounts)

                // Skip conflict resolution if no conflicts
                if (conflictsWithAmounts.length === 0) {
                    setCurrentStep(5) // Skip to confirmation
                } else {
                    setCurrentStep(4) // Go to conflict resolution
                }
            } catch (error) {
                console.error('Error detecting conflicts:', error)
                toast.error('Error checking for existing budgets')
            } finally {
                setLoading(false)
            }
        } else if (currentStep === 4) {
            setCurrentStep(5) // Go to confirmation
        } else if (currentStep < 5) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep === 5 && conflicts.length === 0) {
            setCurrentStep(3) // Skip conflict resolution if no conflicts
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        if (!user || !financialSummary) return

        setLoading(true)
        try {
            await generateBudgets(
                user,
                allocations,
                conflicts,
                financialSummary.month,
                financialSummary.year
            )

            toast.success('Smart budgets created successfully!')
            onComplete?.()
        } catch (error) {
            console.error('Error creating budgets:', error)
            toast.error('Failed to create budgets')
        } finally {
            setLoading(false)
        }
    }

    if (!canUse) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-gray-400" />
                    </div>
                    <CardTitle>Smart Budget Wizard Unavailable</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        The Smart Budget Wizard is available during the first 10 days of each month
                        for users with recorded income and spending history.
                    </p>
                    <div className="space-y-2 text-sm">
                        <p>Requirements:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Current month income recorded</li>
                            <li>Recent spending activity (last 3 months)</li>
                            <li>First 10 days of the month</li>
                        </ul>
                    </div>
                    <Button onClick={onCancel} variant="outline">
                        Close
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (loading && currentStep === 1) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                        <p className="text-muted-foreground">Loading your financial data...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const progress = (currentStep / STEPS.length) * 100

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Progress Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Smart Budget Wizard</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                    <Progress value={progress} className="w-full" />
                </CardHeader>
            </Card>

            {/* Step Content */}
            <Card>
                <CardContent className="p-6">
                    {currentStep === 1 && financialSummary && (
                        <FinancialSummaryStep summary={financialSummary} />
                    )}

                    {currentStep === 2 && spendingInsights && (
                        <SpendingInsightsStep insights={spendingInsights} />
                    )}

                    {currentStep === 3 && financialSummary && (
                        <BudgetAllocatorStep
                            allocations={allocations}
                            onAllocationsChange={setAllocations}
                            availableAmount={financialSummary.availableForBudgets}
                        />
                    )}

                    {currentStep === 4 && (
                        <ConflictResolutionStep
                            conflicts={conflicts}
                            onConflictsChange={setConflicts}
                        />
                    )}

                    {currentStep === 5 && financialSummary && (
                        <ConfirmationStep
                            allocations={allocations}
                            conflicts={conflicts}
                            summary={financialSummary}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center p-4">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="flex gap-2">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`w-2 h-2 rounded-full ${step.id <= currentStep ? 'bg-primary' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>

                {currentStep < 5 ? (
                    <Button onClick={handleNext} disabled={loading}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleComplete} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Budgets'}
                    </Button>
                )}
            </div>
        </div>
    )
} 