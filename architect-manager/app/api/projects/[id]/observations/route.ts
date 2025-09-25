import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAObservation } from '@/models/GPA_observation'

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

    // Get observations related to the project
    const query = `
      SELECT * FROM GPA_Observations
      WHERE OST_project_id = ?
      ORDER BY OST_date DESC
    `
    
    const observations = await executeQuery(query, [projectId]) as GPAObservation[]
    
    return NextResponse.json(observations, { status: 200 })

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
    const { OST_content } = body

    if (!OST_content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const insertQuery = `
      INSERT INTO GPA_Observation (OST_project_id, OST_content, OST_date)
      VALUES (?, ?, NOW())
    `

    await executeQuery(insertQuery, [projectId, OST_content])

    return NextResponse.json({ message: 'Observation created successfully' }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}