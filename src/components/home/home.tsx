"use client"
import { useGoalContext } from "@/lib/context/GoalContext"
import { useExpenseContext } from "@/lib/context/ExpenseContext"
import { useIncomeContext } from "@/lib/context/IncomeContext"
import { IncomeWithDetails } from "@/types/income"
import { GoalEntry, GoalInsight } from "@/types/goal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAmount } from "@/lib/utils/formats"

export default function HomeComponent() {

    // const { allFilteredExpenses, loading: expensesLoading } = useExpenseContext()
    // const { incomes, loading: incomesLoading } = useIncomeContext()
    // const { goals, loading: goalsLoading } = useGoalContext()

    // // Calculate totals
    // const totalExpenses = allFilteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    // const totalIncome = incomes.reduce((sum: number, income: IncomeWithDetails) => sum + income.amount, 0)
    // const totalSavings = goals.reduce((sum: number, goal: GoalInsight) => sum + (goal.recent_entries.reduce((sum: number, entry: GoalEntry) => sum + entry.amount, 0) || 0), 0)

    // // Calculate balance: Earnings - Expenses - Savings
    // const balance = totalIncome - totalExpenses - totalSavings

    return (
        <div className="p-8">
            {/* <div className="flex flex-col gap-6">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-xl">Balance del Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatAmount(balance)}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ingresos - Gastos - Ahorros
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Gastos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-red-600">
                                {formatAmount(totalExpenses)}
                            </div>
                            <p className="text-sm text-muted-foreground">Gastos del mes</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ingresos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-green-600">
                                {formatAmount(totalIncome)}
                            </div>
                            <p className="text-sm text-muted-foreground">Ingresos del mes</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ahorros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-blue-600">
                                {formatAmount(totalSavings)}
                            </div>
                            <p className="text-sm text-muted-foreground">Meta del mes</p>
                        </CardContent>
                    </Card>
                </div>
            </div> */}
        </div>
    )
}
