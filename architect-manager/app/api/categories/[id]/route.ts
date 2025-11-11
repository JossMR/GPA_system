import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAcategory } from '@/models/GPA_category'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_Categories WHERE CAT_id = ?'
    const categories = await executeQuery(query, [categoryId]) as GPAcategory[]
    
    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json(categories[0], { status: 200 })

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
    const categoryId = parseInt(resolvedParams.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPAcategory>
    
    // Validate required fields
    if (body.CAT_name !== undefined && (!body.CAT_name || body.CAT_name.trim() === '')) {
      return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 })
    }
    
    // Check if category exists
    const checkQuery = 'SELECT CAT_id FROM GPA_Categories WHERE CAT_id = ?'
    const existing = await executeQuery(checkQuery, [categoryId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Check if new name already exists (if updating name)
    if (body.CAT_name !== undefined) {
      const duplicateQuery = 'SELECT CAT_id FROM GPA_Categories WHERE CAT_name = ? AND CAT_id != ?'
      const duplicates = await executeQuery(duplicateQuery, [body.CAT_name.trim(), categoryId]) as any[]
      
      if (duplicates.length > 0) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
      }
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.CAT_name !== undefined) {
      updateFields.push('CAT_name = ?')
      updateValues.push(body.CAT_name.trim())
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    updateValues.push(categoryId)
    
    const updateQuery = `UPDATE GPA_Categories SET ${updateFields.join(', ')} WHERE CAT_id = ?`
    
    await executeQuery(updateQuery, updateValues)
    
    return NextResponse.json({ 
      message: 'Category updated successfully'
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
    const categoryId = parseInt(resolvedParams.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }
    
    // Check if category exists
    const checkQuery = 'SELECT CAT_id FROM GPA_Categories WHERE CAT_id = ?'
    const existing = await executeQuery(checkQuery, [categoryId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Check if category is being used by any project (referential integrity)
    const projectsQuery = 'SELECT COUNT(*) as count FROM GPA_ProjectsXGPA_Categories WHERE CAT_id = ?'
    const projectsCount = await executeQuery(projectsQuery, [categoryId]) as any[]
    
    if (projectsCount[0].count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category: it is being used by one or more projects' 
      }, { status: 409 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_Categories WHERE CAT_id = ?'
    await executeQuery(deleteQuery, [categoryId])
    
    return NextResponse.json({ 
      message: 'Category deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
