import { GPAUser, validateRequiredFields, getLocalMySQLDateTime } from '../../models/GPA_user'

describe('GPA_user Model', () => {
    describe('GPAUser Interface', () => {
        it('should create a valid user with all required fields', () => {
            const user: GPAUser = {
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
            }
            expect(user).toBeDefined()
            expect(user.USR_email).toBe('test@example.com')
            expect(user.USR_active).toBe(1)
        })

        it('should allow optional fields', () => {
            const user: GPAUser = {
                USR_id: 1,
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
                ROL_name: 'Admin',
                USR_creation_date: '2024-01-01 10:00:00',
                USR_last_access_date: '2024-01-02 10:00:00',
            }
            expect(user.USR_id).toBe(1)
            expect(user.ROL_name).toBe('Admin')
            expect(user.USR_creation_date).toBeDefined()
        })
    })

    describe('validateRequiredFields', () => {
        it('should return true for valid user with all required fields', () => {
            const validUser: GPAUser = {
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
            }
            expect(validateRequiredFields(validUser)).toBe(true)
        })

        it('should return false if USR_role_id is missing', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 0,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })

        it('should return false if USR_email is missing', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 1,
                USR_email: '',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })

        it('should return false if USR_name is missing', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: '',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })

        it('should return false if USR_active is null', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: null,
                USR_f_lastname: 'Doe',
                USR_s_lastname: 'Smith',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })

        it('should return false if USR_f_lastname is missing', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: '',
                USR_s_lastname: 'Smith',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })

        it('should return false if USR_s_lastname is missing', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 1,
                USR_email: 'test@example.com',
                USR_name: 'John',
                USR_active: 1,
                USR_f_lastname: 'Doe',
                USR_s_lastname: '',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })

        it('should return false if multiple required fields are missing', () => {
            const invalidUser: Partial<GPAUser> = {
                USR_role_id: 0,
                USR_email: '',
                USR_name: '',
                USR_active: 1,
                USR_f_lastname: '',
                USR_s_lastname: '',
            }
            expect(validateRequiredFields(invalidUser as GPAUser)).toBe(false)
        })
    })

    describe('getLocalMySQLDateTime', () => {
        it('should return a string in MySQL datetime format', () => {
            const dateTime = getLocalMySQLDateTime()
            expect(typeof dateTime).toBe('string')
            expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        })

        it('should contain valid date components', () => {
            const dateTime = getLocalMySQLDateTime()
            const [datePart, timePart] = dateTime.split(' ')
            const [year, month, day] = datePart.split('-')
            const [hours, minutes, seconds] = timePart.split(':')

            expect(parseInt(year)).toBeGreaterThanOrEqual(2000)
            expect(parseInt(month)).toBeGreaterThanOrEqual(1)
            expect(parseInt(month)).toBeLessThanOrEqual(12)
            expect(parseInt(day)).toBeGreaterThanOrEqual(1)
            expect(parseInt(day)).toBeLessThanOrEqual(31)
            expect(parseInt(hours)).toBeGreaterThanOrEqual(0)
            expect(parseInt(hours)).toBeLessThanOrEqual(23)
            expect(parseInt(minutes)).toBeGreaterThanOrEqual(0)
            expect(parseInt(minutes)).toBeLessThanOrEqual(59)
            expect(parseInt(seconds)).toBeGreaterThanOrEqual(0)
            expect(parseInt(seconds)).toBeLessThanOrEqual(59)
        })

        it('should have leading zeros for single digit values', () => {
            const dateTime = getLocalMySQLDateTime()
            expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        })
    })
})
