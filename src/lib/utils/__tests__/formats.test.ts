import { formatAmount, formatDate } from '../formats'

describe('formatAmount', () => {
    it('formats PEN currency correctly by default', () => {
        const result = formatAmount(1234.56)
        expect(result).toMatch(/S\/.*1.*234.*56/)
    })

    it('formats different currencies correctly', () => {
        const usdResult = formatAmount(1234.56, 'USD')
        expect(usdResult).toBe('USD 1,234.56')
    })

    it('handles zero amount', () => {
        const result = formatAmount(0)
        expect(result).toMatch(/S\/.*0/)
    })

    it('handles negative amounts', () => {
        const result = formatAmount(-1234.56)
        expect(result).toMatch(/-.*S\/.*1.*234.*56/)
    })

    it('handles decimal values correctly', () => {
        const result = formatAmount(99.99)
        expect(result).toMatch(/S\/.*99.*99/)
    })

    it('handles large numbers', () => {
        const result = formatAmount(1000000.50)
        expect(result).toMatch(/S\/.*1.*000.*000.*50/)
    })
})

describe('formatDate', () => {
    it('formats date string correctly in Spanish locale', () => {
        const result = formatDate('2024-01-15')
        expect(result).toMatch(/1[45] ene\.? 2024/)
    })

    it('handles different date formats', () => {
        const result = formatDate('2024-12-25T10:30:00Z')
        expect(result).toMatch(/2[45] dic\.? 2024/)
    })

    it('handles ISO date strings', () => {
        const result = formatDate('2024-06-01T00:00:00.000Z')
        expect(result).toMatch(/(31 may|1 jun)\.? 2024/)
    })

    it('handles edge cases - new year', () => {
        const result = formatDate('2024-01-01')
        expect(result).toMatch(/(31 dic\.? 2023|1 ene\.? 2024)/)
    })

    it('handles edge cases - end of year', () => {
        const result = formatDate('2024-12-31')
        expect(result).toMatch(/(30|31) dic\.? 2024/)
    })
}) 