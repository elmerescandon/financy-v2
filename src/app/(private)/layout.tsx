import { NavWrapper } from "@/components/nav-bar"
import { ExpenseProvider } from '@/lib/context/ExpenseContext'
import { IncomeProvider } from '@/lib/context/IncomeContext'

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NavWrapper>
            <ExpenseProvider>
                <IncomeProvider>
                    {children}
                </IncomeProvider>
            </ExpenseProvider>
        </NavWrapper>
    )
}
