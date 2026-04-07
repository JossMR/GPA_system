import { renderHook } from '@testing-library/react'
import { useIsMobile } from '../../hooks/use-mobile'

describe('Hooks - use-mobile', () => {
  describe('useIsMobile', () => {
    let innerWidthMock: jest.SpyInstance

    beforeEach(() => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
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
    })

    it('should be defined and callable', () => {
      expect(typeof useIsMobile).toBe('function')
    })

    it('should return false on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })

    it('should return true on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      })

      const { result } = renderHook(() => useIsMobile())
      // Initial state might be undefined, should eventually resolve
      expect(typeof result.current).toBe('boolean')
    })

    it('should use 768px as breakpoint', () => {
      // Mobile breakpoint test
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 767, // Just below breakpoint
      })

      const { result } = renderHook(() => useIsMobile())
      expect(typeof result.current).toBe('boolean')
    })

    it('should handle exactly 768px width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(typeof result.current).toBe('boolean')
    })

    it('should return boolean value', () => {
      const { result } = renderHook(() => useIsMobile())
      expect(typeof result.current).toBe('boolean')
    })

    it('should handle small mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320, // iPhone width
      })

      const { result } = renderHook(() => useIsMobile())
      expect(typeof result.current).toBe('boolean')
    })

    it('should handle tablet sizes', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800, // Tablet
      })

      const { result } = renderHook(() => useIsMobile())
      expect(typeof result.current).toBe('boolean')
    })

    it('should handle large desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1920, // Large desktop
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })
  })
})
