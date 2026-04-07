// jest.setup.js
import '@testing-library/jest-dom'

// Mock de variables de entorno
process.env.DB_HOST = 'localhost'
process.env.DB_USER = 'root'
process.env.DB_PASSWORD = ''
process.env.DB_NAME = 'GPA'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Suprime logs durante tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
