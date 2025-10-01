import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate project ID
    const projectIdNum = parseInt(projectId)
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    // Get project directory
    const projectDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId)
    
    if (!existsSync(projectDir)) {
      return NextResponse.json({ files: [] }, { status: 200 })
    }

    // Read files in directory
    const files = await readdir(projectDir)
    
    // Get file details
    const fileDetails = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(projectDir, fileName)
        const stats = await stat(filePath)
        
        return {
          fileName,
          filePath: `/uploads/projects/${projectId}/${fileName}`,
          fileSize: stats.size,
          uploadDate: stats.birthtime,
          lastModified: stats.mtime
        }
      })
    )

    return NextResponse.json({
      projectId: projectIdNum,
      files: fileDetails
    }, { status: 200 })

  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File
    const projectId = formData.get('project_id') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate project ID is a number
    const projectIdNum = parseInt(projectId)
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    // Create file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now()
    const originalName = file.name
    const fileExtension = path.extname(originalName)
    const baseName = path.basename(originalName, fileExtension)
    const uniqueFileName = `${baseName}_${timestamp}${fileExtension}`

    // Create directory structure: /uploads/projects/{project_id}/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId)
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Full file path
    const filePath = path.join(uploadDir, uniqueFileName)

    // Write file
    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicPath = `/uploads/projects/${projectId}/${uniqueFileName}`

    return NextResponse.json({
      message: 'File uploaded successfully',
      filePath: publicPath,
      fileName: uniqueFileName,
      originalName: originalName,
      fileSize: file.size,
      projectId: projectIdNum
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}