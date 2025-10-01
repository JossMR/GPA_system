import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

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

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId, filename)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
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
    }

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
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

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId, filename)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete file
    await unlink(filePath)

    return NextResponse.json({
      message: 'File deleted successfully',
      fileName: filename,
      projectId: projectIdNum
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}