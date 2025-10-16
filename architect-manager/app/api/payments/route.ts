import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAPayment } from '@/models/GPA_payment'
import { GPAProject } from '@/models/GPA_project'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    let query = `
      SELECT 
        p.*,
        pr.PRJ_state AS projectState,
        pr.PRJ_case_number AS projectCaseNumber,
        CONCAT(c.CLI_name, ' ', c.CLI_f_lastname, ' ', c.CLI_s_lastname) AS projectClientName
      FROM GPA_Payments p
      JOIN GPA_Projects pr ON p.PAY_project_id = pr.PRJ_id
      JOIN GPA_Clients c ON pr.PRJ_client_id = c.CLI_id
    `

    const params: any[] = []

    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        query += ' WHERE PAY_project_id = ?'
        params.push(projectIdNum)
      }
    }

    query += ' ORDER BY PAY_payment_date ASC'

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
    const body = await request.json() as Partial<GPAPayment>

    if (!body.PAY_payment_date) {
      return NextResponse.json({ error: 'Payment date is required' }, { status: 400 })
    }

    if (!body.PAY_project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const paymentData: Omit<GPAPayment, 'PAY_id'> = {
      PAY_amount_paid: body.PAY_amount_paid ?? 0,
      PAY_payment_date: body.PAY_payment_date,
      PAY_description: body.PAY_description || undefined,
      PAY_project_id: body.PAY_project_id
    }

    const insertQuery = `
      INSERT INTO GPA_Payments (
        PAY_amount_paid, 
        PAY_payment_date, 
        PAY_description, 
        PAY_project_id
      ) VALUES (?, ?, ?, ?)
    `

    const result = await executeQuery(insertQuery, [
      paymentData.PAY_amount_paid,
      paymentData.PAY_payment_date,
      paymentData.PAY_description?.toString() || null,
      paymentData.PAY_project_id
    ]) as any

    const project = await fetch(`${new URL(request.url).origin}/api/projects/${paymentData.PAY_project_id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    let responseProject = project.ok ? await project.json() : null;
    let projectData = responseProject?.project as GPAProject | null;
    let response;
    if (projectData) {
      const putUrl = `${new URL(request.url).origin}/api/projects/${projectData.PRJ_id}`;
      response = await fetch(putUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
    }

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
