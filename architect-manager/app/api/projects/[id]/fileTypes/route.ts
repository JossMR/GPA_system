import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAFileType } from '@/models/GPA_filetype'

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

    // Get file types related to the project documents
    const query = `
      SELECT DISTINCT ft.* FROM GPA_FileType ft
      INNER JOIN GPA_Documents d ON d.DOC_filetype_id = ft.FTP_id
      WHERE d.DOC_project_id = ?
      ORDER BY ft.FTP_Name
    `
    
    const fileTypes = await executeQuery(query, [projectId]) as GPAFileType[]
    
    return NextResponse.json(fileTypes, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}