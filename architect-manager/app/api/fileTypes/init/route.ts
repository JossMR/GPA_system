import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Common file types for architecture projects
    const defaultFileTypes = [
      'pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp',
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
      'zip', 'rar', '7z', 'mp4', 'avi', 'mov', 'wmv', 'flv',
      'mp3', 'wav', 'aac', 'unknown'
    ]

    const results = []
    
    for (const typeName of defaultFileTypes) {
      try {
        // Check if filetype already exists
        const existingFiletype = await executeQuery(
          'SELECT FTP_id FROM GPA_FileTypes WHERE FTP_name = ?',
          [typeName]
        ) as any[]

        if (existingFiletype.length === 0) {
          // Create new filetype
          const createResult = await executeQuery(
            'INSERT INTO GPA_FileTypes (FTP_name) VALUES (?)',
            [typeName]
          ) as any
          results.push({
            name: typeName,
            id: createResult.insertId,
            status: 'created'
          })
        } else {
          results.push({
            name: typeName,
            id: existingFiletype[0].FTP_id,
            status: 'exists'
          })
        }
      } catch (error) {
        console.error(`Error creating filetype ${typeName}:`, error)
        results.push({
          name: typeName,
          status: 'error',
          error: error
        })
      }
    }

    return NextResponse.json({
      message: 'File types initialization completed',
      results: results,
      created: results.filter(r => r.status === 'created').length,
      existing: results.filter(r => r.status === 'exists').length,
      errors: results.filter(r => r.status === 'error').length
    }, { status: 200 })

  } catch (error) {
    console.error('Error initializing file types:', error)
    return NextResponse.json(
      { error: 'Failed to initialize file types' },
      { status: 500 }
    )
  }
}