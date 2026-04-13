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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const additionId = parseInt(resolvedParams.id)
    
    if (isNaN(additionId)) {
      return NextResponse.json({ error: 'ID de adición inválido' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_Additions WHERE ATN_id = ?'
    const additions = await executeQuery(query, [additionId]) as GPAAddition[]
    
    if (additions.length === 0) {
      return NextResponse.json({ error: 'Adición no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(additions[0], { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al obtener la adición' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const additionId = parseInt(resolvedParams.id)
    
    if (isNaN(additionId)) {
      return NextResponse.json({ error: 'ID de adición inválido' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPAAddition>
    
    // Validate required fields
    if (body.ATN_name !== undefined && (!body.ATN_name || body.ATN_name.trim() === '')) {
      return NextResponse.json({ error: 'Nombre de la adición no puede estar vacío' }, { status: 400 })
    }
    
    if (body.ATN_cost !== undefined && body.ATN_cost <= 0) {
      return NextResponse.json({ error: 'El costo debe ser positivo' }, { status: 400 })
    }
    
    // Check if addition exists
    const checkQuery = 'SELECT ATN_id, ATN_project_id FROM GPA_Additions WHERE ATN_id = ?'
    const existing = await executeQuery(checkQuery, [additionId]) as Array<{ ATN_id: number; ATN_project_id: number }>
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Adición no encontrada' }, { status: 404 })
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.ATN_name !== undefined) {
      updateFields.push('ATN_name = ?')
      updateValues.push(body.ATN_name.trim())
    }
    
    if (body.ATN_description !== undefined) {
      updateFields.push('ATN_description = ?')
      updateValues.push(body.ATN_description?.trim() || null)
    }
    
    if (body.ATN_project_id !== undefined) {
      updateFields.push('ATN_project_id = ?')
      updateValues.push(body.ATN_project_id)
    }
    
    if (body.ATN_cost !== undefined) {
      updateFields.push('ATN_cost = ?')
      updateValues.push(body.ATN_cost)
    }
    
    if (body.ATN_date !== undefined) {
      updateFields.push('ATN_date = ?')
      updateValues.push(body.ATN_date)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }
    
    updateValues.push(additionId)

    const updateQuery = `UPDATE GPA_Additions SET ${updateFields.join(', ')} WHERE ATN_id = ?`
    
    await executeQuery(updateQuery, updateValues)

    const originalProjectId = Number(existing[0].ATN_project_id)
    const updatedProjectId = Number(body.ATN_project_id ?? existing[0].ATN_project_id)

    await recalculateProjectRemainingAmount(updatedProjectId)
    if (updatedProjectId !== originalProjectId) {
      await recalculateProjectRemainingAmount(originalProjectId)
    }

    return NextResponse.json({ 
      message: 'Adición actualizada exitosamente'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al actualizar la adición' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const additionId = parseInt(resolvedParams.id)
    
    if (isNaN(additionId)) {
      return NextResponse.json({ error: 'ID de adición inválido' }, { status: 400 })
    }
    
    // Check if addition exists
    const checkQuery = 'SELECT ATN_id FROM GPA_Additions WHERE ATN_id = ?'
    const existing = await executeQuery(checkQuery, [additionId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Adición no encontrada' }, { status: 404 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_Additions WHERE ATN_id = ?'
    await executeQuery(deleteQuery, [additionId])
    
    return NextResponse.json({ 
      message: 'Adición eliminada exitosamente'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al eliminar la adición' },
      { status: 500 }
    )
  }
}
