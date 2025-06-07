export interface FinancialSummary {
    totalIncome: number
    goalSavings: number
    availableForBudgets: number
    month: number
    year: number
}

export interface CategorySpending {
    categoryId: string
    categoryName: string
    categoryIcon?: string
    categoryColor?: string
    totalSpending: number
    percentage: number
    transactionCount: number
}

export interface SpendingInsights {
    lastMonth: CategorySpending[]
    quarterAverage: CategorySpending[]
    atypicalExpenses: AtypicalExpense[]
    totalLastMonth: number
    totalQuarterAverage: number
}

export interface AtypicalExpense {
    categoryId: string
    categoryName: string
    lastMonthAmount: number
    quarterAverage: number
    percentageIncrease: number
    isSignificant: boolean // >50% increase
}

export interface BudgetAllocation {
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

export interface BudgetConflict {
    categoryId: string
    categoryName: string
    existingAmount: number
    existingPeriodStart: string
    existingPeriodEnd: string
    proposedAmount: number
    action: 'replace' | 'keep' | 'skip'
    budgetId: string
}

export interface WizardSummary {
    newBudgets: BudgetAllocation[]
    conflicts: BudgetConflict[]
    totalAllocated: number
    totalAvailable: number
    remainingAmount: number
    unassignedExpensesCount: number
}

export interface EligibleCategory {
    id: string
    name: string
    icon?: string
    color?: string
    totalSpending: number
    isEssential: boolean
    hasRecentActivity: boolean
}

// Essential categories that should always be included
export const ESSENTIAL_CATEGORIES = [
    'food',
    'utilities',
    'transport',
    'housing'
] as const

// Minimum spending threshold to include category
export const MINIMUM_SPENDING_THRESHOLD = 50 