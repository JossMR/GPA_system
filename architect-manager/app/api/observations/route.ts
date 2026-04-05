import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAObservation } from '@/models/GPA_observation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const orderDirParam = (searchParams.get('orderDir') || 'DESC').toUpperCase()
    const orderDir = orderDirParam === 'ASC' ? 'ASC' : 'DESC'
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '0', 10)
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 0 ? 0 : limitParam
    const hasPagination = searchParams.has('page') || searchParams.has('limit')
    
    let query = 'SELECT * FROM GPA_Observations'
    let countQuery = 'SELECT COUNT(OST_id) as totalObservations FROM GPA_Observations'
    const params: any[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        query += ' WHERE OST_project_id = ?'
        countQuery += ' WHERE OST_project_id = ?'
        params.push(projectIdNum)
      }
    }
    
    if (!hasPagination || limit <= 0) {
      query += ` ORDER BY OST_date ${orderDir}`
      const observations = await executeQuery(query, params) as GPAObservation[]
      return NextResponse.json(observations, { status: 200 })
    }

    const totalResult = await executeQuery(countQuery, params) as any[]
    const totalObservations = Number(totalResult[0]?.totalObservations || 0)
    const totalPages = Math.ceil(totalObservations / limit)
    const offset = (page - 1) * limit

    query += ` ORDER BY OST_date ${orderDir} LIMIT ?, ?`
    const queryParams = [...params, offset, limit]
    
    const observations = await executeQuery(query, queryParams) as GPAObservation[]
    
    return NextResponse.json({
      observations,
      page,
      limit,
      orderDir,
      totalObservations,
      totalPages
    }, { status: 200 })

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
    const body = await request.json() as Partial<GPAObservation>
    
    // Validate required fields according to GPAObservation interface
    if (!body.OST_project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    if (!body.OST_content || body.OST_content.trim() === '') {
      return NextResponse.json({ error: 'Observation content is required' }, { status: 400 })
    }
    
    // Create observation object following GPAObservation interface
    const observationData: Omit<GPAObservation, 'OST_id'> = {
      OST_project_id: body.OST_project_id,
      OST_content: body.OST_content.trim(),
      OST_date: body.OST_date || new Date().toISOString()
    }
    
    const insertQuery = `
      INSERT INTO GPA_Observations (
        OST_project_id, 
        OST_content, 
        OST_date
      ) VALUES (?, ?, ?)
    `
    
    const result = await executeQuery(insertQuery, [
      observationData.OST_project_id,
      observationData.OST_content,
      observationData.OST_date
    ]) as any
    
    return NextResponse.json({ 
      message: 'Observation created successfully',
      observationId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
