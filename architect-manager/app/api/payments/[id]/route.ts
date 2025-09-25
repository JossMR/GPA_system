import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAPayment } from '@/models/GPA_payment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paymentId = parseInt(resolvedParams.id)
    
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 })
    }

    const query = 'SELECT * FROM GPA_Payments WHERE PAY_id = ?'
    const payments = await executeQuery(query, [paymentId]) as GPAPayment[]
    
    if (payments.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payments[0], { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      PAY_amount_due,
      PAY_amount_paid,
      PAY_due_date,
      PAY_payment_date,
      PAY_description,
      PAY_project_id
    } = body

    // Build dynamic update query
    const updateFields = []
    const updateValues = []
    
    if (PAY_amount_due !== undefined) {
      updateFields.push('PAY_amount_due = ?')
      updateValues.push(PAY_amount_due)
    }
    
    if (PAY_amount_paid !== undefined) {
      updateFields.push('PAY_amount_paid = ?')
      updateValues.push(PAY_amount_paid)
    }
    
    if (PAY_due_date !== undefined) {
      updateFields.push('PAY_due_date = ?')
      updateValues.push(PAY_due_date)
    }
    
    if (PAY_payment_date !== undefined) {
      updateFields.push('PAY_payment_date = ?')
      updateValues.push(PAY_payment_date)
    }
    
    if (PAY_description !== undefined) {
      updateFields.push('PAY_description = ?')
      updateValues.push(PAY_description)
    }
    
    if (PAY_project_id !== undefined) {
      updateFields.push('PAY_project_id = ?')
      updateValues.push(PAY_project_id)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    const updateQuery = `UPDATE GPA_Payments SET ${updateFields.join(', ')} WHERE PAY_id = ?`
    updateValues.push(paymentId)

    await executeQuery(updateQuery, updateValues)

    return NextResponse.json({ message: 'Payment updated successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 })
    }

    const deleteQuery = 'DELETE FROM GPA_Payments WHERE PAY_id = ?'
    await executeQuery(deleteQuery, [paymentId])

    return NextResponse.json({ message: 'Payment deleted successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
