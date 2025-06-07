import { IncomeProvider } from '@/lib/context/IncomeContext'

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <IncomeProvider>
            {children}
        </IncomeProvider>
    )
}
