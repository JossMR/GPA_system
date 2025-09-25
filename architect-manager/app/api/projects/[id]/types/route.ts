import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAtype } from '@/models/GPA_type'

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

    // Get types related to the project
    const query = `
      SELECT t.* FROM GPA_Types t
      INNER JOIN GPA_Projects p ON p.PRJ_type_id = t.TYP_id
      WHERE p.PRJ_id = ?
    `
    
    const types = await executeQuery(query, [projectId]) as GPAtype[]
    
    return NextResponse.json(types, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}