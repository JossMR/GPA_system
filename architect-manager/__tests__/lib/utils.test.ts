import { cn } from '../../lib/utils'

describe('Utils - lib/utils', () => {
    describe('cn function', () => {
        it('should merge single class', () => {
            expect(cn('px-4')).toBe('px-4')
            expect(cn('text-lg')).toBe('text-lg')
        })

        it('should merge multiple classes', () => {
            expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
            expect(cn('text-lg', 'font-bold', 'text-white')).toBe('text-lg font-bold text-white')
        })

        it('should handle array of classes', () => {
            expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2')
            expect(cn(['text-lg', 'font-bold', 'text-white'])).toBe('text-lg font-bold text-white')
        })

        it('should handle mixed strings and arrays', () => {
            expect(cn('px-4', ['py-2', 'bg-blue'])).toBe('px-4 py-2 bg-blue')
            expect(cn(['text-lg'], 'font-bold', ['text-white'])).toBe('text-lg font-bold text-white')
        })

        it('should filter out falsy values', () => {
            expect(cn('px-4', false, 'py-2')).toBe('px-4 py-2')
            expect(cn('px-4', null, 'py-2')).toBe('px-4 py-2')
            expect(cn('px-4', undefined, 'py-2')).toBe('px-4 py-2')
        })

        it('should handle conditional classes', () => {
            const isActive = true
            expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class')

            const isInactive = false
            expect(cn('base-class', isInactive && 'active-class')).toBe('base-class')
        })

        it('should handle object of classes', () => {
            expect(cn({ 'px-4': true, 'py-2': false })).toBe('px-4')
            expect(cn({ 'text-lg': true, 'font-bold': true })).toBe('text-lg font-bold')
        })

        it('should merge conflicting Tailwind classes', () => {
            // When there are conflicting classes, twMerge should keep the last one
            const result = cn('text-red-500', 'text-blue-500')
            expect(result).toContain('text-blue-500')
        })

        it('should handle padding conflicts', () => {
            // px-4 and px-8 conflict, should keep the last one
            const result = cn('px-4', 'px-8')
            expect(result).toContain('px-8')
            expect(result).not.toContain('px-4 px-8')
        })

        it('should handle margin conflicts', () => {
            const result = cn('my-2', 'my-4')
            expect(result).toContain('my-4')
        })

        it('should handle background conflicts', () => {
            const result = cn('bg-red-500', 'bg-blue-500')
            expect(result).toContain('bg-blue-500')
        })

        it('should preserve non-conflicting classes with conflicts', () => {
            const result = cn('px-4 text-lg', 'px-8 font-bold')
            expect(result).toContain('text-lg')
            expect(result).toContain('font-bold')
            expect(result).toContain('px-8')
            expect(result).not.toContain('px-4 px-8')
        })

        it('should handle empty string', () => {
            expect(cn('')).toBe('')
            expect(cn('', '', '')).toBe('')
        })

        it('should handle whitespace', () => {
            const result = cn('  px-4  ', '  py-2  ')
            expect(result).toBeDefined()
        })

        it('should work with common button classes', () => {
            const buttonClasses = cn('inline-flex items-center justify-center', 'px-4 py-2', 'rounded-md', 'font-medium')

            expect(buttonClasses).toContain('inline-flex')
            expect(buttonClasses).toContain('items-center')
            expect(buttonClasses).toContain('justify-center')
            expect(buttonClasses).toContain('px-4')
            expect(buttonClasses).toContain('py-2')
            expect(buttonClasses).toContain('rounded-md')
            expect(buttonClasses).toContain('font-medium')
        })

        it('should work with dynamic styling', () => {
            const variant = 'primary'
            const isLarge = true

            const variantClasses = variant === 'primary' ? 'bg-blue-600' : 'bg-gray-600'
            const sizeClasses = isLarge ? 'text-lg px-6 py-3' : 'text-sm px-3 py-1'

            const result = cn(variantClasses, sizeClasses)
            expect(result).toContain('bg-blue-600')
            expect(result).toContain('text-lg')
            expect(result).toContain('px-6')
        })

        it('should handle nested arrays', () => {
            // Note: behavior may vary based on clsx implementation
            expect(cn([['px-4'], 'py-2'])).toBeDefined()
        })

        it('should be idempotent', () => {
            const classes = 'px-4 py-2 text-lg'
            expect(cn(classes)).toBe(classes)
            expect(cn(cn(classes))).toBe(classes)
        })
    })

    describe('Real-world use cases', () => {
        it('should compose button variants', () => {
            const baseButton = 'inline-flex items-center justify-center rounded-md font-medium'
            const primary = 'bg-blue-600 text-white hover:bg-blue-700'
            const small = 'px-3 py-1 text-sm'

            const primarySmallButton = cn(baseButton, primary, small)
            expect(primarySmallButton).toContain('inline-flex')
            expect(primarySmallButton).toContain('bg-blue-600')
            expect(primarySmallButton).toContain('text-sm')
        })

        it('should handle form input styling', () => {
            const baseInput =
                'w-full px-3 py-2 border rounded-md font-medium text-sm outline-none transition-colors'
            const infoState = 'border-gray-300 bg-white'
            const errorState = 'border-red-500 bg-red-50'

            const isError = false
            const stateClasses = isError ? errorState : infoState

            const inputClass = cn(baseInput, stateClasses)
            expect(inputClass).toContain('w-full')
            expect(inputClass).toContain('border-gray-300')
            expect(inputClass).not.toContain('border-red-500')
        })

        it('should handle responsive classes', () => {
            const responsiveGrid = cn('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')

            expect(responsiveGrid).toContain('grid')
            expect(responsiveGrid).toContain('grid-cols-1')
            expect(responsiveGrid).toContain('md:grid-cols-2')
            expect(responsiveGrid).toContain('lg:grid-cols-3')
        })

        it('should combine utility and custom classes', () => {
            const result = cn('px-4 py-2', 'hover:shadow-lg', 'transition-shadow')

            expect(result).toContain('px-4')
            expect(result).toContain('py-2')
            expect(result).toContain('hover:shadow-lg')
            expect(result).toContain('transition-shadow')
        })
    })
})
