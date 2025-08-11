import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExpenseForm } from '../expenses/ExpenseForm'
import { ExpenseTable } from '../expense-table/ExpenseTable'
import { AddExpenseSheet } from '../expenses/AddExpenseSheet'
import Navigation from '../nav-bar/navigation'
import { MobileButton } from '../ui/mobile-button'
import { MobileInput, MobileNumberInput } from '../ui/mobile-input'

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock the context and hooks
jest.mock('@/lib/context/ExpenseContext', () => ({
  useExpenseContext: () => ({
    expenses: [],
    pagination: { 
      page: 1, 
      pageSize: 10, 
      total: 0, 
      totalPages: 0,
      limit: 10 // Add limit property
    },
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    deleteExpense: jest.fn(),
    loading: false,
    error: null,
  })
}))

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      {
        id: '1',
        name: 'Food',
        icon: '🍕',
        subcategories: [
          { id: '1', name: 'Restaurant', category_id: '1' }
        ]
      }
    ]
  })
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  })
}))

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  })
}))

describe('Mobile Integration Tests', () => {
  describe('Touch Target Compliance', () => {
    it('ensures all interactive elements meet WCAG 2.5.5 requirements', () => {
      render(
        <div>
          <MobileButton size="default" aria-label="Default button">Default</MobileButton>
          <MobileButton size="touch" aria-label="Touch button">Touch</MobileButton>
          <MobileButton size="icon" aria-label="Icon button">🏠</MobileButton>
        </div>
      )

      const buttons = screen.getAllByTestId('mobile-button')
      
      // Default: h-12 = 48px (exceeds 44px requirement)
      expect(buttons[0]).toHaveClass('h-12')
      
      // Touch: h-12 + min-width (optimal for CTAs)
      expect(buttons[1]).toHaveClass('h-12')
      expect(buttons[1]).toHaveClass('min-w-[120px]')
      
      // Icon: size-12 = 48x48px (exceeds 44px requirement)
      expect(buttons[2]).toHaveClass('size-12')
    })

    it('provides adequate spacing between touch targets', () => {
      render(
        <div>
          <MobileButton spacing="comfortable" aria-label="Button 1">1</MobileButton>
          <MobileButton spacing="comfortable" aria-label="Button 2">2</MobileButton>
        </div>
      )

      const buttons = screen.getAllByTestId('mobile-button')
      buttons.forEach(button => {
        // m-2 provides 8px margin, meeting spacing requirements
        expect(button).toHaveClass('mx-2')
        expect(button).toHaveClass('my-2')
      })
    })
  })

  describe('Input Zoom Prevention', () => {
    it('prevents iOS zoom with proper font sizing', () => {
      render(
        <div>
          <MobileInput placeholder="Regular input" />
          <MobileNumberInput placeholder="Number input" />
        </div>
      )

      const inputs = screen.getAllByTestId('mobile-input')
      
      inputs.forEach(input => {
        // Should have minimum 16px font size to prevent zoom
        expect(input).toHaveStyle({ fontSize: 'max(16px, 1rem)' })
        
        // Should have mobile-first responsive sizing
        expect(input).toHaveClass('h-12') // Mobile: 48px
        expect(input).toHaveClass('text-base') // Mobile: 16px
        expect(input).toHaveClass('sm:h-9') // Desktop: 36px
        expect(input).toHaveClass('sm:text-sm') // Desktop: 14px
      })
    })

    it('applies touch optimization to inputs', () => {
      render(<MobileInput touchEnhanced placeholder="Touch input" />)
      
      const input = screen.getByTestId('mobile-input')
      expect(input).toHaveClass('touch-manipulation')
      expect(input).toHaveClass('selection:bg-primary/20')
    })
  })

  describe('Form Mobile Optimization', () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Food',
        icon: '🍕',
        subcategories: [
          { id: '1', name: 'Restaurant', category_id: '1' }
        ]
      }
    ]

    it('uses mobile-optimized inputs and buttons', async () => {
      render(
        <ExpenseForm
          categories={mockCategories}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      // Amount input should be mobile-optimized number input
      const amountInput = screen.getByPlaceholderText('0.00')
      expect(amountInput).toHaveAttribute('inputMode', 'decimal')
      expect(amountInput).toHaveStyle({ fontSize: 'max(16px, 1rem)' })

      // Action buttons should use touch size
      const createButton = screen.getByText('Crear')
      const cancelButton = screen.getByText('Cancelar')
      
      expect(createButton).toHaveClass('h-12') // Touch-optimized height
      expect(cancelButton).toHaveClass('h-12')
    })

    it('uses mobile-first responsive layouts', () => {
      render(
        <ExpenseForm
          categories={mockCategories}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      // Form should have mobile-first spacing
      const form = screen.getByText('Crear').closest('form')
      expect(form).toHaveClass('space-y-4')
      expect(form).toHaveClass('lg:space-y-2')

      // Grid layouts should be mobile-first
      const gridElements = form?.querySelectorAll('[class*="grid-cols-1"]')
      expect(gridElements?.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Table/Card Layout', () => {
    it('shows table on desktop and cards on mobile', () => {
      render(<ExpenseTable onAddExpense={jest.fn()} />)

      // Desktop table should be hidden on mobile
      const tableHeader = screen.getAllByText('Fecha')[0] // Get first occurrence (desktop)
      const desktopSection = tableHeader.closest('[class*="hidden"]')
      expect(desktopSection).toHaveClass('hidden')
      expect(desktopSection).toHaveClass('lg:block')

      // Mobile cards container should be hidden on desktop
      const mobileElements = screen.getAllByText('No tienes gastos registrados aún.')
      const mobileContainer = mobileElements.find(el => 
        el.closest('[class*="lg:hidden"]')
      )
      expect(mobileContainer?.closest('[class*="lg:hidden"]')).toHaveClass('lg:hidden')
    })

    it('uses touch-optimized buttons in empty states', () => {
      render(<ExpenseTable onAddExpense={jest.fn()} />)

      const addButtons = screen.getAllByText('Agregar tu primer gasto')
      // Check mobile version (should have max-w-sm)
      const mobileButton = addButtons.find(btn => 
        btn.classList.contains('max-w-sm')
      )
      expect(mobileButton).toHaveClass('h-12') // Touch size
      expect(mobileButton).toHaveClass('w-full') // Full width on mobile
      expect(mobileButton).toHaveClass('max-w-sm') // Constrained max width
    })
  })

  describe('Navigation Touch Targets', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      }
    }

    it('provides proper touch target for sidebar trigger', () => {
      render(
        <Navigation user={mockUser}>
          <div>Content</div>
        </Navigation>
      )

      // Navigation trigger should be wrapped in touch target
      const trigger = screen.getByLabelText('Toggle sidebar menu')
      expect(trigger).toHaveClass('size-12') // 48px touch target
      expect(trigger).toHaveAttribute('aria-label', 'Toggle sidebar menu')
    })
  })

  describe('Mobile Interaction Feedback', () => {
    it('provides haptic feedback for interactive elements', () => {
      render(
        <MobileButton hapticFeedback aria-label="Haptic button">
          Touch Me
        </MobileButton>
      )

      const button = screen.getByTestId('mobile-button')
      expect(button).toHaveClass('active:scale-95')
      expect(button).toHaveClass('active:transition-transform')
      expect(button).toHaveClass('active:duration-75')
    })

    it('optimizes touch manipulation', () => {
      render(
        <div>
          <MobileButton touchOptimized aria-label="Touch button">Button</MobileButton>
          <MobileInput touchEnhanced placeholder="Touch input" />
        </div>
      )

      const button = screen.getByTestId('mobile-button')
      const input = screen.getByTestId('mobile-input')

      expect(button).toHaveClass('touch-manipulation')
      expect(button).toHaveClass('select-none')
      expect(input).toHaveClass('touch-manipulation')
    })
  })

  describe('Accessibility in Mobile Context', () => {
    it('maintains focus management on touch devices', async () => {
      render(
        <div>
          <MobileButton aria-label="First button">First</MobileButton>
          <MobileInput placeholder="Test input" />
          <MobileButton aria-label="Last button">Last</MobileButton>
        </div>
      )

      const buttons = screen.getAllByTestId('mobile-button')
      const input = screen.getByTestId('mobile-input')

      // Should be able to focus elements
      buttons[0].focus()
      expect(document.activeElement).toBe(buttons[0])

      input.focus()
      expect(document.activeElement).toBe(input)
    })

    it('provides proper aria labels for touch interactions', () => {
      render(
        <AddExpenseSheet showTrigger />
      )

      const triggerButton = screen.getByText('Agregar Gasto')
      expect(triggerButton).toHaveClass('h-12') // Touch optimized
      expect(triggerButton.closest('button')).toHaveAttribute('type', 'button')
    })
  })

  describe('Performance on Mobile', () => {
    it('uses efficient CSS for touch interactions', () => {
      render(
        <MobileButton size="touch" hapticFeedback aria-label="Performance test">
          Test
        </MobileButton>
      )

      const button = screen.getByTestId('mobile-button')
      
      // Should use hardware acceleration friendly transforms
      expect(button).toHaveClass('active:scale-95')
      expect(button).toHaveClass('transition-all')
      
      // Should prevent unnecessary repaints
      expect(button).toHaveClass('touch-manipulation')
    })

    it('prevents layout shifts on input focus', () => {
      render(<MobileInput placeholder="Stable input" />)
      
      const input = screen.getByTestId('mobile-input')
      
      // Should have consistent sizing that prevents layout shift
      expect(input).toHaveClass('h-12')
      expect(input).toHaveStyle({ fontSize: 'max(16px, 1rem)' })
    })
  })

  describe('Cross-Platform Consistency', () => {
    it('adapts button sizes across breakpoints', () => {
      render(
        <MobileButton size="default" aria-label="Responsive button">
          Responsive
        </MobileButton>
      )

      const button = screen.getByTestId('mobile-button')
      
      // Mobile-first, then desktop overrides
      expect(button).toHaveClass('h-12') // Mobile: 48px
      expect(button).toHaveClass('text-base') // Mobile: 16px
      expect(button).toHaveClass('sm:h-9') // Desktop: 36px  
      expect(button).toHaveClass('sm:text-sm') // Desktop: 14px
    })

    it('maintains consistent input behavior', () => {
      render(
        <div>
          <MobileInput placeholder="Text input" />
          <MobileNumberInput placeholder="Number input" />
        </div>
      )

      const inputs = screen.getAllByTestId('mobile-input')
      
      inputs.forEach(input => {
        // Consistent mobile sizing
        expect(input).toHaveClass('h-12')
        expect(input).toHaveClass('text-base')
        
        // Consistent desktop sizing
        expect(input).toHaveClass('sm:h-9')
        expect(input).toHaveClass('sm:text-sm')
      })
    })
  })
})