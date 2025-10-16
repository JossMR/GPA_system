import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPADocument } from '@/models/GPA_document'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const filetypeId = searchParams.get('filetype_id')
    
    let query = 'SELECT * FROM GPA_Documents'
    const params: any[] = []
    const conditions: string[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        conditions.push('DOC_project_id = ?')
        params.push(projectIdNum)
      }
    }
    
    if (filetypeId) {
      const filetypeIdNum = parseInt(filetypeId)
      if (!isNaN(filetypeIdNum)) {
        conditions.push('DOC_filetype_id = ?')
        params.push(filetypeIdNum)
      }
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY DOC_upload_date DESC'
    
    const documents = await executeQuery(query, params) as GPADocument[]
    
    return NextResponse.json(documents, { status: 200 })

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
    const body = await request.json() as Partial<GPADocument>
    
    // Validate required fields according to GPADocument interface
    if (!body.DOC_project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    if (!body.DOC_name || body.DOC_name.trim() === '') {
      return NextResponse.json({ error: 'Document name is required' }, { status: 400 })
    }
    
    if (!body.DOC_file_path || body.DOC_file_path.trim() === '') {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }
    
    if (!body.DOC_filetype_id) {
      return NextResponse.json({ error: 'File type ID is required' }, { status: 400 })
    }
    
    // Create document object following GPADocument interface
    const documentData: Omit<GPADocument, 'DOC_id'> = {
      DOC_project_id: body.DOC_project_id,
      DOC_name: body.DOC_name.trim(),
      DOC_file_path: body.DOC_file_path.trim(),
      DOC_upload_date: body.DOC_upload_date || new Date().toISOString(),
      DOC_filetype_id: body.DOC_filetype_id
    }
    
    const insertQuery = `
      INSERT INTO GPA_Documents (
        DOC_project_id, 
        DOC_name, 
        DOC_file_path, 
        DOC_upload_date, 
        DOC_filetype_id
      ) VALUES (?, ?, ?, ?, ?)
    `
    
    const result = await executeQuery(insertQuery, [
      documentData.DOC_project_id,
      documentData.DOC_name,
      documentData.DOC_file_path,
      documentData.DOC_upload_date,
      documentData.DOC_filetype_id
    ]) as any
    
    return NextResponse.json({ 
      message: 'Document created successfully',
      documentId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
