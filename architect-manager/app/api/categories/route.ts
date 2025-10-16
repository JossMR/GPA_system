import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAcategory } from '@/models/GPA_category'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    let query = 'SELECT c.* FROM GPA_Categories c'
    const params: any[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        // Join with the relationship table to get categories for a specific project
        query += ` 
          INNER JOIN GPA_ProjectsXGPA_Categories pxc ON c.CAT_id = pxc.CAT_id 
          WHERE pxc.PRJ_id = ?`
        params.push(projectIdNum)
      }
    }
    
    query += ' ORDER BY c.CAT_name ASC'
    
    const categories = await executeQuery(query, params) as GPAcategory[]
    
    return NextResponse.json(categories, { status: 200 })

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
    const body = await request.json() as Partial<GPAcategory>
    
    // Validate required fields according to GPAcategory interface
    if (!body.CAT_name || body.CAT_name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }
    
    // Check if category name already exists
    const checkQuery = 'SELECT CAT_id FROM GPA_Categories WHERE CAT_name = ?'
    const existing = await executeQuery(checkQuery, [body.CAT_name.trim()]) as any[]
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }
    
    // Create category object following GPAcategory interface
    const categoryData: Omit<GPAcategory, 'CAT_id'> = {
      CAT_name: body.CAT_name.trim()
    }
    
    const insertQuery = `
      INSERT INTO GPA_Categories (CAT_name) VALUES (?)
    `
    
    const result = await executeQuery(insertQuery, [
      categoryData.CAT_name
    ]) as any
    
    return NextResponse.json({ 
      message: 'Category created successfully',
      categoryId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
