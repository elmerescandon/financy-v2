import { ExpenseProvider } from '@/lib/context/ExpenseContext'

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ExpenseProvider>
            {children}
        </ExpenseProvider>
    )
}
