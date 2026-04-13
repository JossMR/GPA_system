import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAPayment } from '@/models/GPA_payment'
import { GPAProject } from '@/models/GPA_project'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '10', 10)
    const search = (searchParams.get('search') || '').trim()
    const state = (searchParams.get('state') || '').trim()
    const orderByParam = (searchParams.get('orderBy') || 'date').trim()
    const orderDirParam = (searchParams.get('orderDir') || 'DESC').toUpperCase()

    const hasAdvancedFilters =
      searchParams.has('page')
      || searchParams.has('limit')
      || searchParams.has('search')
      || searchParams.has('state')
      || searchParams.has('orderBy')
      || searchParams.has('orderDir')

    const baseSelect = `
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
        const query = `${baseSelect} WHERE PAY_project_id = ? ORDER BY PAY_payment_date ASC`
        const payments = await executeQuery(query, [projectIdNum]) as GPAPayment[]
        return NextResponse.json(payments, { status: 200 })
      }
    }

    // Keep old behavior for consumers that expect an array.
    if (!hasAdvancedFilters) {
      const query = `${baseSelect} ORDER BY PAY_payment_date ASC`
      const payments = await executeQuery(query, params) as GPAPayment[]
      return NextResponse.json(payments, { status: 200 })
    }

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 10 : limitParam
    const offset = (page - 1) * limit

    const whereParts: string[] = []

    if (search) {
      whereParts.push(`(
        pr.PRJ_case_number LIKE ?
        OR p.PAY_bill_number LIKE ?
        OR CONCAT(c.CLI_name, ' ', c.CLI_f_lastname, ' ', c.CLI_s_lastname) LIKE ?
        OR p.PAY_method LIKE ?
      )`)
      const likeSearch = `%${search}%`
      params.push(likeSearch, likeSearch, likeSearch, likeSearch)
    }

    if (state && state !== 'todos') {
      whereParts.push('pr.PRJ_state = ?')
      params.push(state)
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''

    const orderByMap: Record<string, string> = {
      date: 'p.PAY_payment_date',
      caseNumber: 'pr.PRJ_case_number',
      billNumber: 'p.PAY_bill_number',
      client: `CONCAT(c.CLI_name, ' ', c.CLI_f_lastname, ' ', c.CLI_s_lastname)`,
      method: 'p.PAY_method',
    }
    const orderBy = orderByMap[orderByParam] || 'p.PAY_payment_date'
    const orderDir = orderDirParam === 'ASC' ? 'ASC' : 'DESC'

    const countQuery = `
      SELECT COUNT(*) as totalPayments
      FROM GPA_Payments p
      JOIN GPA_Projects pr ON p.PAY_project_id = pr.PRJ_id
      JOIN GPA_Clients c ON pr.PRJ_client_id = c.CLI_id
      ${whereClause}
    `
    const countResult = await executeQuery(countQuery, params) as Array<{ totalPayments: number }>
    const totalPayments = Number(countResult[0]?.totalPayments || 0)
    const totalPages = Math.ceil(totalPayments / limit)

    const query = `
      ${baseSelect}
      ${whereClause}
      ORDER BY ${orderBy} ${orderDir}
      LIMIT ?, ?
    `

    const payments = await executeQuery(query, [...params, offset, limit]) as GPAPayment[]

    return NextResponse.json({
      payments,
      page,
      limit,
      totalPayments,
      totalPages,
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<GPAPayment>

    if (!body.PAY_payment_date) {
      return NextResponse.json({ error: 'Fecha de pago es requerida' }, { status: 400 })
    }

    if (!body.PAY_project_id) {
      return NextResponse.json({ error: 'El ID del proyecto es requerido' }, { status: 400 })
    }

    const paymentData: Omit<GPAPayment, 'PAY_id'> = {
      PAY_amount_paid: body.PAY_amount_paid ?? 0,
      PAY_payment_date: body.PAY_payment_date,
      PAY_bill_number: body.PAY_bill_number || null,
      PAY_method: body.PAY_method,
      PAY_description: body.PAY_description || undefined,
      PAY_project_id: body.PAY_project_id
    }

    const insertQuery = `
      INSERT INTO GPA_Payments (
        PAY_amount_paid, 
        PAY_payment_date, 
        PAY_bill_number,
        PAY_method,
        PAY_description, 
        PAY_project_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(insertQuery, [
      paymentData.PAY_amount_paid,
      paymentData.PAY_payment_date,
      paymentData.PAY_bill_number,
      paymentData.PAY_method || null,
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
      message: 'Pago creado exitosamente',
      paymentId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error interno del servidor' },
      { status: 500 }
    )
  }
}
