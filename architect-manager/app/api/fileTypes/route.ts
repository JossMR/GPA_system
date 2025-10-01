import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAFileType } from '@/models/GPA_filetype'

export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT * FROM GPA_FileTypes ORDER BY FTP_name ASC'
    
    const fileTypes = await executeQuery(query, []) as GPAFileType[]
    
    return NextResponse.json(fileTypes, { status: 200 })

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
    const body = await request.json() as Partial<GPAFileType>
    
    // Validate required fields according to GPAFileType interface
    if (!body.FTP_name || body.FTP_name.trim() === '') {
      return NextResponse.json({ error: 'File type name is required' }, { status: 400 })
    }
    
    // Check if file type name already exists
    const checkQuery = 'SELECT FTP_id FROM GPA_FileTypes WHERE FTP_name = ?'
    const existing = await executeQuery(checkQuery, [body.FTP_name.trim()]) as any[]
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'File type name already exists' }, { status: 409 })
    }
    
    // Create file type object following GPAFileType interface
    const fileTypeData: Omit<GPAFileType, 'FTP_id'> = {
      FTP_name: body.FTP_name.trim()
    }
    
    const insertQuery = `
      INSERT INTO GPA_FileTypes (FTP_name) VALUES (?)
    `
    
    const result = await executeQuery(insertQuery, [
      fileTypeData.FTP_name
    ]) as any
    
    return NextResponse.json({ 
      message: 'File type created successfully',
      fileTypeId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
