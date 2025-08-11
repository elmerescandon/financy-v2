import { render, screen, fireEvent } from '@testing-library/react'
import { MobileSelect, MobileSelectTrigger, MobileSelectContent, MobileSelectItem, MobileSelectValue } from '../mobile-select'

describe('MobileSelect', () => {
  const SelectComponent = () => (
    <MobileSelect>
      <MobileSelectTrigger>
        <MobileSelectValue placeholder="Select option" />
      </MobileSelectTrigger>
      <MobileSelectContent>
        <MobileSelectItem value="option1">Option 1</MobileSelectItem>
        <MobileSelectItem value="option2">Option 2</MobileSelectItem>
      </MobileSelectContent>
    </MobileSelect>
  )

  it('renders with mobile-optimized sizing by default', () => {
    render(<SelectComponent />)
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    
    // Should have mobile-first classes to prevent zoom
    expect(trigger).toHaveClass('h-12')
    expect(trigger).toHaveClass('text-base')
    expect(trigger).toHaveClass('sm:h-9')
    expect(trigger).toHaveClass('sm:text-sm')
  })

  it('prevents zoom with minimum 16px font size', () => {
    render(<SelectComponent />)
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    
    // Should have inline style to ensure 16px minimum
    expect(trigger).toHaveStyle({ fontSize: 'max(16px, 1rem)' })
  })

  it('can disable zoom prevention', () => {
    render(
      <MobileSelect>
        <MobileSelectTrigger preventZoom={false}>
          <MobileSelectValue placeholder="No zoom prevention" />
        </MobileSelectTrigger>
      </MobileSelect>
    )
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    
    // Should not have the preventZoom style
    expect(trigger).not.toHaveStyle({ fontSize: 'max(16px, 1rem)' })
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <MobileSelect>
        <MobileSelectTrigger size="sm">
          <MobileSelectValue />
        </MobileSelectTrigger>
      </MobileSelect>
    )
    
    let trigger = screen.getByTestId('mobile-select-trigger')
    expect(trigger).toHaveClass('h-10')
    expect(trigger).toHaveClass('text-sm')
    
    rerender(
      <MobileSelect>
        <MobileSelectTrigger size="lg">
          <MobileSelectValue />
        </MobileSelectTrigger>
      </MobileSelect>
    )
    
    trigger = screen.getByTestId('mobile-select-trigger')
    expect(trigger).toHaveClass('h-14')
    expect(trigger).toHaveClass('text-lg')
  })

  it('applies touch manipulation optimization', () => {
    render(<SelectComponent />)
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    
    expect(trigger).toHaveClass('touch-manipulation')
  })

  it('maintains accessibility attributes', () => {
    render(
      <MobileSelect>
        <MobileSelectTrigger 
          aria-label="Select option"
          disabled
        >
          <MobileSelectValue placeholder="Disabled select" />
        </MobileSelectTrigger>
      </MobileSelect>
    )
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    
    expect(trigger).toHaveAttribute('aria-label', 'Select option')
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveClass('disabled:opacity-50')
  })

  it('opens content when clicked', async () => {
    render(<SelectComponent />)
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    fireEvent.click(trigger)
    
    // Content should appear
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('allows custom styles while preserving zoom prevention', () => {
    render(
      <MobileSelect>
        <MobileSelectTrigger 
          style={{ color: 'red', backgroundColor: 'blue' }}
        >
          <MobileSelectValue placeholder="Custom styles" />
        </MobileSelectTrigger>
      </MobileSelect>
    )
    
    const trigger = screen.getByTestId('mobile-select-trigger')
    
    expect(trigger).toHaveStyle({ 
      fontSize: 'max(16px, 1rem)'
    })
    // Check that custom styles are applied
    expect(trigger.style.color).toBe('red')
    expect(trigger.style.backgroundColor).toBe('blue')
  })

  describe('Touch target compliance', () => {
    it('meets minimum touch target requirements', () => {
      render(<SelectComponent />)
      
      const trigger = screen.getByTestId('mobile-select-trigger')
      
      // h-12 = 48px, which exceeds WCAG 2.5.5 44px requirement
      expect(trigger).toHaveClass('h-12')
    })

    it('provides touch-optimized item sizes', () => {
      render(<SelectComponent />)
      
      const trigger = screen.getByTestId('mobile-select-trigger')
      fireEvent.click(trigger)
      
      const items = screen.getAllByRole('option')
      
      items.forEach(item => {
        // Items should have minimum 44px height on mobile
        expect(item).toHaveClass('min-h-[44px]')
        expect(item).toHaveClass('sm:min-h-[32px]')
        expect(item).toHaveClass('touch-manipulation')
      })
    })
  })

  describe('Responsive behavior', () => {
    it('applies correct classes for different screen sizes', () => {
      render(<SelectComponent />)
      
      const trigger = screen.getByTestId('mobile-select-trigger')
      
      // Mobile classes
      expect(trigger).toHaveClass('h-12')
      expect(trigger).toHaveClass('text-base')
      
      // Desktop classes
      expect(trigger).toHaveClass('sm:h-9')
      expect(trigger).toHaveClass('sm:text-sm')
    })

    it('maintains consistent sizing across breakpoints', () => {
      const { rerender } = render(
        <MobileSelect>
          <MobileSelectTrigger size="lg">
            <MobileSelectValue />
          </MobileSelectTrigger>
        </MobileSelect>
      )
      
      const trigger = screen.getByTestId('mobile-select-trigger')
      
      // Large size should have proper mobile and desktop variants
      expect(trigger).toHaveClass('h-14') // Mobile
      expect(trigger).toHaveClass('text-lg')
      expect(trigger).toHaveClass('sm:h-10') // Desktop
      expect(trigger).toHaveClass('sm:text-base')
    })
  })

  describe('Focus management', () => {
    it('supports keyboard navigation', () => {
      render(<SelectComponent />)
      
      const trigger = screen.getByTestId('mobile-select-trigger')
      
      trigger.focus()
      expect(document.activeElement).toBe(trigger)
      expect(trigger).toHaveClass('focus:border-ring')
      expect(trigger).toHaveClass('focus:ring-ring/50')
    })

    it('has proper focus states for touch devices', () => {
      render(<SelectComponent />)
      
      const trigger = screen.getByTestId('mobile-select-trigger')
      
      expect(trigger).toHaveClass('focus:ring-[3px]')
      expect(trigger).toHaveClass('transition-all')
    })
  })
})