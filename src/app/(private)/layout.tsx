import { NavWrapper } from "@/components/nav-bar"
import { ExpenseProvider } from '@/lib/context/ExpenseContext'
import { IncomeProvider } from '@/lib/context/IncomeContext'
import { GoalProvider } from "@/lib/context/GoalContext"

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NavWrapper>
            <ExpenseProvider>
                <IncomeProvider>
                    <GoalProvider>
                        {children}
                    </GoalProvider>
                </IncomeProvider>
            </ExpenseProvider>
        </NavWrapper>
    )
}
