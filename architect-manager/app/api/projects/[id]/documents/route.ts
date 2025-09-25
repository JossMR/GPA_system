import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPADocument } from '@/models/GPA_document'

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

    // Get documents related to the project
    const query = `
      SELECT d.*, ft.FTP_Name as filetype_name 
      FROM GPA_Documents d
      LEFT JOIN GPA_FileTypes ft ON d.DOC_filetype_id = ft.FTP_id
      WHERE d.DOC_project_id = ?
      ORDER BY d.DOC_upload_date DESC
    `
    
    const documents = await executeQuery(query, [projectId]) as GPADocument[]
    
    return NextResponse.json(documents, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { DOC_name, DOC_file_path, DOC_filetype_id } = body

    if (!DOC_name || !DOC_file_path || !DOC_filetype_id) {
      return NextResponse.json({ error: 'Name, file path and filetype are required' }, { status: 400 })
    }

    const insertQuery = `
      INSERT INTO GPA_Documents (DOC_project_id, DOC_name, DOC_file_path, DOC_upload_date, DOC_filetype_id)
      VALUES (?, ?, ?, NOW(), ?)
    `

    await executeQuery(insertQuery, [projectId, DOC_name, DOC_file_path, DOC_filetype_id])

    return NextResponse.json({ message: 'Document created successfully' }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}