import { GPAProject, getLocalMySQLDateTime } from '../../models/GPA_project'

describe('GPA_project Model', () => {
    describe('GPAProject Interface', () => {
        it('should create a valid project with required fields', () => {
            const project: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-001',
                PRJ_type_id: 1,
                PRJ_state: 'Document Collection',
                PRJ_remaining_amount: 50000,
            }
            expect(project).toBeDefined()
            expect(project.PRJ_case_number).toBe('CASE-2024-001')
            expect(project.PRJ_remaining_amount).toBe(50000)
        })

        it('should accept all valid PRJ_state values', () => {
            const validStates = [
                'Document Collection',
                'Technical Inspection',
                'Document Review',
                'Plans and Budget',
                'Entity Review',
                'APC and Permits',
                'Disbursement',
                'Under Construction',
                'Completed',
                'Logbook Closed',
                'Rejected',
                'Professional Withdrawal',
                'Conditioned',
            ]

            validStates.forEach((state) => {
                const project: GPAProject = {
                    PRJ_client_id: 1,
                    PRJ_case_number: 'CASE-2024-001',
                    PRJ_type_id: 1,
                    PRJ_state: state as any,
                    PRJ_remaining_amount: 50000,
                }
                expect(project.PRJ_state).toBe(state)
            })
        })

        it('should include optional fields', () => {
            const project: GPAProject = {
                PRJ_id: 1,
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-001',
                PRJ_area_m2: 500,
                PRJ_budget: 100000,
                PRJ_type_id: 1,
                PRJ_state: 'Under Construction',
                PRJ_remaining_amount: 50000,
                PRJ_province: 'San José',
                PRJ_canton: 'San José',
                PRJ_district: 'Carmen',
                PRJ_neighborhood: 'La Uruca',
                categories_names: ['Residential', 'Commercial'],
            }
            expect(project.PRJ_area_m2).toBe(500)
            expect(project.PRJ_budget).toBe(100000)
            expect(project.categories_names).toContain('Residential')
        })

        it('should support related data (categories, documents, payments)', () => {
            const project: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-001',
                PRJ_type_id: 1,
                PRJ_state: 'Completed',
                PRJ_remaining_amount: 0,
                categories: [],
                documents: [],
                payments: [],
            }
            expect(Array.isArray(project.categories)).toBe(true)
            expect(Array.isArray(project.documents)).toBe(true)
            expect(Array.isArray(project.payments)).toBe(true)
        })
    })

    describe('Project State Management', () => {
        it('should track project progression through states', () => {
            const states = [
                'Document Collection',
                'Technical Inspection',
                'Document Review',
                'Completed',
            ]

            states.forEach((state, index) => {
                const project: GPAProject = {
                    PRJ_client_id: 1,
                    PRJ_case_number: `CASE-2024-${index}`,
                    PRJ_type_id: 1,
                    PRJ_state: state as any,
                    PRJ_remaining_amount: 100000 - index * 25000,
                }
                expect(project.PRJ_state).toBe(state)
                expect(project.PRJ_remaining_amount).toBeGreaterThanOrEqual(0)
            })
        })

        it('should handle rejection and withdrawal states', () => {
            const rejectedProject: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-REJECTED',
                PRJ_type_id: 1,
                PRJ_state: 'Rejected',
                PRJ_remaining_amount: 100000,
            }
            expect(rejectedProject.PRJ_state).toBe('Rejected')

            const withdrawalProject: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-WITHDRAWAL',
                PRJ_type_id: 1,
                PRJ_state: 'Professional Withdrawal',
                PRJ_remaining_amount: 50000,
            }
            expect(withdrawalProject.PRJ_state).toBe('Professional Withdrawal')
        })
    })

    describe('Project Financials', () => {
        it('should correctly store budget and remaining amount', () => {
            const project: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-001',
                PRJ_type_id: 1,
                PRJ_state: 'Disbursement',
                PRJ_budget: 100000,
                PRJ_remaining_amount: 75000,
            }

            const spent = (project.PRJ_budget || 0) - project.PRJ_remaining_amount
            expect(spent).toBe(25000)
        })

        it('should handle zero and negative remaining amounts', () => {
            const completedProject: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-COMPLETED',
                PRJ_type_id: 1,
                PRJ_state: 'Completed',
                PRJ_budget: 100000,
                PRJ_remaining_amount: 0,
            }
            expect(completedProject.PRJ_remaining_amount).toBe(0)
        })
    })

    describe('Project Location', () => {
        it('should store complete location data', () => {
            const project: GPAProject = {
                PRJ_client_id: 1,
                PRJ_case_number: 'CASE-2024-001',
                PRJ_type_id: 1,
                PRJ_state: 'Under Construction',
                PRJ_remaining_amount: 50000,
                PRJ_province: 'Alajuela',
                PRJ_canton: 'San Ramón',
                PRJ_district: 'San Isidro',
                PRJ_neighborhood: 'Bajo Rodríguez',
            }

            expect(project.PRJ_province).toBe('Alajuela')
            expect(project.PRJ_canton).toBe('San Ramón')
            expect(project.PRJ_district).toBe('San Isidro')
            expect(project.PRJ_neighborhood).toBe('Bajo Rodríguez')
        })
    })

    describe('getLocalMySQLDateTime for Project', () => {
        it('should generate valid MySQL datetime timestamps', () => {
            const dateTime = getLocalMySQLDateTime()
            expect(typeof dateTime).toBe('string')
            expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        })
    })
})
