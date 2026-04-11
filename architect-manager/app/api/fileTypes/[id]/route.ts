import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAFileType } from '@/models/GPA_filetype'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const fileTypeId = parseInt(resolvedParams.id)
    
    if (isNaN(fileTypeId)) {
      return NextResponse.json({ error: 'ID de tipo de archivo inválido' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_FileTypes WHERE FTP_id = ?'
    const fileTypes = await executeQuery(query, [fileTypeId]) as GPAFileType[]
    
    if (fileTypes.length === 0) {
      return NextResponse.json({ error: 'Tipo de archivo no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(fileTypes[0], { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al obtener el tipo de archivo' },
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
    const fileTypeId = parseInt(resolvedParams.id)
    
    if (isNaN(fileTypeId)) {
      return NextResponse.json({ error: 'ID de tipo de archivo inválido' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPAFileType>
    
    // Validate required fields
    if (body.FTP_name !== undefined && (!body.FTP_name || body.FTP_name.trim() === '')) {
      return NextResponse.json({ error: 'El nombre del tipo de archivo no puede estar vacío' }, { status: 400 })
    }
    
    // Check if file type exists
    const checkQuery = 'SELECT FTP_id FROM GPA_FileTypes WHERE FTP_id = ?'
    const existing = await executeQuery(checkQuery, [fileTypeId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Tipo de archivo no encontrado' }, { status: 404 })
    }
    
    // Check if new name already exists (if updating name)
    if (body.FTP_name !== undefined) {
      const duplicateQuery = 'SELECT FTP_id FROM GPA_FileTypes WHERE FTP_name = ? AND FTP_id != ?'
      const duplicates = await executeQuery(duplicateQuery, [body.FTP_name.trim(), fileTypeId]) as any[]
      
      if (duplicates.length > 0) {
        return NextResponse.json({ error: 'Nombre del tipo de archivo ya existe' }, { status: 409 })
      }
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.FTP_name !== undefined) {
      updateFields.push('FTP_name = ?')
      updateValues.push(body.FTP_name.trim())
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }
    
    updateValues.push(fileTypeId)
    
    const updateQuery = `UPDATE GPA_FileTypes SET ${updateFields.join(', ')} WHERE FTP_id = ?`
    
    await executeQuery(updateQuery, updateValues)
    
    return NextResponse.json({ 
      message: 'Tipo de archivo actualizado exitosamente'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al actualizar el tipo de archivo' },
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
    const fileTypeId = parseInt(resolvedParams.id)
    
    if (isNaN(fileTypeId)) {
      return NextResponse.json({ error: 'ID de tipo de archivo inválido' }, { status: 400 })
    }
    
    // Check if file type exists
    const checkQuery = 'SELECT FTP_id FROM GPA_FileTypes WHERE FTP_id = ?'
    const existing = await executeQuery(checkQuery, [fileTypeId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Tipo de archivo no encontrado' }, { status: 404 })
    }
    
    // Check if file type is being used by any document (referential integrity)
    const documentsQuery = 'SELECT COUNT(*) as count FROM GPA_Documents WHERE DOC_filetype_id = ?'
    const documentsCount = await executeQuery(documentsQuery, [fileTypeId]) as any[]
    
    if (documentsCount[0].count > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el tipo de archivo: está siendo utilizado por uno o más documentos' 
      }, { status: 409 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_FileTypes WHERE FTP_id = ?'
    await executeQuery(deleteQuery, [fileTypeId])
    
    return NextResponse.json({ 
      message: 'Tipo de archivo eliminado exitosamente'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error de servidor: Error al eliminar el tipo de archivo' },
      { status: 500 }
    )
  }
}
