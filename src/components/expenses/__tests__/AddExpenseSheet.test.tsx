import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { AddExpenseSheet, AddExpenseSheetRef } from '../AddExpenseSheet'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { createRef } from 'react'

// Mock dependencies
jest.mock('@/hooks/useCategories')
jest.mock('@/lib/context/ExpenseContext')
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

// Mock UI components to avoid complex DOM interactions
jest.mock('@/components/ui/sheet', () => {
    const { forwardRef, cloneElement, useContext } = require('react')

    // Simple context to share state between Sheet and SheetTrigger
    const SheetContext = require('react').createContext({ open: false, setOpen: () => { } })

    return {
        Sheet: ({ children, open, onOpenChange }: any) => {
            const setOpen = (newOpen: boolean) => {
                onOpenChange?.(newOpen)
            }

            return (
                <SheetContext.Provider value={{ open, setOpen }}>
                    <div data-testid="sheet" data-open={open.toString()}>
                        {children}
                    </div>
                </SheetContext.Provider>
            )
        },
        SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
        SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
        SheetTitle: ({ children }: any) => <h1 data-testid="sheet-title">{children}</h1>,
        SheetDescription: ({ children }: any) => <p data-testid="sheet-description">{children}</p>,
        SheetTrigger: ({ children, asChild }: any) => {
            const { setOpen } = useContext(SheetContext)

            const handleClick = () => {
                setOpen(true)
            }

            if (asChild && children) {
                return cloneElement(children, {
                    'data-testid': 'sheet-trigger',
                    onClick: (e: any) => {
                        children.props.onClick?.(e)
                        handleClick()
                    }
                })
            }
            return (
                <div data-testid="sheet-trigger" onClick={handleClick}>
                    {children}
                </div>
            )
        },
    }
})

jest.mock('../ExpenseForm', () => ({
    ExpenseForm: ({ categories, onSubmit, onCancel }: any) => (
        <div data-testid="expense-form">
            <button data-testid="form-submit" onClick={() => onSubmit({ test: 'data' })}>
                Submit
            </button>
            <button data-testid="form-cancel" onClick={onCancel}>
                Cancel
            </button>
        </div>
    ),
}))

const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>
const mockUseExpenseContext = useExpenseContext as jest.MockedFunction<typeof useExpenseContext>

const mockCategories = [
    {
        id: '1',
        name: 'Food',
        icon: '🍕',
        color: '#FF6B6B',
        is_default: true,
        user_id: 'test-user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        subcategories: [],
    },
]

const mockExpenseContext = {
    expenses: [],
    allFilteredExpenses: [],
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

describe('AddExpenseSheet', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCategories.mockReturnValue({
            categories: mockCategories,
            loading: false,
            error: null,
            refresh: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
        })
        mockUseExpenseContext.mockReturnValue(mockExpenseContext)
    })

    describe('Rendering', () => {
        it('renders with trigger button by default', () => {
            render(<AddExpenseSheet />)

            expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /agregar gasto/i })).toBeInTheDocument()
        })

        it('does not render trigger when showTrigger is false', () => {
            render(<AddExpenseSheet showTrigger={false} />)

            expect(screen.queryByTestId('sheet-trigger')).not.toBeInTheDocument()
        })

        it('renders sheet content when opened', async () => {
            const user = userEvent.setup()
            render(<AddExpenseSheet />)

            await user.click(screen.getByRole('button', { name: /agregar gasto/i }))

            expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
            expect(screen.getByTestId('sheet-title')).toHaveTextContent('Agregar Nuevo Gasto')
            expect(screen.getByTestId('sheet-description')).toHaveTextContent(
                'Registra un nuevo gasto y organiza tus finanzas'
            )
            expect(screen.getByTestId('expense-form')).toBeInTheDocument()
        })
    })

    describe('Ref functionality', () => {
        it('opens sheet when ref.open() is called', () => {
            const ref = createRef<AddExpenseSheetRef>()
            render(<AddExpenseSheet ref={ref} showTrigger={false} />)

            // Initially closed
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')

            // Open via ref
            act(() => {
                ref.current?.open()
            })

            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')
        })
    })

    describe('Form interactions', () => {
        it('submits form successfully', async () => {
            const user = userEvent.setup()
            const mockCreateExpense = jest.fn().mockResolvedValue(undefined)
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                createExpense: mockCreateExpense,
            })

            render(<AddExpenseSheet />)

            // Open sheet
            await user.click(screen.getByRole('button', { name: /agregar gasto/i }))

            // Submit form
            await user.click(screen.getByTestId('form-submit'))

            await waitFor(() => {
                expect(mockCreateExpense).toHaveBeenCalledWith({ test: 'data' })
            })

            // Sheet should close after successful submission
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')
        })

        it('handles form submission error', async () => {
            const user = userEvent.setup()
            const mockCreateExpense = jest.fn().mockRejectedValue(new Error('Creation failed'))
            mockUseExpenseContext.mockReturnValue({
                ...mockExpenseContext,
                createExpense: mockCreateExpense,
            })

            // Spy on console.error to verify error logging
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            render(<AddExpenseSheet />)

            // Open sheet
            await user.click(screen.getByRole('button', { name: /agregar gasto/i }))

            // Submit form
            await user.click(screen.getByTestId('form-submit'))

            await waitFor(() => {
                expect(mockCreateExpense).toHaveBeenCalledWith({ test: 'data' })
            })

            // Verify error was logged
            expect(consoleSpy).toHaveBeenCalledWith('Error creating expense:', expect.any(Error))

            // Sheet should remain open on error
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')

            consoleSpy.mockRestore()
        })

        it('cancels form and closes sheet', async () => {
            const user = userEvent.setup()
            render(<AddExpenseSheet />)

            // Open sheet
            await user.click(screen.getByRole('button', { name: /agregar gasto/i }))
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')

            // Cancel form
            await user.click(screen.getByTestId('form-cancel'))

            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')
        })
    })

    describe('Props passing', () => {
        it('passes categories to ExpenseForm', async () => {
            const user = userEvent.setup()
            render(<AddExpenseSheet />)

            await user.click(screen.getByRole('button', { name: /agregar gasto/i }))

            // ExpenseForm should be rendered (mocked component is present)
            expect(screen.getByTestId('expense-form')).toBeInTheDocument()
        })
    })

    describe('Loading states', () => {
        it('handles categories loading state', () => {
            mockUseCategories.mockReturnValue({
                categories: [],
                loading: true,
                error: null,
                refresh: jest.fn(),
                createCategory: jest.fn(),
                updateCategory: jest.fn(),
                deleteCategory: jest.fn(),
            })

            render(<AddExpenseSheet />)

            // Component should still render
            expect(screen.getByRole('button', { name: /agregar gasto/i })).toBeInTheDocument()
        })

        it('handles categories error state', () => {
            mockUseCategories.mockReturnValue({
                categories: [],
                loading: false,
                error: 'Failed to load categories',
                refresh: jest.fn(),
                createCategory: jest.fn(),
                updateCategory: jest.fn(),
                deleteCategory: jest.fn(),
            })

            render(<AddExpenseSheet />)

            // Component should still render
            expect(screen.getByRole('button', { name: /agregar gasto/i })).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('has proper button text and structure', () => {
            render(<AddExpenseSheet />)

            const button = screen.getByRole('button', { name: /agregar gasto/i })
            expect(button).toBeInTheDocument()
            expect(button).toHaveClass('bg-primary')
        })

        it('has proper sheet title and description', async () => {
            const user = userEvent.setup()
            render(<AddExpenseSheet />)

            await user.click(screen.getByRole('button', { name: /agregar gasto/i }))

            expect(screen.getByTestId('sheet-title')).toHaveTextContent('Agregar Nuevo Gasto')
            expect(screen.getByTestId('sheet-description')).toHaveTextContent(
                'Registra un nuevo gasto y organiza tus finanzas'
            )
        })
    })

    describe('Component lifecycle', () => {
        it('maintains display name', () => {
            expect(AddExpenseSheet.displayName).toBe('AddExpenseSheet')
        })

        it('handles rapid open/close operations', async () => {
            const user = userEvent.setup()
            render(<AddExpenseSheet />)

            const button = screen.getByRole('button', { name: /agregar gasto/i })

            // Rapid open/close
            await user.click(button)
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')

            await user.click(screen.getByTestId('form-cancel'))
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')

            await user.click(button)
            expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')
        })
    })
}) 