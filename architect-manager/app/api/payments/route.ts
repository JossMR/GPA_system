import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAPayment } from '@/models/GPA_payment'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    let query = 'SELECT * FROM GPA_Payments'
    const params: any[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        query += ' WHERE PAY_project_id = ?'
        params.push(projectIdNum)
      }
    }
    
    query += ' ORDER BY PAY_due_date ASC'
    
    const payments = await executeQuery(query, params) as GPAPayment[]
    
    return NextResponse.json(payments, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      PAY_amount_due,
      PAY_amount_paid = 0,
      PAY_due_date,
      PAY_payment_date,
      PAY_description,
      PAY_project_id
    } = body
    
    // Basic validations
    if (!PAY_amount_due || PAY_amount_due <= 0) {
      return NextResponse.json({ error: 'Amount due is required and must be positive' }, { status: 400 })
    }
    
    if (!PAY_due_date) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 })
    }
    
    if (!PAY_project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    const insertQuery = `
      INSERT INTO GPA_Payments (
        PAY_amount_due, 
        PAY_amount_paid, 
        PAY_due_date, 
        PAY_payment_date, 
        PAY_description, 
        PAY_project_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
    
    const result = await executeQuery(insertQuery, [
      PAY_amount_due,
      PAY_amount_paid,
      PAY_due_date,
      PAY_payment_date || null,
      PAY_description || null,
      PAY_project_id
    ]) as any
    
    return NextResponse.json({ 
      message: 'Payment created successfully',
      paymentId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
