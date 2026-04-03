import { executeQuery } from '@/lib/database'
import { NextResponse } from 'next/server'

const projectStates = [
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
  'Conditioned'
]

export async function GET() {
  try {
    const stateCountExpressions = projectStates
      .map((state) => {
        const alias = state.replace(/[^a-zA-Z0-9]/g, '_')
        return `SUM(CASE WHEN PRJ_state = '${state}' THEN 1 ELSE 0 END) as ${alias}`
      })
      .join(',\n')

    const totals = await executeQuery(
      `SELECT
        COUNT(PRJ_id) as totalProjects,
        ${stateCountExpressions}
      FROM gpa_projects`
    ) as any[]

    const row = totals[0] || {}
    const stateCounts = projectStates.reduce<Record<string, number>>((accumulator, state) => {
      const key = state.replace(/[^a-zA-Z0-9]/g, '_')
      accumulator[state] = Number(row[key] || 0)
      return accumulator
    }, {})

    return NextResponse.json({
      message: 'Totales globales de proyectos obtenidos exitosamente',
      totalProjects: Number(row.totalProjects || 0),
      stateCounts
    }, { status: 200 })
  } catch (error) {
    console.error('Error al consultar conteo global de proyectos:', error)
    return NextResponse.json(
      { error: 'Error de servidor: no se pudieron consultar los totales globales de proyectos' },
      { status: 500 }
    )
  }
}
