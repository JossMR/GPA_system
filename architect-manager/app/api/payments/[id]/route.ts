import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAPayment } from '@/models/GPA_payment'

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
    const paymentId = parseInt(resolvedParams.id)

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'ID de pago inválido' }, { status: 400 })
    }

    const query = 'SELECT * FROM GPA_Payments WHERE PAY_id = ?'
    const payments = await executeQuery(query, [paymentId]) as GPAPayment[]

    if (payments.length === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json(payments[0], { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error interno del servidor' },
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
    const paymentId = parseInt(resolvedParams.id)

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'ID de pago inválido' }, { status: 400 })
    }

    const body = await request.json()
    const {
      PAY_amount_paid,
      PAY_payment_date,
      PAY_bill_number,
      PAY_method,
      PAY_description,
      PAY_project_id
    } = body

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (PAY_amount_paid !== undefined) {
      updateFields.push('PAY_amount_paid = ?')
      updateValues.push(PAY_amount_paid)
    }

    if (PAY_payment_date !== undefined) {
      updateFields.push('PAY_payment_date = ?')
      updateValues.push(PAY_payment_date)
    }

    if (PAY_method !== undefined) {
      updateFields.push('PAY_method = ?')
      updateValues.push(PAY_method)
    }

    if (PAY_description !== undefined) {
      updateFields.push('PAY_description = ?')
      updateValues.push(PAY_description)
    }

    if (PAY_bill_number !== undefined) {
      updateFields.push('PAY_bill_number = ?')
      updateValues.push(PAY_bill_number)
    }

    if (PAY_project_id !== undefined) {
      updateFields.push('PAY_project_id = ?')
      updateValues.push(PAY_project_id)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }
    const oldPaymentResult = await executeQuery(
      'SELECT PAY_project_id FROM GPA_Payments WHERE PAY_id = ?',
      [paymentId]
    ) as Array<{ PAY_project_id: number | null }>

    if (oldPaymentResult.length === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    const oldProjectId = Number(oldPaymentResult[0].PAY_project_id)

    const updateQuery = `UPDATE GPA_Payments SET ${updateFields.join(', ')} WHERE PAY_id = ?`
    updateValues.push(paymentId)

    await executeQuery(updateQuery, updateValues)

    const updatedProjectId = Number(PAY_project_id ?? oldProjectId)

    await recalculateProjectRemainingAmount(updatedProjectId)
    if (updatedProjectId !== oldProjectId) {
      await recalculateProjectRemainingAmount(oldProjectId)
    }

    return NextResponse.json({ message: 'Pago actualizado exitosamente' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error interno del servidor' },
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
    const paymentId = parseInt(resolvedParams.id)

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'ID de pago inválido' }, { status: 400 })
    }

    const paymentResult = await executeQuery(
      'SELECT PAY_project_id FROM GPA_Payments WHERE PAY_id = ?',
      [paymentId]
    ) as Array<{ PAY_project_id: number | null }>

    if (paymentResult.length === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    const projectId = Number(paymentResult[0].PAY_project_id)

    const deleteQuery = 'DELETE FROM GPA_Payments WHERE PAY_id = ?'
    await executeQuery(deleteQuery, [paymentId])

    await recalculateProjectRemainingAmount(projectId)

    return NextResponse.json({ message: 'Pago eliminado exitosamente' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error interno del servidor' },
      { status: 500 }
    )
  }
}
