import { BudgetProvider } from '@/lib/context/BudgetContext'

export default function PresupuestoLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <BudgetProvider>
            {children}
        </BudgetProvider>
    )
} 