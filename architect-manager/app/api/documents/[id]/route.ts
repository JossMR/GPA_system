import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPADocument } from '@/models/GPA_document'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const documentId = parseInt(resolvedParams.id)
    
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_Documents WHERE DOC_id = ?'
    const documents = await executeQuery(query, [documentId]) as GPADocument[]
    
    if (documents.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    return NextResponse.json(documents[0], { status: 200 })

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
    const documentId = parseInt(resolvedParams.id)
    
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPADocument>
    
    // Validate required fields
    if (body.DOC_name !== undefined && (!body.DOC_name || body.DOC_name.trim() === '')) {
      return NextResponse.json({ error: 'Document name cannot be empty' }, { status: 400 })
    }
    
    if (body.DOC_file_path !== undefined && (!body.DOC_file_path || body.DOC_file_path.trim() === '')) {
      return NextResponse.json({ error: 'File path cannot be empty' }, { status: 400 })
    }
    
    // Check if document exists
    const checkQuery = 'SELECT DOC_id FROM GPA_Documents WHERE DOC_id = ?'
    const existing = await executeQuery(checkQuery, [documentId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.DOC_project_id !== undefined) {
      updateFields.push('DOC_project_id = ?')
      updateValues.push(body.DOC_project_id)
    }
    
    if (body.DOC_name !== undefined) {
      updateFields.push('DOC_name = ?')
      updateValues.push(body.DOC_name.trim())
    }
    
    if (body.DOC_file_path !== undefined) {
      updateFields.push('DOC_file_path = ?')
      updateValues.push(body.DOC_file_path.trim())
    }
    
    if (body.DOC_upload_date !== undefined) {
      updateFields.push('DOC_upload_date = ?')
      updateValues.push(body.DOC_upload_date)
    }
    
    if (body.DOC_filetype_id !== undefined) {
      updateFields.push('DOC_filetype_id = ?')
      updateValues.push(body.DOC_filetype_id)
    }
    
    if (body.DOC_image_for_promotion !== undefined) {
      updateFields.push('DOC_image_for_promotion = ?')
      updateValues.push(body.DOC_image_for_promotion)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    updateValues.push(documentId)
    
    const updateQuery = `UPDATE GPA_Documents SET ${updateFields.join(', ')} WHERE DOC_id = ?`
    
    await executeQuery(updateQuery, updateValues)
    
    return NextResponse.json({ 
      message: 'Document updated successfully'
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
    const documentId = parseInt(resolvedParams.id)
    
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }
    
    // Check if document exists
    const checkQuery = 'SELECT DOC_id FROM GPA_Documents WHERE DOC_id = ?'
    const existing = await executeQuery(checkQuery, [documentId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_Documents WHERE DOC_id = ?'
    await executeQuery(deleteQuery, [documentId])
    
    return NextResponse.json({ 
      message: 'Document deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
