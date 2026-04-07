import { GPAClient } from '../../models/GPA_client'

describe('GPA_client Model', () => {
    describe('GPAClient Interface', () => {
        it('should create a valid individual client', () => {
            const client: GPAClient = {
                CLI_name: 'Juan',
                CLI_phone: '+506 2222-3333',
                CLI_civil_status: 'Single',
                CLI_identificationtype: 'national',
                CLI_identification: '123456789',
                CLI_isperson: true,
                CLI_projects_amount: 0,
            }
            expect(client).toBeDefined()
            expect(client.CLI_isperson).toBe(true)
            expect(client.CLI_name).toBe('Juan')
        })

        it('should create a valid entity client', () => {
            const client: GPAClient = {
                CLI_name: 'Empresa XYZ S.A.',
                CLI_phone: '+506 4444-5555',
                CLI_civil_status: 'Single',
                CLI_identificationtype: 'nite',
                CLI_identification: 'NITE-123456',
                CLI_isperson: false,
                CLI_projects_amount: 5,
            }
            expect(client.CLI_isperson).toBe(false)
            expect(client.CLI_projects_amount).toBe(5)
        })

        it('should validate all identification types', () => {
            const identificationTypes: Array<'national' | 'dimex' | 'passport' | 'nite' | 'entity'> = [
                'national',
                'dimex',
                'passport',
                'nite',
                'entity',
            ]

            identificationTypes.forEach((type) => {
                const client: GPAClient = {
                    CLI_name: 'Test Client',
                    CLI_phone: '+506 8888-9999',
                    CLI_civil_status: 'Married',
                    CLI_identificationtype: type,
                    CLI_identification: 'ID-12345',
                    CLI_isperson: true,
                    CLI_projects_amount: 0,
                }
                expect(client.CLI_identificationtype).toBe(type)
            })
        })

        it('should validate all civil status options', () => {
            const civilStatuses: Array<'Single' | 'Married' | 'Divorced' | 'Widowed'> = [
                'Single',
                'Married',
                'Divorced',
                'Widowed',
            ]

            civilStatuses.forEach((status) => {
                const client: GPAClient = {
                    CLI_name: 'Test Client',
                    CLI_phone: '+506 2222-3333',
                    CLI_civil_status: status,
                    CLI_identificationtype: 'national',
                    CLI_identification: '123456789',
                    CLI_isperson: true,
                    CLI_projects_amount: 0,
                }
                expect(client.CLI_civil_status).toBe(status)
            })
        })

        it('should include optional fields', () => {
            const client: GPAClient = {
                CLI_id: 1,
                CLI_name: 'María',
                CLI_email: 'maria@example.com',
                CLI_phone: '+506 2222-3333',
                CLI_additional_directions: 'Casa con portón azul',
                CLI_civil_status: 'Single',
                CLI_observations: 'Cliente VIP',
                CLI_f_lastname: 'García',
                CLI_s_lastname: 'López',
                CLI_identificationtype: 'national',
                CLI_identification: '123456789',
                CLI_isperson: true,
                CLI_province: 'San José',
                CLI_canton: 'San José',
                CLI_district: 'La Uruca',
                CLI_neighborhood: 'La Uruca',
                CLI_projects_amount: 3,
            }

            expect(client.CLI_email).toBe('maria@example.com')
            expect(client.CLI_f_lastname).toBe('García')
            expect(client.CLI_s_lastname).toBe('López')
            expect(client.CLI_province).toBe('San José')
            expect(client.CLI_projects_amount).toBe(3)
        })
    })

    describe('Client Contact Information', () => {
        it('should validate email format if provided', () => {
            const client: GPAClient = {
                CLI_name: 'Test',
                CLI_email: 'test@example.com',
                CLI_phone: '+506 2222-3333',
                CLI_civil_status: 'Single',
                CLI_identificationtype: 'national',
                CLI_identification: '12345',
                CLI_isperson: true,
                CLI_projects_amount: 0,
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            expect(emailRegex.test(client.CLI_email || '')).toBe(true)
        })

        it('should store phone numbers in various formats', () => {
            const phonesFormats = ['+506 2222-3333', '22223333', '+506-2222-3333', '506 2222 3333']

            phonesFormats.forEach((phone) => {
                const client: GPAClient = {
                    CLI_name: 'Test',
                    CLI_phone: phone,
                    CLI_civil_status: 'Single',
                    CLI_identificationtype: 'national',
                    CLI_identification: '12345',
                    CLI_isperson: true,
                    CLI_projects_amount: 0,
                }
                expect(client.CLI_phone).toBe(phone)
            })
        })
    })

    describe('Client Address Information', () => {
        it('should store complete address data', () => {
            const client: GPAClient = {
                CLI_name: 'Test',
                CLI_phone: '+506 2222-3333',
                CLI_civil_status: 'Single',
                CLI_identificationtype: 'national',
                CLI_identification: '12345',
                CLI_isperson: true,
                CLI_projects_amount: 0,
                CLI_province: 'Cartago',
                CLI_canton: 'Cartago',
                CLI_district: 'Oriental',
                CLI_neighborhood: 'Centro',
                CLI_additional_directions: 'Avenida Central, Edificio Rojo',
            }

            expect(client.CLI_province).toBe('Cartago')
            expect(client.CLI_canton).toBe('Cartago')
            expect(client.CLI_district).toBe('Oriental')
            expect(client.CLI_neighborhood).toBe('Centro')
            expect(client.CLI_additional_directions).toBeDefined()
        })
    })

    describe('Client Projects Tracking', () => {
        it('should track number of projects', () => {
            const client: GPAClient = {
                CLI_name: 'Test',
                CLI_phone: '+506 2222-3333',
                CLI_civil_status: 'Single',
                CLI_identificationtype: 'national',
                CLI_identification: '12345',
                CLI_isperson: true,
                CLI_projects_amount: 10,
            }

            expect(client.CLI_projects_amount).toBeGreaterThanOrEqual(0)
            expect(typeof client.CLI_projects_amount).toBe('number')
        })

        it('should handle new clients with zero projects', () => {
            const newClient: GPAClient = {
                CLI_name: 'New Client',
                CLI_phone: '+506 1111-2222',
                CLI_civil_status: 'Single',
                CLI_identificationtype: 'national',
                CLI_identification: '99999',
                CLI_isperson: true,
                CLI_projects_amount: 0,
            }

            expect(newClient.CLI_projects_amount).toBe(0)
        })
    })

    describe('Client Identification Validation', () => {
        it('should support different identification lengths by type', () => {
            const identifications = [
                { type: 'national' as const, id: '123456789' },
                { type: 'dimex' as const, id: '0123456789ABCDE' },
                { type: 'passport' as const, id: 'AB123456' },
                { type: 'nite' as const, id: 'NITE-123456' },
                { type: 'entity' as const, id: 'ENTITY-123' },
            ]

            identifications.forEach(({ type, id }) => {
                const client: GPAClient = {
                    CLI_name: 'Test',
                    CLI_phone: '+506 2222-3333',
                    CLI_civil_status: 'Single',
                    CLI_identificationtype: type,
                    CLI_identification: id,
                    CLI_isperson: type !== 'entity' && type !== 'nite',
                    CLI_projects_amount: 0,
                }
                expect(client.CLI_identification).toBe(id)
                expect(client.CLI_identificationtype).toBe(type)
            })
        })
    })
})
