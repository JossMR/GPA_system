import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAcategory } from '@/models/GPA_category'

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

    // Get categories related to the project
    const query = `
      SELECT c.* FROM GPA_Categories c
      INNER JOIN GPA_ProjectsXGPA_Categories pc ON pc.CAT_id = c.CAT_id
      WHERE pc.PRJ_id = ?
    `
    
    const categories = await executeQuery(query, [projectId]) as GPAcategory[]
    
    return NextResponse.json(categories, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}