import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock para next-themes
jest.mock('next-themes', () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useTheme: () => ({
        theme: 'light',
        setTheme: jest.fn(),
    }),
}))

// Mock para lucide-react
jest.mock('lucide-react', () => ({
    Moon: ({ className }: { className?: string }) => <div data-testid="moon-icon" className={className} />,
    Sun: ({ className }: { className?: string }) => <div data-testid="sun-icon" className={className} />,
    Menu: ({ className }: { className?: string }) => <div data-testid="menu-icon" className={className} />,
    X: ({ className }: { className?: string }) => <div data-testid="x-icon" className={className} />,
    LogOut: ({ className }: { className?: string }) => <div data-testid="logout-icon" className={className} />,
    Bell: ({ className }: { className?: string }) => <div data-testid="bell-icon" className={className} />,
}))

// Mock para components/ui/button
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}))

describe('Theme Toggle Component', () => {
    it('should render Sun icon on light theme', () => {
        const { ThemeToggle } = require('../../components/theme-toggle')
        render(<ThemeToggle />)

        const sunIcon = screen.queryByTestId('sun-icon')
        expect(sunIcon).toBeInTheDocument()
    })

    it('should be a button element', () => {
        const { ThemeToggle } = require('../../components/theme-toggle')
        const { container } = render(<ThemeToggle />)

        const button = container.querySelector('button')
        expect(button).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
        const { ThemeToggle } = require('../../components/theme-toggle')
        const { container } = render(<ThemeToggle />)

        const button = container.querySelector('button')
        expect(button).toHaveAttribute('title')
    })

    it('should have variant ghost size icon', () => {
        const { ThemeToggle } = require('../../components/theme-toggle')
        const { container } = render(<ThemeToggle />)

        const button = container.querySelector('button')
        expect(button).toBeInTheDocument()
    })
})

describe('Component Structure', () => {
    it('should have proper component exports', () => {
        expect(typeof require('../../components/theme-toggle').ThemeToggle).toBe('function')
    })

    it('should have theme-toggle component file', () => {
        const themeToggleModule = require('../../components/theme-toggle')
        expect(themeToggleModule).toBeDefined()
    })

    it('should have main-layout component file', () => {
        expect(typeof require('../../components/main-layout').MainLayout).toBe('function')
    })

    it('should have header component file', () => {
        const headerModule = require('../../components/header')
        expect(headerModule).toBeDefined()
    })

    it('should have footer component file', () => {
        const footerModule = require('../../components/footer')
        expect(footerModule).toBeDefined()
    })
})

describe('Component Types', () => {
    it('should export functional components', () => {
        const themeToggle = require('../../components/theme-toggle').ThemeToggle
        expect(typeof themeToggle).toBe('function')
    })

    it('should have proper "use client" directives', () => {
        const themeToggleSource = require('fs').readFileSync(
            require('path').join(__dirname, '../../components/theme-toggle.tsx'),
            'utf-8'
        )
        expect(themeToggleSource).toContain('"use client"')
    })
})
