import { GoalProvider } from '@/lib/context/GoalContext'

export default function MetasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <GoalProvider>
            {children}
        </GoalProvider>
    )
} 