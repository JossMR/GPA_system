const mockConnection = {
    threadId: 123,
    query: jest.fn(),
    execute: jest.fn(),
    release: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
}

const mockPool = {
    getConnection: jest.fn(),
    execute: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
}

jest.mock('mysql2/promise', () => ({
    createPool: jest.fn(() => mockPool),
}))

const database = require('../../lib/database')

describe('Database - lib/database', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPool.getConnection.mockResolvedValue(mockConnection)
        mockPool.execute.mockResolvedValue([[{ id: 1 }], []])
        mockPool.query.mockResolvedValue([[{ id: 1 }], []])
        mockConnection.query.mockResolvedValue([[{ health: 1 }], []])
        mockConnection.execute.mockResolvedValue([[{ ok: true }], []])
        mockConnection.beginTransaction.mockResolvedValue(undefined)
        mockConnection.commit.mockResolvedValue(undefined)
        mockConnection.rollback.mockResolvedValue(undefined)
        mockConnection.release.mockImplementation(() => undefined)
    })

    describe('Environment and setup', () => {
        it('should load with default database settings', () => {
            expect(process.env.DB_HOST).toBeDefined()
            expect(process.env.DB_USER).toBeDefined()
            expect(process.env.DB_NAME).toBeDefined()
            expect(database.default).toBeDefined()
        })

        it('should expose the pool instance as default export', () => {
            expect(database.default).toBe(mockPool)
        })
    })

    describe('getConnection', () => {
        it('should return a connection from the pool', async () => {
            const connection = await database.getConnection()

            expect(mockPool.getConnection).toHaveBeenCalledTimes(1)
            expect(connection).toBe(mockConnection)
        })

        it('should throw a generic error when the pool connection fails', async () => {
            mockPool.getConnection.mockRejectedValueOnce(new Error('connection failed'))

            await expect(database.getConnection()).rejects.toThrow('No se pudo conectar a la base de datos')
        })
    })

    describe('getPoolStatus', () => {
        it('should query pool status and release the connection', async () => {
            const rows = [{ Variable_name: 'Threads_connected', Value: '1' }]
            mockPool.getConnection.mockResolvedValueOnce({
                ...mockConnection,
                query: jest.fn().mockResolvedValueOnce([rows]),
                release: jest.fn(),
            })

            const result = await database.getPoolStatus()

            expect(result).toEqual(rows)
            expect(mockPool.getConnection).toHaveBeenCalledTimes(1)
        })
    })

    describe('executeQuery', () => {
        it('should execute a query through the pool', async () => {
            const rows = [{ id: 1 }]
            mockPool.execute.mockResolvedValueOnce([rows])

            const result = await database.executeQuery('SELECT * FROM users WHERE id = ?', [1])

            expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1])
            expect(result).toEqual(rows)
        })

        it('should fall back to pool.query when execute fails with ER_WRONG_ARGUMENTS', async () => {
            const rows = [{ fallback: true }]
            mockPool.execute.mockRejectedValueOnce({ code: 'ER_WRONG_ARGUMENTS' })
            mockPool.query.mockResolvedValueOnce([rows])

            const result = await database.executeQuery('SELECT NOW()', [])

            expect(mockPool.query).toHaveBeenCalledWith('SELECT NOW()', [])
            expect(result).toEqual(rows)
        })

        it('should retry and eventually fail for unexpected errors', async () => {
            jest.useFakeTimers()
            mockPool.execute.mockRejectedValue(new Error('boom'))

            const promise = database.executeQuery('SELECT 1', [], 1)
            await expect(promise).rejects.toThrow('boom')

            jest.useRealTimers()
        })
    })

    describe('executeQueryWithConnection', () => {
        it('should use a dedicated connection and release it at the end', async () => {
            const result = await database.executeQueryWithConnection('SELECT * FROM projects WHERE PRJ_id = ?', [5])

            expect(mockPool.getConnection).toHaveBeenCalledTimes(1)
            expect(mockConnection.query).toHaveBeenCalledWith('SET SESSION max_execution_time = 30000')
            expect(mockConnection.execute).toHaveBeenCalledWith('SELECT * FROM projects WHERE PRJ_id = ?', [5])
            expect(mockConnection.release).toHaveBeenCalledTimes(1)
            expect(result).toEqual([{ ok: true }])
        })

        it('should release the connection even if the query fails', async () => {
            mockConnection.execute.mockRejectedValueOnce(new Error('query failed'))

            await expect(database.executeQueryWithConnection('SELECT 1')).rejects.toThrow('query failed')
            expect(mockConnection.release).toHaveBeenCalledTimes(1)
        })
    })

    describe('executeTransaction', () => {
        it('should run all queries inside a transaction and commit', async () => {
            mockConnection.execute
                .mockResolvedValueOnce([[{ inserted: 1 }]])
                .mockResolvedValueOnce([[{ inserted: 2 }]])

            const result = await database.executeTransaction([
                { query: 'INSERT INTO users (name) VALUES (?)', params: ['John'] },
                { query: 'INSERT INTO users (name) VALUES (?)', params: ['Mary'] },
            ])

            expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1)
            expect(mockConnection.commit).toHaveBeenCalledTimes(1)
            expect(mockConnection.rollback).not.toHaveBeenCalled()
            expect(mockConnection.release).toHaveBeenCalledTimes(1)
            expect(result).toHaveLength(2)
        })

        it('should rollback when a transaction step fails', async () => {
            mockConnection.execute
                .mockResolvedValueOnce([[{ inserted: 1 }]])
                .mockRejectedValueOnce(new Error('transaction failed'))

            await expect(
                database.executeTransaction([
                    { query: 'INSERT INTO users (name) VALUES (?)', params: ['John'] },
                    { query: 'INSERT INTO users (name) VALUES (?)', params: ['Mary'] },
                ])
            ).rejects.toThrow('transaction failed')

            expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1)
            expect(mockConnection.rollback).toHaveBeenCalledTimes(1)
            expect(mockConnection.release).toHaveBeenCalledTimes(1)
        })
    })

    describe('cleanupPool and closePool', () => {
        it('should clean up the pool with a simple query', async () => {
            await database.cleanupPool()

            expect(mockPool.query).toHaveBeenCalledWith('SELECT 1')
        })

        it('should close the pool', async () => {
            await database.closePool()

            expect(mockPool.end).toHaveBeenCalledTimes(1)
        })
    })

    describe('checkPoolHealth', () => {
        it('should report the pool as healthy when query returns 1', async () => {
            mockPool.getConnection.mockResolvedValueOnce({
                ...mockConnection,
                query: jest.fn().mockResolvedValueOnce([[{ health: 1 }]]),
                release: jest.fn(),
            })

            const result = await database.checkPoolHealth()

            expect(result.healthy).toBe(true)
            expect(result.timestamp).toBeDefined()
        })

        it('should report the pool as unhealthy when it cannot connect', async () => {
            mockPool.getConnection.mockRejectedValueOnce(new Error('down'))

            const result = await database.checkPoolHealth()

            expect(result.healthy).toBe(false)
            expect(result.error).toBe('down')
            expect(result.timestamp).toBeDefined()
        })
    })

    describe('API surface', () => {
        it('should expose the expected helpers', () => {
            expect(typeof database.getPoolStatus).toBe('function')
            expect(typeof database.getConnection).toBe('function')
            expect(typeof database.executeQuery).toBe('function')
            expect(typeof database.executeQueryWithConnection).toBe('function')
            expect(typeof database.executeTransaction).toBe('function')
            expect(typeof database.cleanupPool).toBe('function')
            expect(typeof database.closePool).toBe('function')
            expect(typeof database.checkPoolHealth).toBe('function')
            expect(typeof database.logPoolStats).toBe('function')
        })
    })
})
