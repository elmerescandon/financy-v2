import { NavWrapper } from "@/components/nav-bar"

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NavWrapper>
            {children}
        </NavWrapper>
    )
}
