import { formatCurrency, formatNumber } from '../../lib/formatters'

function normalizeFormattedValue(value: string) {
    return value.replace(/\s+/g, ' ').trim()
}

describe('Formatters - lib/formatters', () => {
    describe('formatCurrency', () => {
        it('should format valid number amounts as currency', () => {
            expect(normalizeFormattedValue(formatCurrency(1000))).toBe('₡1 000,00')
            expect(normalizeFormattedValue(formatCurrency(50000))).toBe('₡50 000,00')
            expect(normalizeFormattedValue(formatCurrency(250000))).toBe('₡250 000,00')
        })

        it('should format currency with decimals', () => {
            expect(normalizeFormattedValue(formatCurrency(1500.5))).toBe('₡1 500,50')
            expect(normalizeFormattedValue(formatCurrency(999.99))).toBe('₡999,99')
            expect(normalizeFormattedValue(formatCurrency(0.01))).toBe('₡0,01')
        })

        it('should handle zero amount', () => {
            expect(normalizeFormattedValue(formatCurrency(0))).toBe('₡0,00')
        })

        it('should handle large numbers', () => {
            expect(normalizeFormattedValue(formatCurrency(1000000))).toBe('₡1 000 000,00')
            expect(normalizeFormattedValue(formatCurrency(999999999))).toBe('₡999 999 999,00')
        })

        it('should format string numbers as currency', () => {
            expect(normalizeFormattedValue(formatCurrency('1000'))).toBe('₡1 000,00')
            expect(normalizeFormattedValue(formatCurrency('50000'))).toBe('₡50 000,00')
            expect(normalizeFormattedValue(formatCurrency('2500.75'))).toBe('₡2 500,75')
        })

        it('should handle null and undefined values', () => {
            expect(normalizeFormattedValue(formatCurrency(null))).toBe('₡0,00')
            expect(normalizeFormattedValue(formatCurrency(undefined))).toBe('₡0,00')
        })

        it('should always show 2 decimal places', () => {
            expect(normalizeFormattedValue(formatCurrency(100))).toBe('₡100,00')
            expect(normalizeFormattedValue(formatCurrency(1000.1))).toBe('₡1 000,10')
            expect(normalizeFormattedValue(formatCurrency(50000.5))).toBe('₡50 000,50')
        })

        it('should use Costa Rican colón symbol', () => {
            const result = formatCurrency(1000)
            expect(result).toContain('₡')
        })

        it('should use es-CR locale formatting (spaces for thousands)', () => {
            const result = normalizeFormattedValue(formatCurrency(1000000))
            expect(result).toBe('₡1 000 000,00')
        })

        it('should handle edge cases', () => {
            expect(normalizeFormattedValue(formatCurrency(0.001))).toMatch(/₡0,00/)
            expect(normalizeFormattedValue(formatCurrency(0.005))).toMatch(/₡0,01/)
            expect(normalizeFormattedValue(formatCurrency(0.009))).toMatch(/₡0,01/)
        })

        it('should NOT convert negative numbers to positive', () => {
            const result = formatCurrency(-5000)
            expect(result).toContain('-')
        })
    })

    describe('formatNumber', () => {
        it('should format valid number amounts', () => {
            expect(normalizeFormattedValue(formatNumber(1000))).toBe('1 000,00')
            expect(normalizeFormattedValue(formatNumber(50000))).toBe('50 000,00')
            expect(normalizeFormattedValue(formatNumber(250000))).toBe('250 000,00')
        })

        it('should format numbers with decimals', () => {
            expect(normalizeFormattedValue(formatNumber(1500.5))).toBe('1 500,50')
            expect(normalizeFormattedValue(formatNumber(999.99))).toBe('999,99')
            expect(normalizeFormattedValue(formatNumber(0.01))).toBe('0,01')
        })

        it('should handle zero amount', () => {
            expect(normalizeFormattedValue(formatNumber(0))).toBe('0,00')
        })

        it('should format string numbers', () => {
            expect(normalizeFormattedValue(formatNumber('1000'))).toBe('1 000,00')
            expect(normalizeFormattedValue(formatNumber('50000'))).toBe('50 000,00')
            expect(normalizeFormattedValue(formatNumber('2500.75'))).toBe('2 500,75')
        })

        it('should handle null and undefined values', () => {
            expect(normalizeFormattedValue(formatNumber(null))).toBe('0,00')
            expect(normalizeFormattedValue(formatNumber(undefined))).toBe('0,00')
        })

        it('should always show 2 decimal places', () => {
            expect(normalizeFormattedValue(formatNumber(100))).toBe('100,00')
            expect(normalizeFormattedValue(formatNumber(1000.1))).toBe('1 000,10')
            expect(normalizeFormattedValue(formatNumber(50000.5))).toBe('50 000,50')
        })

        it('should use es-CR locale formatting', () => {
            const result = formatNumber(1000000)
            expect(result).toContain(',')
        })

        it('should NOT include currency symbol', () => {
            const result = formatNumber(1000)
            expect(result).not.toContain('₡')
        })

        it('should handle large numbers', () => {
            expect(normalizeFormattedValue(formatNumber(1000000))).toBe('1 000 000,00')
            expect(normalizeFormattedValue(formatNumber(999999999))).toBe('999 999 999,00')
        })
    })

    describe('formatCurrency vs formatNumber comparison', () => {
        it('should differ only by currency symbol', () => {
            const amount = 5000
            const currency = normalizeFormattedValue(formatCurrency(amount))
            const number = normalizeFormattedValue(formatNumber(amount))

            expect(currency).toContain('₡')
            expect(number).not.toContain('₡')
            expect(currency.replace('₡', '')).toBe(number)
        })

        it('should use same numeric formatting', () => {
            const testAmounts = [1000, 50000, 250000.75]
            testAmounts.forEach((amount) => {
                const currency = normalizeFormattedValue(formatCurrency(amount))
                const number = normalizeFormattedValue(formatNumber(amount))

                // Remove currency symbol and compare
                expect(currency.replace('₡', '').trim()).toBe(number)
            })
        })
    })

    describe('Real-world use cases', () => {
        it('should format typical project budgets', () => {
            const budgets = [50000, 100000, 250000, 500000]
            budgets.forEach((budget) => {
                const formatted = normalizeFormattedValue(formatCurrency(budget))
                expect(formatted).toMatch(/^₡[\d ]+,\d{2}$/)
            })
        })

        it('should format payment amounts', () => {
            const payments = [1000, 5000, 10000, 25000]
            payments.forEach((payment) => {
                const formatted = normalizeFormattedValue(formatCurrency(payment))
                expect(formatted).toMatch(/^₡[\d ]+,\d{2}$/)
                expect(formatted).toContain(',00')
            })
        })

        it('should format partial amounts correctly', () => {
            expect(normalizeFormattedValue(formatCurrency(1234.56))).toBe('₡1 234,56')
            expect(normalizeFormattedValue(formatCurrency(9876.54))).toBe('₡9 876,54')
        })

        it('should handle percentage calculations', () => {
            const baseAmount = 100000
            const percentage30 = (baseAmount * 30) / 100
            const result = normalizeFormattedValue(formatCurrency(percentage30))
            expect(result).toBe('₡30 000,00')
        })
    })
})
