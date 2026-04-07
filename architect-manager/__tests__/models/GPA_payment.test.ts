import { GPAPayment } from '../../models/GPA_payment'

describe('GPA_payment Model', () => {
    describe('GPAPayment Interface', () => {
        it('should create a valid payment with required fields', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 10000,
                PAY_payment_date: '2024-01-15',
                PAY_project_id: 1,
            }
            expect(payment).toBeDefined()
            expect(payment.PAY_amount_paid).toBe(10000)
            expect(payment.PAY_project_id).toBe(1)
        })

        it('should accept payment date as string or Date', () => {
            const paymentWithString: GPAPayment = {
                PAY_amount_paid: 10000,
                PAY_payment_date: '2024-01-15 10:30:00',
                PAY_project_id: 1,
            }
            expect(typeof paymentWithString.PAY_payment_date).toBe('string')

            const paymentWithDate: GPAPayment = {
                PAY_amount_paid: 10000,
                PAY_payment_date: new Date('2024-01-15'),
                PAY_project_id: 1,
            }
            expect(paymentWithDate.PAY_payment_date).toBeInstanceOf(Date)
        })

        it('should validate all payment methods', () => {
            const paymentMethods: Array<'Cash' | 'Card' | 'SINPE' | 'Credit' | 'Debit' | 'Transfer' | 'Deposit' | 'Check'> = [
                'Cash',
                'Card',
                'SINPE',
                'Credit',
                'Debit',
                'Transfer',
                'Deposit',
                'Check',
            ]

            paymentMethods.forEach((method) => {
                const payment: GPAPayment = {
                    PAY_amount_paid: 10000,
                    PAY_payment_date: '2024-01-15',
                    PAY_project_id: 1,
                    PAY_method: method,
                }
                expect(payment.PAY_method).toBe(method)
            })
        })

        it('should include optional fields', () => {
            const payment: GPAPayment = {
                PAY_id: 1,
                PAY_amount_paid: 25000,
                PAY_payment_date: '2024-01-20',
                PAY_description: 'Pago anticipado - Primera fase',
                PAY_project_id: 1,
                PAY_method: 'Transfer',
                PAY_bill_number: 'BILL-001-2024',
                projectState: 'Under Construction',
                projectCaseNumber: 'CASE-2024-001',
                projectClientName: 'Juan García',
            }

            expect(payment.PAY_id).toBe(1)
            expect(payment.PAY_description).toBe('Pago anticipado - Primera fase')
            expect(payment.PAY_bill_number).toBe('BILL-001-2024')
            expect(payment.projectClientName).toBe('Juan García')
        })
    })

    describe('Payment Amounts', () => {
        it('should handle various payment amounts', () => {
            const amounts = [100, 1000, 50000, 250000.75, 0]
            amounts.forEach((amount) => {
                const payment: GPAPayment = {
                    PAY_amount_paid: amount,
                    PAY_payment_date: '2024-01-15',
                    PAY_project_id: 1,
                }
                expect(payment.PAY_amount_paid).toBe(amount)
                expect(typeof payment.PAY_amount_paid).toBe('number')
            })
        })

        it('should handle negative amounts (refunds)', () => {
            const refund: GPAPayment = {
                PAY_amount_paid: -5000,
                PAY_payment_date: '2024-01-20',
                PAY_project_id: 1,
                PAY_description: 'Reembolso por cancelación',
            }
            expect(refund.PAY_amount_paid).toBeLessThan(0)
        })
    })

    describe('Payment Methods', () => {
        it('should correctly assign payment method SINPE', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 15000,
                PAY_payment_date: '2024-01-15',
                PAY_project_id: 1,
                PAY_method: 'SINPE',
            }
            expect(payment.PAY_method).toBe('SINPE')
        })

        it('should correctly assign payment method Card', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 20000,
                PAY_payment_date: '2024-01-15',
                PAY_project_id: 1,
                PAY_method: 'Card',
            }
            expect(payment.PAY_method).toBe('Card')
        })

        it('should handle payments without specified method', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 10000,
                PAY_payment_date: '2024-01-15',
                PAY_project_id: 1,
            }
            expect(payment.PAY_method).toBeUndefined()
        })
    })

    describe('Payment Tracking', () => {
        it('should track payment to project relationship', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 50000,
                PAY_payment_date: '2024-01-15',
                PAY_project_id: 5,
                projectCaseNumber: 'CASE-2024-005',
                projectState: 'Disbursement',
            }

            expect(payment.PAY_project_id).toBe(5)
            expect(payment.projectCaseNumber).toBe('CASE-2024-005')
            expect(payment.projectState).toBe('Disbursement')
        })

        it('should store bill information', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 15000,
                PAY_payment_date: '2024-01-20',
                PAY_project_id: 1,
                PAY_bill_number: 'INV-2024-001',
            }
            expect(payment.PAY_bill_number).toBe('INV-2024-001')
        })

        it('should handle null bill number', () => {
            const payment: GPAPayment = {
                PAY_amount_paid: 10000,
                PAY_payment_date: '2024-01-15',
                PAY_project_id: 1,
                PAY_bill_number: null,
            }
            expect(payment.PAY_bill_number).toBeNull()
        })
    })

    describe('Payment Description', () => {
        it('should store detailed payment descriptions', () => {
            const descriptions = [
                'Pago inicial 50%',
                'Segunda cuota con retención',
                'Última cuota - Proyecto finalizado',
                'Reembolso de depósito de garantía',
            ]

            descriptions.forEach((desc) => {
                const payment: GPAPayment = {
                    PAY_amount_paid: 10000,
                    PAY_payment_date: '2024-01-15',
                    PAY_project_id: 1,
                    PAY_description: desc,
                }
                expect(payment.PAY_description).toBe(desc)
            })
        })
    })
})
