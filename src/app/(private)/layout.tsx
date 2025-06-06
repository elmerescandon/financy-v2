import { NavWrapper } from "@/components/nav-bar"
import { ExpenseProvider } from '@/lib/context/ExpenseContext'

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NavWrapper>
            <ExpenseProvider>
                {children}
            </ExpenseProvider>
        </NavWrapper>
    )
}
