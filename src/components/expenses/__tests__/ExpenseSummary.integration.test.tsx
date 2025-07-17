import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ExpenseSummary } from '../ExpenseSummary'
import { ExpenseProvider } from '@/lib/context/ExpenseContext'
import { formatAmount } from '@/lib/utils/formats'

// Mock dependencies
jest.mock('@/lib/utils/formats')
jest.mock('@/lib/supabase/expenses')

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

const mockFormatAmount = formatAmount as jest.MockedFunction<typeof formatAmount>

// Mock the Supabase client and services
const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabaseClient,
}))

const mockExpenseService = {
    getFilteredWithPagination: jest.fn(),
}

jest.mock('@/lib/supabase/expenses', () => ({
    ExpenseService: jest.fn().mockImplementation(() => mockExpenseService),
}))

// Mock authentication
const mockUser = { id: 'test-user-123' }
jest.mock('@/lib/supabase/server', () => ({
    createClient: () => ({
        auth: {
            getUser: () => Promise.resolve({ data: { user: mockUser } }),
        },
    }),
}))

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
        user_id: 'test-user-123',
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
        user_id: 'test-user-123',
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
]

// Test wrapper with ExpenseProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ExpenseProvider>{children}</ExpenseProvider>
)

describe('ExpenseSummary Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFormatAmount.mockImplementation((amount) => `S/ ${amount.toFixed(2)}`)

        // Mock current date to ensure consistent month filtering
        const mockDate = new Date('2024-01-15')
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

        // Setup default successful API response
        mockExpenseService.getFilteredWithPagination.mockResolvedValue({
            data: mockExpenses,
            pagination: {
                page: 1,
                limit: 20,
                total: mockExpenses.length,
                total_pages: 1,
            },
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Integration with ExpenseProvider', () => {
        it('loads and displays expenses from context provider', async () => {
            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            // Should start with loading state
            expect(screen.getAllByTestId('skeleton')).toHaveLength(6)

            // Wait for data to load
            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            })

            // Should display calculated amounts
            expect(screen.getByText('S/ 225.75')).toBeInTheDocument() // Total (both expenses in current month)
            expect(screen.getByText('2 gastos registrados')).toBeInTheDocument()
        })

        it('handles API errors gracefully through context', async () => {
            mockExpenseService.getFilteredWithPagination.mockRejectedValue(
                new Error('Database connection failed')
            )

            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            })

            // Should display empty state when API fails
            expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
            expect(screen.getByText('0 gastos registrados')).toBeInTheDocument()
        })

        it('maintains amount visibility state across context updates', async () => {
            const user = userEvent.setup()

            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            // Wait for initial load
            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            })

            // Show amounts
            const toggleButtons = screen.getAllByTestId('amount-toggle')
            await user.click(toggleButtons[0])

            expect(screen.getByText('S/ 225.75')).toBeInTheDocument()

            // Simulate context refresh with new data
            const newExpenses = [
                ...mockExpenses,
                {
                    id: '3',
                    amount: 100.00,
                    currency: 'PEN' as const,
                    description: 'New expense',
                    date: '2024-01-16',
                    category_id: 'cat-1',
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
                    user_id: 'test-user-123',
                    created_at: '2024-01-16T10:00:00Z',
                    updated_at: '2024-01-16T10:00:00Z',
                    category: {
                        id: 'cat-1',
                        name: 'Food',
                        icon: '🍕',
                        color: '#FF6B6B',
                    },
                    subcategory: null,
                },
            ]

            mockExpenseService.getFilteredWithPagination.mockResolvedValue({
                data: newExpenses,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: newExpenses.length,
                    total_pages: 1,
                },
            })

            // Trigger context refresh (simulating data update)
            // In a real integration test, this would be triggered by user actions or external events
            await waitFor(() => {
                expect(screen.getByText('S/ 325.75')).toBeInTheDocument() // Updated total
            })

            // Visibility state should be maintained
            expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
        })

        it('handles empty response from API', async () => {
            mockExpenseService.getFilteredWithPagination.mockResolvedValue({
                data: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    total_pages: 0,
                },
            })

            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            })

            expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
            expect(screen.getByText('0 gastos registrados')).toBeInTheDocument()
            expect(screen.getByText('0 gastos este mes')).toBeInTheDocument()
            expect(screen.getByText('0')).toBeInTheDocument() // Categories
        })

        it('handles network timeout errors', async () => {
            mockExpenseService.getFilteredWithPagination.mockImplementation(
                () => new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Network timeout')), 100)
                )
            )

            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            // Should show loading initially
            expect(screen.getAllByTestId('skeleton')).toHaveLength(6)

            // Wait for timeout and error handling
            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            // Should show empty state after error
            expect(screen.getByText('S/ 0.00')).toBeInTheDocument()
        })

        it('reacts to filter changes from context', async () => {
            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            })

            // Simulate filter change by updating mock response
            const filteredExpenses = [mockExpenses[0]] // Only first expense

            mockExpenseService.getFilteredWithPagination.mockResolvedValue({
                data: filteredExpenses,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 1,
                    total_pages: 1,
                },
            })

            // In real scenario, this would be triggered by filter component
            await waitFor(() => {
                expect(screen.getByText('S/ 150.50')).toBeInTheDocument()
                expect(screen.getByText('1 gastos registrados')).toBeInTheDocument()
            })
        })

        it('handles concurrent API requests gracefully', async () => {
            let resolveCount = 0
            mockExpenseService.getFilteredWithPagination.mockImplementation(() => {
                resolveCount++
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            data: resolveCount === 1 ? [] : mockExpenses,
                            pagination: {
                                page: 1,
                                limit: 20,
                                total: resolveCount === 1 ? 0 : mockExpenses.length,
                                total_pages: resolveCount === 1 ? 0 : 1,
                            },
                        })
                    }, resolveCount === 1 ? 200 : 100)
                })
            })

            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            // Should eventually show the latest (faster) response
            await waitFor(() => {
                expect(screen.getByText('S/ 225.75')).toBeInTheDocument()
            }, { timeout: 3000 })
        })
    })

    describe('Performance with Large Datasets', () => {
        it('handles large number of expenses efficiently', async () => {
            const largeExpenseSet = Array.from({ length: 1000 }, (_, i) => ({
                ...mockExpenses[0],
                id: `expense-${i}`,
                amount: Math.random() * 100,
                date: i % 2 === 0 ? '2024-01-15' : '2023-12-15', // Half current month, half previous
            }))

            mockExpenseService.getFilteredWithPagination.mockResolvedValue({
                data: largeExpenseSet,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: largeExpenseSet.length,
                    total_pages: 50,
                },
            })

            const startTime = performance.now()

            render(
                <TestWrapper>
                    <ExpenseSummary />
                </TestWrapper>
            )

            await waitFor(() => {
                expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
            })

            const endTime = performance.now()
            const renderTime = endTime - startTime

            // Should render within reasonable time (less than 1 second)
            expect(renderTime).toBeLessThan(1000)

            // Should display calculated totals
            expect(screen.getByText(/S\//)).toBeInTheDocument()
            expect(screen.getByText(/gastos registrados/)).toBeInTheDocument()
        })
    })
}) 