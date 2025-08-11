import { render, screen, fireEvent } from '@testing-library/react'
import { MobileCard, MobileCardHeader, MobileCardTitle, MobileCardDescription, MobileCardContent, MobileCardFooter, ExpenseCard } from '../mobile-card'

describe('MobileCard', () => {
  it('renders with default styling', () => {
    render(
      <MobileCard>
        <div>Card content</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('p-4')
    expect(card).toHaveClass('mb-4')
  })

  it('renders as interactive when specified', () => {
    const handleInteract = jest.fn()
    render(
      <MobileCard interactive onInteract={handleInteract}>
        <div>Interactive card</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('cursor-pointer')
    expect(card).toHaveClass('touch-manipulation')
    expect(card).toHaveClass('hover:bg-accent/5')
    expect(card).toHaveAttribute('role', 'button')
    expect(card).toHaveAttribute('tabIndex', '0')
  })

  it('handles interactions correctly', () => {
    const handleInteract = jest.fn()
    const handleClick = jest.fn()
    
    render(
      <MobileCard interactive onInteract={handleInteract} onClick={handleClick}>
        <div>Clickable card</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    fireEvent.click(card)
    
    expect(handleInteract).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies touch size with proper height', () => {
    render(
      <MobileCard size="touch">
        <div>Touch card</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('p-4')
    expect(card).toHaveClass('min-h-[60px]')
  })

  it('applies compact size for dense layouts', () => {
    render(
      <MobileCard size="compact">
        <div>Compact card</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('p-3')
    expect(card).toHaveClass('min-h-[48px]')
  })

  it('handles different spacing variants', () => {
    const { rerender } = render(
      <MobileCard spacing="tight">
        <div>Tight spacing</div>
      </MobileCard>
    )
    
    let card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('mb-2')
    
    rerender(
      <MobileCard spacing="comfortable">
        <div>Comfortable spacing</div>
      </MobileCard>
    )
    
    card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('mb-6')
  })

  it('supports keyboard navigation when interactive', () => {
    render(
      <MobileCard interactive>
        <div>Keyboard accessible</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    card.focus()
    expect(document.activeElement).toBe(card)
  })
})

describe('MobileCard sub-components', () => {
  it('renders MobileCardHeader with proper layout', () => {
    render(
      <MobileCardHeader>
        <div>Header content</div>
      </MobileCardHeader>
    )
    
    const header = screen.getByText('Header content').parentElement
    expect(header).toHaveClass('flex')
    expect(header).toHaveClass('items-start')
    expect(header).toHaveClass('justify-between')
    expect(header).toHaveClass('mb-3')
  })

  it('renders MobileCardTitle with proper typography', () => {
    render(<MobileCardTitle>Card Title</MobileCardTitle>)
    
    const title = screen.getByText('Card Title')
    expect(title.tagName).toBe('H3')
    expect(title).toHaveClass('text-base')
    expect(title).toHaveClass('font-semibold')
    expect(title).toHaveClass('sm:text-lg')
  })

  it('renders MobileCardDescription with muted text', () => {
    render(<MobileCardDescription>Description text</MobileCardDescription>)
    
    const description = screen.getByText('Description text')
    expect(description).toHaveClass('text-sm')
    expect(description).toHaveClass('text-muted-foreground')
  })

  it('renders MobileCardContent with proper spacing', () => {
    render(
      <MobileCardContent>
        <div>Content</div>
      </MobileCardContent>
    )
    
    const content = screen.getByText('Content').parentElement
    expect(content).toHaveClass('space-y-2')
  })

  it('renders MobileCardFooter with separator', () => {
    render(
      <MobileCardFooter>
        <div>Footer content</div>
      </MobileCardFooter>
    )
    
    const footer = screen.getByText('Footer content').parentElement
    expect(footer).toHaveClass('flex')
    expect(footer).toHaveClass('items-center')
    expect(footer).toHaveClass('justify-between')
    expect(footer).toHaveClass('border-t')
  })
})

describe('ExpenseCard', () => {
  const mockExpense = {
    id: '1',
    description: 'Test expense',
    amount: 25.99,
    date: '2024-01-15T12:00:00Z',
    merchant: 'Test Merchant',
    category: {
      name: 'Food',
      icon: '🍕'
    }
  }

  const mockFormatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  it('renders expense information correctly', () => {
    render(
      <ExpenseCard
        expense={mockExpense}
        formatCurrency={mockFormatCurrency}
      />
    )
    
    expect(screen.getByText('Test expense')).toBeInTheDocument()
    expect(screen.getByText('Test Merchant')).toBeInTheDocument()
    expect(screen.getByText('$25.99')).toBeInTheDocument()
    expect(screen.getByText('🍕')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('handles edit action', () => {
    const handleEdit = jest.fn()
    render(
      <ExpenseCard
        expense={mockExpense}
        formatCurrency={mockFormatCurrency}
        onEdit={handleEdit}
      />
    )
    
    const editButton = screen.getByText('Editar')
    fireEvent.click(editButton)
    
    expect(handleEdit).toHaveBeenCalledWith('1')
  })

  it('handles delete action', () => {
    const handleDelete = jest.fn()
    render(
      <ExpenseCard
        expense={mockExpense}
        formatCurrency={mockFormatCurrency}
        onDelete={handleDelete}
      />
    )
    
    const deleteButton = screen.getByText('Eliminar')
    fireEvent.click(deleteButton)
    
    expect(handleDelete).toHaveBeenCalledWith('1')
  })

  it('renders without merchant when not provided', () => {
    const expenseWithoutMerchant = { ...mockExpense, merchant: undefined }
    render(
      <ExpenseCard
        expense={expenseWithoutMerchant}
        formatCurrency={mockFormatCurrency}
      />
    )
    
    expect(screen.queryByText('Test Merchant')).not.toBeInTheDocument()
    expect(screen.getByText('Test expense')).toBeInTheDocument()
  })

  it('renders without category when not provided', () => {
    const expenseWithoutCategory = { ...mockExpense, category: undefined }
    render(
      <ExpenseCard
        expense={expenseWithoutCategory}
        formatCurrency={mockFormatCurrency}
      />
    )
    
    expect(screen.queryByText('🍕')).not.toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes for actions', () => {
    render(
      <ExpenseCard
        expense={mockExpense}
        formatCurrency={mockFormatCurrency}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    
    const editButton = screen.getByText('Editar')
    const deleteButton = screen.getByText('Eliminar')
    
    expect(editButton).toHaveAttribute('aria-label', 'Edit expense Test expense')
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete expense Test expense')
    expect(editButton).toHaveClass('touch-manipulation')
    expect(deleteButton).toHaveClass('touch-manipulation')
  })

  it('formats date correctly', () => {
    render(
      <ExpenseCard
        expense={mockExpense}
        formatCurrency={mockFormatCurrency}
      />
    )
    
    // Should display date in Spanish format (dd/mm/yyyy)
    expect(screen.getByText('15/1/2024')).toBeInTheDocument()
  })

  it('uses touch-optimized size by default', () => {
    render(
      <ExpenseCard
        expense={mockExpense}
        formatCurrency={mockFormatCurrency}
      />
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('min-h-[60px]')
  })
})

describe('Touch interaction compliance', () => {
  it('meets minimum touch target requirements', () => {
    render(<MobileCard size="touch">Touch card</MobileCard>)
    
    const card = screen.getByTestId('mobile-card')
    // min-h-[60px] exceeds WCAG 2.5.5 44px requirement
    expect(card).toHaveClass('min-h-[60px]')
  })

  it('provides visual feedback for touch interactions', () => {
    render(
      <MobileCard interactive>
        <div>Interactive card</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('active:scale-[0.98]')
    expect(card).toHaveClass('active:shadow-sm')
  })

  it('optimizes for touch responsiveness', () => {
    render(
      <MobileCard interactive>
        <div>Touch optimized</div>
      </MobileCard>
    )
    
    const card = screen.getByTestId('mobile-card')
    expect(card).toHaveClass('touch-manipulation')
  })
})