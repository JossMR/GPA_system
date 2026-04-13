import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAAddition } from '@/models/GPA_addition'

async function recalculateProjectRemainingAmount(projectId: number) {
  const projectResult = await executeQuery(
    'SELECT PRJ_budget FROM GPA_Projects WHERE PRJ_id = ?',
    [projectId]
  ) as Array<{ PRJ_budget: number | null }>

  if (projectResult.length === 0) {
    return
  }

  const additionsResult = await executeQuery(
    'SELECT COALESCE(SUM(ATN_cost), 0) AS totalAdditions FROM GPA_Additions WHERE ATN_project_id = ?',
    [projectId]
  ) as Array<{ totalAdditions: number | null }>

  const paymentsResult = await executeQuery(
    'SELECT COALESCE(SUM(PAY_amount_paid), 0) AS totalPaid FROM GPA_Payments WHERE PAY_project_id = ?',
    [projectId]
  ) as Array<{ totalPaid: number | null }>

  const budget = Number(projectResult[0]?.PRJ_budget || 0)
  const totalAdditions = Number(additionsResult[0]?.totalAdditions || 0)
  const totalPaid = Number(paymentsResult[0]?.totalPaid || 0)
  const remainingAmount = budget + totalAdditions - totalPaid

  await executeQuery(
    'UPDATE GPA_Projects SET PRJ_remaining_amount = ? WHERE PRJ_id = ?',
    [remainingAmount, projectId]
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    let query = 'SELECT * FROM GPA_Additions'
    const params: any[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        query += ' WHERE ATN_project_id = ?'
        params.push(projectIdNum)
      }
    }
    
    query += ' ORDER BY ATN_date DESC'
    
    const additions = await executeQuery(query, params) as GPAAddition[]
    
    return NextResponse.json(additions, { status: 200 })

  } catch (error) {
    console.error('Error de servidor:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al obtener las adiciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<GPAAddition>
    
    // Validate required fields according to GPAAddition interface
    if (!body.ATN_name || body.ATN_name.trim() === '') {
      return NextResponse.json({ error: 'Nombre del extra requerido' }, { status: 400 })
    }
    
    if (!body.ATN_project_id) {
      return NextResponse.json({ error: 'ID del proyecto es requerido' }, { status: 400 })
    }
    
    if (!body.ATN_cost || body.ATN_cost <= 0) {
      return NextResponse.json({ error: 'El costo es requerido y debe ser positivo' }, { status: 400 })
    }
    
    if (!body.ATN_date) {
      return NextResponse.json({ error: 'La fecha es requerida' }, { status: 400 })
    }
    
    // Create addition object following GPAAddition interface
    const additionData: Omit<GPAAddition, 'ATN_id'> = {
      ATN_name: body.ATN_name.trim(),
      ATN_description: body.ATN_description?.trim() || undefined,
      ATN_project_id: body.ATN_project_id,
      ATN_cost: body.ATN_cost,
      ATN_date: body.ATN_date
    }
    
    const insertQuery = `
      INSERT INTO GPA_Additions (
        ATN_name, 
        ATN_description, 
        ATN_project_id, 
        ATN_cost, 
        ATN_date
      ) VALUES (?, ?, ?, ?, ?)
    `
    const result = await executeQuery(insertQuery, [
      additionData.ATN_name,
      additionData.ATN_description || null,
      additionData.ATN_project_id,
      additionData.ATN_cost,
      additionData.ATN_date
    ]) as any

    await recalculateProjectRemainingAmount(additionData.ATN_project_id)

    return NextResponse.json({ 
      message: 'Adición creada exitosamente',
      additionId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
