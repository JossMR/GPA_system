import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAObservation } from '@/models/GPA_observation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    let query = 'SELECT * FROM GPA_Observations'
    const params: any[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        query += ' WHERE OST_project_id = ?'
        params.push(projectIdNum)
      }
    }
    
    query += ' ORDER BY OST_date DESC'
    
    const observations = await executeQuery(query, params) as GPAObservation[]
    
    return NextResponse.json(observations, { status: 200 })

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
