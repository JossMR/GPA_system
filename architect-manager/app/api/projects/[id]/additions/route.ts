import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

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

    // Get additional information related to the project
    // This could be expanded based on specific additional data requirements
    const query = `
      SELECT 
        PRJ_additional_directions as additional_directions,
        PRJ_notes as notes
      FROM GPA_Projects
      WHERE PRJ_id = ?
    `
    
    const additions = await executeQuery(query, [projectId])
    
    return NextResponse.json(additions, { status: 200 })

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
    const projectId = parseInt(resolvedParams.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const body = await request.json()
    const { additional_directions, notes } = body

    const updateQuery = `
      UPDATE GPA_Projects SET
        PRJ_additional_directions = ?,
        PRJ_notes = ?
      WHERE PRJ_id = ?
    `

    await executeQuery(updateQuery, [additional_directions, notes, projectId])

    return NextResponse.json({ message: 'Additional information updated successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}