import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAtype } from '@/models/GPA_type'

export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT * FROM GPA_Types ORDER BY TYP_name ASC'
    
    const types = await executeQuery(query, []) as GPAtype[]
    
    return NextResponse.json(types, { status: 200 })

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
    const body = await request.json() as Partial<GPAtype>
    
    // Validate required fields according to GPAtype interface
    if (!body.TYP_name || body.TYP_name.trim() === '') {
      return NextResponse.json({ error: 'Type name is required' }, { status: 400 })
    }
    
    // Check if type name already exists
    const checkQuery = 'SELECT TYP_id FROM GPA_Types WHERE TYP_name = ?'
    const existing = await executeQuery(checkQuery, [body.TYP_name.trim()]) as any[]
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Type name already exists' }, { status: 409 })
    }
    
    // Create type object following GPAtype interface
    const typeData: Omit<GPAtype, 'TYP_id'> = {
      TYP_name: body.TYP_name.trim()
    }
    
    const insertQuery = `
      INSERT INTO GPA_Types (TYP_name) VALUES (?)
    `
    
    const result = await executeQuery(insertQuery, [
      typeData.TYP_name
    ]) as any
    
    return NextResponse.json({ 
      message: 'Type created successfully',
      typeId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
