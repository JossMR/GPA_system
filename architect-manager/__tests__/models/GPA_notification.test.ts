import { GPANotification, getLocalMySQLDateTime } from '../../models/GPA_notification'

describe('GPA_notification Model', () => {
    describe('GPANotification Interface', () => {
        it('should create a valid notification with required fields', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 1,
                NOT_name: 'Nuevo proyecto asignado',
                NOT_description: 'Se ha asignado un nuevo proyecto al sistema',
                NTP_id: 2,
            }

            expect(notification).toBeDefined()
            expect(notification.NOT_creator_user_id).toBe(1)
            expect(notification.NOT_name).toBe('Nuevo proyecto asignado')
            expect(notification.NOT_description).toContain('asignado')
        })

        it('should allow optional fields', () => {
            const notification: GPANotification = {
                NOT_id: 10,
                NOT_creator_user_id: 5,
                NOT_name: 'Pago recibido',
                NOT_created_at: '2024-01-15 10:00:00',
                NOT_date: '2024-01-15 10:05:00',
                PRJ_id: 25,
                NOT_description: 'Se registró un pago en el proyecto',
                NTP_id: 3,
                notification_type_name: 'Pago',
                creator_name: 'Administrador',
                destination_users_ids: [[1, true], [2, false]],
            }

            expect(notification.NOT_id).toBe(10)
            expect(notification.PRJ_id).toBe(25)
            expect(notification.notification_type_name).toBe('Pago')
            expect(notification.destination_users_ids).toHaveLength(2)
        })
    })

    describe('Notification content and relations', () => {
        it('should store project-related notifications', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 1,
                NOT_name: 'Proyecto actualizado',
                PRJ_id: 100,
                NOT_description: 'El estado del proyecto cambió a revisión',
                NTP_id: 4,
            }

            expect(notification.PRJ_id).toBe(100)
            expect(notification.NOT_description).toContain('revisión')
        })

        it('should store notifications without project association', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 1,
                NOT_name: 'Aviso general',
                NOT_description: 'Recordatorio general para el equipo',
                NTP_id: 1,
            }

            expect(notification.PRJ_id).toBeUndefined()
            expect(notification.NOT_name).toBe('Aviso general')
        })

        it('should store creator information when available', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 9,
                NOT_name: 'Nuevo comentario',
                NOT_description: 'Se agregó una observación al proyecto',
                NTP_id: 5,
                creator_name: 'Laura Gómez',
            }

            expect(notification.creator_name).toBe('Laura Gómez')
            expect(notification.NOT_creator_user_id).toBe(9)
        })
    })

    describe('Notification types', () => {
        it('should allow different notification type ids', () => {
            const typeIds = [1, 2, 3, 4, 5, 99]

            typeIds.forEach((typeId) => {
                const notification: GPANotification = {
                    NOT_creator_user_id: 1,
                    NOT_name: `Tipo ${typeId}`,
                    NOT_description: 'Prueba de tipo de notificación',
                    NTP_id: typeId,
                }

                expect(notification.NTP_id).toBe(typeId)
            })
        })

        it('should support notification type name mapping', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 2,
                NOT_name: 'Pago aprobado',
                NOT_description: 'Pago registrado y aprobado',
                NTP_id: 3,
                notification_type_name: 'Pago',
            }

            expect(notification.notification_type_name).toBe('Pago')
        })
    })

    describe('Recipients tracking', () => {
        it('should store destination users ids with read status', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 1,
                NOT_name: 'Asignación de proyecto',
                NOT_description: 'Se asignó un proyecto nuevo',
                NTP_id: 2,
                destination_users_ids: [[1, true], [2, false], [3, false]],
            }

            expect(notification.destination_users_ids).toHaveLength(3)
            expect(notification.destination_users_ids?.[0]).toEqual([1, true])
            expect(notification.destination_users_ids?.[2]).toEqual([3, false])
        })

        it('should support multiple recipients for the same notification', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 4,
                NOT_name: 'Recordatorio de revisión',
                NOT_description: 'Revise los documentos pendientes',
                NTP_id: 1,
                destination_users_ids: [[10, false], [11, false], [12, true]],
            }

            const unreadRecipients = notification.destination_users_ids?.filter(([, read]) => !read) ?? []
            expect(unreadRecipients).toHaveLength(2)
        })
    })

    describe('Date handling', () => {
        it('should accept created and date fields as string or Date', () => {
            const notificationWithDate: GPANotification = {
                NOT_creator_user_id: 1,
                NOT_name: 'Fecha como Date',
                NOT_created_at: new Date('2024-01-15T10:00:00Z'),
                NOT_date: new Date('2024-01-15T10:05:00Z'),
                NOT_description: 'Prueba de fechas',
                NTP_id: 1,
            }

            expect(notificationWithDate.NOT_created_at).toBeInstanceOf(Date)
            expect(notificationWithDate.NOT_date).toBeInstanceOf(Date)
        })

        it('should accept date strings in MySQL format', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 1,
                NOT_name: 'Fecha MySQL',
                NOT_created_at: '2024-01-15 10:00:00',
                NOT_date: '2024-01-15 10:05:00',
                NOT_description: 'Formato compatible con MySQL',
                NTP_id: 1,
            }

            expect(notification.NOT_created_at).toBe('2024-01-15 10:00:00')
            expect(notification.NOT_date).toBe('2024-01-15 10:05:00')
        })
    })

    describe('getLocalMySQLDateTime', () => {
        it('should return a valid MySQL datetime string', () => {
            const dateTime = getLocalMySQLDateTime()

            expect(typeof dateTime).toBe('string')
            expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        })

        it('should include padded components', () => {
            const dateTime = getLocalMySQLDateTime()
            const [datePart, timePart] = dateTime.split(' ')
            const [year, month, day] = datePart.split('-')
            const [hours, minutes, seconds] = timePart.split(':')

            expect(year).toHaveLength(4)
            expect(month).toHaveLength(2)
            expect(day).toHaveLength(2)
            expect(hours).toHaveLength(2)
            expect(minutes).toHaveLength(2)
            expect(seconds).toHaveLength(2)
        })
    })

    describe('Real world scenarios', () => {
        it('should represent a user alert correctly', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 3,
                NOT_name: 'Alerta de sistema',
                NOT_description: 'Se detectó una actualización importante',
                NTP_id: 1,
                creator_name: 'Sistema',
                destination_users_ids: [[7, false]],
            }

            expect(notification.creator_name).toBe('Sistema')
            expect(notification.destination_users_ids).toHaveLength(1)
        })

        it('should represent a project status notification correctly', () => {
            const notification: GPANotification = {
                NOT_creator_user_id: 4,
                NOT_name: 'Cambio de estado',
                PRJ_id: 55,
                NOT_description: 'El proyecto pasó a fase de inspección',
                NTP_id: 2,
                notification_type_name: 'Proyecto',
            }

            expect(notification.PRJ_id).toBe(55)
            expect(notification.notification_type_name).toBe('Proyecto')
        })
    })
})
