import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAtype } from '@/models/GPA_type'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const typeId = parseInt(resolvedParams.id)
    
    if (isNaN(typeId)) {
      return NextResponse.json({ error: 'ID de tipo inválido' }, { status: 400 })
    }
    
    const query = 'SELECT * FROM GPA_Types WHERE TYP_id = ?'
    const types = await executeQuery(query, [typeId]) as GPAtype[]
    
    if (types.length === 0) {
      return NextResponse.json({ error: 'Tipo no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(types[0], { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error del servidor: Error interno del servidor' },
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
    const typeId = parseInt(resolvedParams.id)
    
    if (isNaN(typeId)) {
      return NextResponse.json({ error: 'ID de tipo inválido' }, { status: 400 })
    }
    
    const body = await request.json() as Partial<GPAtype>
    
    // Validate required fields
    if (body.TYP_name !== undefined && (!body.TYP_name || body.TYP_name.trim() === '')) {
      return NextResponse.json({ error: 'Nombre de tipo no puede estar vacío' }, { status: 400 })
    }
    
    // Check if type exists
    const checkQuery = 'SELECT TYP_id FROM GPA_Types WHERE TYP_id = ?'
    const existing = await executeQuery(checkQuery, [typeId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Tipo no encontrado' }, { status: 404 })
    }
    
    // Check if new name already exists (if updating name)
    if (body.TYP_name !== undefined) {
      const duplicateQuery = 'SELECT TYP_id FROM GPA_Types WHERE TYP_name = ? AND TYP_id != ?'
      const duplicates = await executeQuery(duplicateQuery, [body.TYP_name.trim(), typeId]) as any[]
      
      if (duplicates.length > 0) {
        return NextResponse.json({ error: 'Nombre de tipo ya existe' }, { status: 409 })
      }
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (body.TYP_name !== undefined) {
      updateFields.push('TYP_name = ?')
      updateValues.push(body.TYP_name.trim())
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }
    
    updateValues.push(typeId)
    
    const updateQuery = `UPDATE GPA_Types SET ${updateFields.join(', ')} WHERE TYP_id = ?`
    
    await executeQuery(updateQuery, updateValues)
    
    return NextResponse.json({ 
      message: 'Tipo actualizado exitosamente'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error del servidor: Error interno del servidor' },
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
    const typeId = parseInt(resolvedParams.id)
    
    if (isNaN(typeId)) {
      return NextResponse.json({ error: 'ID de tipo inválido' }, { status: 400 })
    }
    
    // Check if type exists
    const checkQuery = 'SELECT TYP_id FROM GPA_Types WHERE TYP_id = ?'
    const existing = await executeQuery(checkQuery, [typeId]) as any[]
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Tipo no encontrado' }, { status: 404 })
    }
    
    const deleteQuery = 'DELETE FROM GPA_Types WHERE TYP_id = ?'
    await executeQuery(deleteQuery, [typeId])
    
    return NextResponse.json({ 
      message: 'Tipo eliminado exitosamente'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Error del servidor: Error interno del servidor' },
      { status: 500 }
    )
  }
}
