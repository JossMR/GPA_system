import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { executeQuery } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string; filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const { project_id: projectId, filename } = resolvedParams

    // Validate project ID
    const projectIdNum = parseInt(projectId)
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Find document in database by filename and project
    const documentQuery = `
      SELECT DOC_id, DOC_name, DOC_file_path, DOC_upload_date
      FROM GPA_Documents 
      WHERE DOC_project_id = ? AND DOC_file_path LIKE ?
    `
    const documents = await executeQuery(documentQuery, [projectIdNum, `%${filename}`]) as any[]
    
    if (documents.length === 0) {
      return NextResponse.json({ error: 'Document not found in database' }, { status: 404 })
    }

    const document = documents[0]
    const filePath = path.join(process.cwd(), 'public', document.DOC_file_path)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Physical file not found' }, { status: 404 })
    }

    // Get file stats
    const stats = await stat(filePath)
    
    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'application/octet-stream'
    
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.dwg': 'application/acad',
      '.zip': 'application/zip'
    }
    
    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext]
    }

    // Check if download is requested
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'X-Document-Name': document.DOC_name,
      'X-Document-ID': document.DOC_id.toString(),
    }

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${document.DOC_name || filename}"`
    }

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error getting file:', error)
    return NextResponse.json(
      { error: 'Failed to get file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string; filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const { project_id: projectId, filename } = resolvedParams

    // Validate project ID
    const projectIdNum = parseInt(projectId)
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Find document in database by filename and project
    const documentQuery = `
      SELECT DOC_id, DOC_name, DOC_file_path
      FROM GPA_Documents 
      WHERE DOC_project_id = ? AND DOC_file_path LIKE ?
    `
    const documents = await executeQuery(documentQuery, [projectIdNum, `%${filename}`]) as any[]
    
    if (documents.length === 0) {
      return NextResponse.json({ error: 'Document not found in database' }, { status: 404 })
    }

    const document = documents[0]
    const filePath = path.join(process.cwd(), 'public', document.DOC_file_path)
    
    // Delete physical file if it exists
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Delete document record from database
    const deleteQuery = 'DELETE FROM GPA_Documents WHERE DOC_id = ?'
    await executeQuery(deleteQuery, [document.DOC_id])

    return NextResponse.json({
      message: 'Document deleted successfully',
      documentId: document.DOC_id,
      documentName: document.DOC_name,
      fileName: filename,
      projectId: projectIdNum
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}