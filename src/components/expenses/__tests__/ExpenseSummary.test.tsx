import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ExpenseSummary } from '../ExpenseSummary'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { formatAmount } from '@/lib/utils/formats'

// Mock dependencies
jest.mock('@/lib/context/ExpenseContext')
jest.mock('@/lib/utils/formats')

// Mock UI components to simplify testing
jest.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
    CardTitle: ({ children, ...props }: any) => <h2 data-testid="card-title" {...props}>{children}</h2>,
}))

jest.mock('@/components/ui/skeleton', () => ({
    Skeleton: ({ className, ...props }: any) => <div data-testid="skeleton" className={className} {...props} />,
}))

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, variant, size, ...props }: any) => (
        <button
            data-testid="button"
            onClick={onClick}
            data-variant={variant}
            data-size={size}
            {...props}
        >
            {children}
        </button>
    ),
}))

const mockUseExpenseContext = useExpenseContext as jest.MockedFunction<typeof useExpenseContext>
const mockFormatAmount = formatAmount as jest.MockedFunction<typeof formatAmount>

const mockExpenses = [
    {
        id: '1',
        amount: 150.50,
        currency: 'PEN' as const,
        description: 'Groceries',
        date: '2024-01-15',
        category_id: 'cat-1',
        subcategory_id: null,
        budget_id: null,
        merchant: 'Supermarket',
        payment_method: 'credit_card' as const,
        notes: null,
        tags: [],
        source: 'manual' as const,
        source_metadata: {},
        confidence_score: 1.0,
        needs_review: false,
        transaction_hash: null,
        receipt_url: null,
        user_id: 'user-1',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        category: {
            id: 'cat-1',
            name: 'Food',
            icon: '🍕',
            color: '#FF6B6B',
        },
        subcategory: null,
    },
    {
        id: '2',
        amount: 75.25,
        currency: 'PEN' as const,
        description: 'Gas',
        date: '2024-01-10',
        category_id: 'cat-2',
        subcategory_id: null,
        budget_id: null,
        merchant: 'Gas Station',
        payment_method: 'debit_card' as const,
        notes: null,
        tags: [],
        source: 'manual' as const,
        source_metadata: {},
        confidence_score: 1.0,
        needs_review: false,
        transaction_hash: null,
        receipt_url: null,
        user_id: 'user-1',
        created_at: '2024-01-10T15:00:00Z',
        updated_at: '2024-01-10T15:00:00Z',
        category: {
            id: 'cat-2',
            name: 'Transport',
            icon: '🚗',
            color: '#4ECDC4',
        },
        subcategory: null,
    },
    {
        id: '3',
        amount: 200.00,
        currency: 'PEN' as const,
        description: 'Restaurant',
        date: '2023-12-20', // Previous month
        category_id: 'cat-1',
        subcategory_id: null,
        budget_id: null,
        merchant: 'Nice Restaurant',
        payment_method: 'credit_card' as const,
        notes: null,
        tags: [],
        source: 'manual' as const,
        source_metadata: {},
        confidence_score: 1.0,
        needs_review: false,
        transaction_hash: null,
        receipt_url: null,
        user_id: 'user-1',
        created_at: '2023-12-20T20:00:00Z',
        updated_at: '2023-12-20T20:00:00Z',
        category: {
            id: 'cat-1',
            name: 'Food',
            icon: '🍕',
            color: '#FF6B6B',
        },
        subcategory: null,
    },
]

const mockExpenseContext = {
    expenses: [],
    allFilteredExpenses: mockExpenses,
    loading: false,
    error: null,
    pagination: null,
    filters: {},
    createExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
    refreshExpenses: jest.fn(),
    updateFilters: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
}

describe('ExpenseSummary', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseExpenseContext.mockReturnValue(mockExpenseContext)
        mockFormatAmount.mockImplementation((amount) => `S/ ${amount.toFixed(2)}`)

        // Mock current date to ensure consistent month filtering  
        const mockDate = new Date('2024-01-15')
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Rendering', () => {
        it('renders all three summary cards', () => {
            render(<ExpenseSummary />)

            expect(screen.getByText('Total Gastos')).toBeInTheDocument()
            expect(screen.getByText('Este Mes')).toBeInTheDocument()
            expect(screen.getByText('Categorías')).toBeInTheDocument()
        })

        it('renders loading state with skeletons', () => {
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                loading: true,
            })

            render(<ExpenseSummary />)

            const skeletons = screen.getAllByTestId('skeleton')
            expect(skeletons).toHaveLength(6) // 2 skeletons per card x 3 cards
        })

        it('displays correct total expense amount when made visible', async () => {
            const user = userEvent.setup()
            render(<ExpenseSummary />)

            // Show the total amount
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 425.75')).toBeInTheDocument() // 150.50 + 75.25 + 200.00
            expect(screen.getByText('3 gastos registrados')).toBeInTheDocument()
        })

        it('displays correct monthly expense amount when made visible', async () => {
            const user = userEvent.setup()
            render(<ExpenseSummary />)

            // Show the monthly amount
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[1])

            expect(screen.getByText('S/ 225.75')).toBeInTheDocument() // 150.50 + 75.25 (current month only)
            expect(screen.getByText('2 gastos este mes')).toBeInTheDocument()
        })

        it('displays correct category count', () => {
            render(<ExpenseSummary />)

            expect(screen.getByText('2')).toBeInTheDocument() // cat-1, cat-2
            expect(screen.getByText('Categorías utilizadas')).toBeInTheDocument()
        })

        it('renders eye toggle buttons in each amount card', () => {
            render(<ExpenseSummary />)

            const toggleButtons = screen.getAllByTestId('amount-toggle')
            expect(toggleButtons).toHaveLength(2) // Total and Monthly cards
        })
    })

    describe('Amount Hiding Functionality', () => {
        it('hides amounts with **** by default', () => {
            render(<ExpenseSummary />)

            const hiddenAmounts = screen.getAllByText('****')
            expect(hiddenAmounts).toHaveLength(2) // Total and Monthly cards
            expect(screen.queryByText('S/ 425.75')).not.toBeInTheDocument()
            expect(screen.queryByText('S/ 225.75')).not.toBeInTheDocument()
        })

        it('shows Eye icon when amounts are hidden', () => {
            render(<ExpenseSummary />)

            const eyeIcons = screen.getAllByTestId('eye-icon')
            expect(eyeIcons).toHaveLength(2)
        })

        it('toggles to show amounts when eye button is clicked', async () => {
            const user = userEvent.setup()
            render(<ExpenseSummary />)

            const toggleButtons = screen.getAllByTestId('amount-toggle')

            // Click first toggle button (Total Gastos)
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 425.75')).toBeInTheDocument()
            expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
        })

        it('toggles back to hide amounts when eye-off button is clicked', async () => {
            const user = userEvent.setup()
            render(<ExpenseSummary />)

            const toggleButtons = screen.getAllByTestId('amount-toggle')

            // Show amounts first
            await user.click(toggleButtons[0])
            expect(screen.getByText('S/ 425.75')).toBeInTheDocument()

            // Hide amounts again
            await user.click(toggleButtons[0])
            const hiddenAmounts = screen.getAllByText('****')
            expect(hiddenAmounts).toHaveLength(2) // Both cards should be hidden again
            expect(screen.queryByText('S/ 425.75')).not.toBeInTheDocument()
        })

        it('manages visibility state independently for each card', async () => {
            const user = userEvent.setup()
            render(<ExpenseSummary />)

            const toggleButtons = screen.getAllByTestId('amount-toggle')

            // Show only Total Gastos amount
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 425.75')).toBeInTheDocument() // Total visible
            expect(screen.getAllByText('****')).toHaveLength(1) // Monthly still hidden
        })

        it('shows amounts correctly when toggled during loading state', async () => {
            const user = userEvent.setup()

            // Start with loading
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                loading: true,
            })

            const { rerender } = render(<ExpenseSummary />)

            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            // Finish loading
            mockUseExpenseContext.mockReturnValue(mockExpenseContext)
            rerender(<ExpenseSummary />)

            expect(screen.getByText('S/ 425.75')).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        it('handles database errors gracefully', async () => {
            const user = userEvent.setup()
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                error: 'Database connection failed',
                allFilteredExpenses: [],
            })

            render(<ExpenseSummary />)

            // Show amounts to verify they are S/ 0.00
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            // Component should still render with zero amounts when visible
            expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
            expect(screen.getByText('0 gastos registrados')).toBeInTheDocument()
            expect(screen.getByText('0 gastos este mes')).toBeInTheDocument()
            expect(screen.getByText('0')).toBeInTheDocument() // Categories
        })

        it('handles formatAmount function errors gracefully', () => {
            mockFormatAmount.mockImplementation(() => {
                throw new Error('Format error')
            })

            // Should not crash the component
            expect(() => render(<ExpenseSummary />)).not.toThrow()
        })

        it('handles empty expense array', async () => {
            const user = userEvent.setup()
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                allFilteredExpenses: [],
            })

            render(<ExpenseSummary />)

            // Show amounts to verify they are S/ 0.00
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
            expect(screen.getByText('0 gastos registrados')).toBeInTheDocument()
            expect(screen.getByText('0 gastos este mes')).toBeInTheDocument()
            expect(screen.getByText('0')).toBeInTheDocument() // Categories
        })

        it('handles invalid expense data gracefully', () => {
            const invalidExpenses = [
                { ...mockExpenses[0], amount: null as any },
                { ...mockExpenses[1], date: 'invalid-date' },
                { ...mockExpenses[2], category_id: null },
            ]

            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                allFilteredExpenses: invalidExpenses as any,
            })

            expect(() => render(<ExpenseSummary />)).not.toThrow()
        })
    })

    describe('Integration with ExpenseContext', () => {
        it('reacts to context loading state changes', () => {
            const { rerender } = render(<ExpenseSummary />)

            // Switch to loading
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                loading: true,
            })

            rerender(<ExpenseSummary />)
            expect(screen.getAllByTestId('skeleton')).toHaveLength(6)

            // Switch back to loaded
            mockUseExpenseContext.mockReturnValue(mockExpenseContext)

            rerender(<ExpenseSummary />)
            expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
        })

        it('updates calculations when expense data changes', async () => {
            const user = userEvent.setup()
            const { rerender } = render(<ExpenseSummary />)

            // Show amounts initially
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 425.75')).toBeInTheDocument() // Initial total

            // Update with new expenses
            const newExpenses = [
                ...mockExpenses,
                {
                    id: '4',
                    amount: 100.00,
                    currency: 'PEN' as const,
                    description: 'New expense',
                    date: '2024-01-20',
                    category_id: 'cat-3',
                    subcategory_id: null,
                    budget_id: null,
                    merchant: 'New Store',
                    payment_method: 'cash' as const,
                    notes: null,
                    tags: [],
                    source: 'manual' as const,
                    source_metadata: {},
                    confidence_score: 1.0,
                    needs_review: false,
                    transaction_hash: null,
                    receipt_url: null,
                    user_id: 'user-1',
                    created_at: '2024-01-20T10:00:00Z',
                    updated_at: '2024-01-20T10:00:00Z',
                    category: {
                        id: 'cat-3',
                        name: 'Shopping',
                        icon: '🛍️',
                        color: '#F39C12',
                    },
                    subcategory: null,
                },
            ]

            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                allFilteredExpenses: newExpenses,
            })

            rerender(<ExpenseSummary />)

            expect(screen.getByText('S/ 525.75')).toBeInTheDocument() // Updated total
            expect(screen.getByText('4 gastos registrados')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument() // Updated category count
        })

        it('maintains visibility state during context updates', async () => {
            const user = userEvent.setup()
            const { rerender } = render(<ExpenseSummary />)

            // Show amounts
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 425.75')).toBeInTheDocument()

            // Update context with new data
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                allFilteredExpenses: [...mockExpenses, {
                    id: '4',
                    amount: 50.00,
                    currency: 'PEN' as const,
                    description: 'New expense',
                    date: '2024-01-20',
                    category_id: 'cat-1',
                    subcategory_id: null,
                    budget_id: null,
                    merchant: 'Test Store',
                    payment_method: 'cash' as const,
                    notes: null,
                    tags: [],
                    source: 'manual' as const,
                    source_metadata: {},
                    confidence_score: 1.0,
                    needs_review: false,
                    transaction_hash: null,
                    receipt_url: null,
                    user_id: 'user-1',
                    created_at: '2024-01-20T10:00:00Z',
                    updated_at: '2024-01-20T10:00:00Z',
                    category: {
                        id: 'cat-1',
                        name: 'Food',
                        icon: '🍕',
                        color: '#FF6B6B',
                    },
                    subcategory: null,
                }],
            })

            rerender(<ExpenseSummary />)

            // Amount should still be visible with updated value
            expect(screen.getByText('S/ 475.75')).toBeInTheDocument()
            expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
        })
    })
}) 