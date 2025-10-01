import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAObservation } from '@/models/GPA_observation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const observationId = parseInt(resolvedParams.id)
    
    if (isNaN(observationId)) {
      return NextResponse.json({ error: 'Invalid observation ID' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_Observations WHERE OST_id = ?'
    const observations = await executeQuery(query, [observationId]) as GPAObservation[]
    
    if (observations.length === 0) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }
    
    return NextResponse.json(observations[0], { status: 200 })

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
    const observationId = parseInt(resolvedParams.id)
    
    if (isNaN(observationId)) {
      return NextResponse.json({ error: 'Invalid observation ID' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPAObservation>
    
    // Validate required fields
    if (body.OST_content !== undefined && (!body.OST_content || body.OST_content.trim() === '')) {
      return NextResponse.json({ error: 'Observation content cannot be empty' }, { status: 400 })
    }
    
    // Check if observation exists
    const checkQuery = 'SELECT OST_id FROM GPA_Observations WHERE OST_id = ?'
    const existing = await executeQuery(checkQuery, [observationId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.OST_project_id !== undefined) {
      updateFields.push('OST_project_id = ?')
      updateValues.push(body.OST_project_id)
    }
    
    if (body.OST_content !== undefined) {
      updateFields.push('OST_content = ?')
      updateValues.push(body.OST_content.trim())
    }
    
    if (body.OST_date !== undefined) {
      updateFields.push('OST_date = ?')
      updateValues.push(body.OST_date)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    updateValues.push(observationId)
    
    const updateQuery = `UPDATE GPA_Observations SET ${updateFields.join(', ')} WHERE OST_id = ?`
    
    await executeQuery(updateQuery, updateValues)
    
    return NextResponse.json({ 
      message: 'Observation updated successfully'
    }, { status: 200 })

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
    const observationId = parseInt(resolvedParams.id)
    
    if (isNaN(observationId)) {
      return NextResponse.json({ error: 'Invalid observation ID' }, { status: 400 })
    }
    
    // Check if observation exists
    const checkQuery = 'SELECT OST_id FROM GPA_Observations WHERE OST_id = ?'
    const existing = await executeQuery(checkQuery, [observationId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_Observations WHERE OST_id = ?'
    await executeQuery(deleteQuery, [observationId])
    
    return NextResponse.json({ 
      message: 'Observation deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
