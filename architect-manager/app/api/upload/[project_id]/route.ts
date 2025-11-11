import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { executeQuery } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.project_id

    // Validate project ID
    const projectIdNum = parseInt(projectId)
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    // Get documents from database instead of file system
    const query = `
      SELECT 
        DOC_id,
        DOC_name,
        DOC_file_path,
        DOC_upload_date,
        DOC_filetype_id,
        DOC_image_for_promotion,
        ft.FTP_name as filetype_name
      FROM GPA_Documents d
      LEFT JOIN GPA_FileTypes ft ON d.DOC_filetype_id = ft.FTP_id
      WHERE d.DOC_project_id = ?
      ORDER BY d.DOC_upload_date DESC
    `
    
    const documents = await executeQuery(query, [projectIdNum]) as any[]
    
    // Transform to match expected interface
    const fileDetails = documents.map(doc => ({
      docId: doc.DOC_id,
      fileName: path.basename(doc.DOC_file_path),
      filePath: doc.DOC_file_path,
      documentName: doc.DOC_name,
      fileSize: 0, // Will be calculated if file exists
      uploadDate: doc.DOC_upload_date,
      lastModified: doc.DOC_upload_date,
      filetypeId: doc.DOC_filetype_id,
      filetypeName: doc.filetype_name,
      isForPromotion: doc.DOC_image_for_promotion
    }))

    // Calculate file sizes for existing files
    for (const file of fileDetails) {
      try {
        const fullPath = path.join(process.cwd(), 'public', file.filePath)
        if (existsSync(fullPath)) {
          const stats = await stat(fullPath)
          file.fileSize = stats.size
          file.lastModified = stats.mtime
        }
      } catch (error) {
        console.warn(`Could not get stats for file: ${file.filePath}`)
      }
    }

    return NextResponse.json({
      projectId: projectIdNum,
      files: fileDetails
    }, { status: 200 })

  } catch (error) {
    console.error('Error listing documents:', error)
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.project_id

    // Validate project ID
    const projectIdNum = parseInt(projectId)
    if (isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File
    const documentName: string = (formData.get('documentName') as string) || file?.name || 'Unknown Document'
    const isForPromotion: string = (formData.get('isForPromotion') as string) || 'N'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
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

    // Public URL path
    const publicPath = `/uploads/projects/${projectId}/${uniqueFileName}`

    // Get or create file type based on extension
    let filetypeId = 1; // Default file type ID
    try {
      const filetypeName = fileExtension.toLowerCase().replace('.', '') || 'unknown'
      
      // Check if filetype exists
      const existingFiletype = await executeQuery(
        'SELECT FTP_id FROM GPA_FileTypes WHERE FTP_name = ?',
        [filetypeName]
      ) as any[]

      if (existingFiletype.length > 0) {
        filetypeId = existingFiletype[0].FTP_id
      } else {
        // Create new filetype
        const createFiletypeResult = await executeQuery(
          'INSERT INTO GPA_FileTypes (FTP_name) VALUES (?)',
          [filetypeName]
        ) as any
        filetypeId = createFiletypeResult.insertId
      }
    } catch (error) {
      console.warn('Error managing file type:', error)
      // Use default filetype if there's an error
    }

    // Create document record in database
    const insertDocumentQuery = `
      INSERT INTO GPA_Documents (
        DOC_project_id,
        DOC_name,
        DOC_file_path,
        DOC_upload_date,
        DOC_filetype_id,
        DOC_image_for_promotion
      ) VALUES (?, ?, ?, NOW(), ?, ?)
    `

    const documentResult = await executeQuery(insertDocumentQuery, [
      projectIdNum,
      documentName,
      publicPath,
      filetypeId,
      isForPromotion
    ]) as any

    return NextResponse.json({
      message: 'File uploaded successfully',
      documentId: documentResult.insertId,
      filePath: publicPath,
      fileName: uniqueFileName,
      originalName: originalName,
      documentName: documentName,
      fileSize: file.size,
      projectId: projectIdNum,
      filetypeId: filetypeId
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}