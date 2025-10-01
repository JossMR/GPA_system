import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAAddition } from '@/models/GPA_addition'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const additionId = parseInt(resolvedParams.id)
    
    if (isNaN(additionId)) {
      return NextResponse.json({ error: 'Invalid addition ID' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_Additions WHERE ATN_id = ?'
    const additions = await executeQuery(query, [additionId]) as GPAAddition[]
    
    if (additions.length === 0) {
      return NextResponse.json({ error: 'Addition not found' }, { status: 404 })
    }
    
    return NextResponse.json(additions[0], { status: 200 })

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
    const additionId = parseInt(resolvedParams.id)
    
    if (isNaN(additionId)) {
      return NextResponse.json({ error: 'Invalid addition ID' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPAAddition>
    
    // Validate required fields
    if (body.ATN_name !== undefined && (!body.ATN_name || body.ATN_name.trim() === '')) {
      return NextResponse.json({ error: 'Addition name cannot be empty' }, { status: 400 })
    }
    
    if (body.ATN_cost !== undefined && body.ATN_cost <= 0) {
      return NextResponse.json({ error: 'Cost must be positive' }, { status: 400 })
    }
    
    // Check if addition exists
    const checkQuery = 'SELECT ATN_id FROM GPA_Additions WHERE ATN_id = ?'
    const existing = await executeQuery(checkQuery, [additionId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Addition not found' }, { status: 404 })
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.ATN_name !== undefined) {
      updateFields.push('ATN_name = ?')
      updateValues.push(body.ATN_name.trim())
    }
    
    if (body.ATN_description !== undefined) {
      updateFields.push('ATN_description = ?')
      updateValues.push(body.ATN_description?.trim() || null)
    }
    
    if (body.ATN_project_id !== undefined) {
      updateFields.push('ATN_project_id = ?')
      updateValues.push(body.ATN_project_id)
    }
    
    if (body.ATN_cost !== undefined) {
      updateFields.push('ATN_cost = ?')
      updateValues.push(body.ATN_cost)
    }
    
    if (body.ATN_date !== undefined) {
      updateFields.push('ATN_date = ?')
      updateValues.push(body.ATN_date)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    updateValues.push(additionId)
    
    const updateQuery = `UPDATE GPA_Additions SET ${updateFields.join(', ')} WHERE ATN_id = ?`
    
    await executeQuery(updateQuery, updateValues)
    
    return NextResponse.json({ 
      message: 'Addition updated successfully'
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
    const additionId = parseInt(resolvedParams.id)
    
    if (isNaN(additionId)) {
      return NextResponse.json({ error: 'Invalid addition ID' }, { status: 400 })
    }
    
    // Check if addition exists
    const checkQuery = 'SELECT ATN_id FROM GPA_Additions WHERE ATN_id = ?'
    const existing = await executeQuery(checkQuery, [additionId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Addition not found' }, { status: 404 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_Additions WHERE ATN_id = ?'
    await executeQuery(deleteQuery, [additionId])
    
    return NextResponse.json({ 
      message: 'Addition deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
