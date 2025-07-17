import { cn, formatCurrency } from '../utils'

describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
        const result = cn('bg-red-500', 'text-white')
        expect(result).toBe('bg-red-500 text-white')
    })

    it('handles Tailwind class conflicts', () => {
        const result = cn('bg-red-500', 'bg-blue-500')
        expect(result).toBe('bg-blue-500')
    })

    it('handles conditional classes', () => {
        const isActive = true
        const result = cn('base-class', isActive && 'active-class')
        expect(result).toBe('base-class active-class')
    })

    it('handles undefined and null values', () => {
        const result = cn('base-class', undefined, null, 'end-class')
        expect(result).toBe('base-class end-class')
    })

    it('handles arrays of classes', () => {
        const result = cn(['class1', 'class2'], 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    it('handles empty input', () => {
        const result = cn()
        expect(result).toBe('')
    })
})

describe('formatCurrency', () => {
    it('formats PEN currency correctly', () => {
        const result = formatCurrency(1234.56)
        expect(result).toMatch(/S\/.*1.*234.*56/)
    })

    it('handles zero amount', () => {
        const result = formatCurrency(0)
        expect(result).toMatch(/S\/.*0/)
    })

    it('handles negative amounts', () => {
        const result = formatCurrency(-1234.56)
        expect(result).toMatch(/-.*S\/.*1.*234.*56/)
    })

    it('handles decimal precision', () => {
        const result = formatCurrency(99.9)
        expect(result).toMatch(/S\/.*99.*90/)
    })

    it('handles large numbers', () => {
        const result = formatCurrency(1000000)
        expect(result).toMatch(/S\/.*1.*000.*000/)
    })
}) 