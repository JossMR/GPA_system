import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAPayment } from '@/models/GPA_payment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    // Get payments related to the project
    const query = `
      SELECT * FROM GPA_Payments
      WHERE PAY_project_id = ?
      ORDER BY PAY_due_date ASC
    `
    
    const payments = await executeQuery(query, [projectId]) as GPAPayment[]
    
    return NextResponse.json(payments, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      PAY_amount_due, 
      PAY_amount_paid, 
      PAY_due_date, 
      PAY_payment_date, 
      PAY_description 
    } = body

    if (!PAY_amount_due || !PAY_due_date) {
      return NextResponse.json({ error: 'Amount due and due date are required' }, { status: 400 })
    }

    const insertQuery = `
      INSERT INTO GPA_Payments (PAY_project_id, PAY_amount_due, PAY_amount_paid, PAY_due_date, PAY_payment_date, PAY_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    await executeQuery(insertQuery, [
      projectId, 
      PAY_amount_due, 
      PAY_amount_paid || 0, 
      PAY_due_date, 
      PAY_payment_date, 
      PAY_description
    ])

    return NextResponse.json({ message: 'Payment created successfully' }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
