import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAAddition } from '@/models/GPA_addition'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    let query = 'SELECT * FROM GPA_Additions'
    const params: any[] = []
    
    if (projectId) {
      const projectIdNum = parseInt(projectId)
      if (!isNaN(projectIdNum)) {
        query += ' WHERE ATN_project_id = ?'
        params.push(projectIdNum)
      }
    }
    
    query += ' ORDER BY ATN_date DESC'
    
    const additions = await executeQuery(query, params) as GPAAddition[]
    
    return NextResponse.json(additions, { status: 200 })

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
    const body = await request.json() as Partial<GPAAddition>
    
    // Validate required fields according to GPAAddition interface
    if (!body.ATN_name || body.ATN_name.trim() === '') {
      return NextResponse.json({ error: 'Addition name is required' }, { status: 400 })
    }
    
    if (!body.ATN_project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    if (!body.ATN_cost || body.ATN_cost <= 0) {
      return NextResponse.json({ error: 'Cost is required and must be positive' }, { status: 400 })
    }
    
    if (!body.ATN_date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }
    
    // Create addition object following GPAAddition interface
    const additionData: Omit<GPAAddition, 'ATN_id'> = {
      ATN_name: body.ATN_name.trim(),
      ATN_description: body.ATN_description?.trim() || undefined,
      ATN_project_id: body.ATN_project_id,
      ATN_cost: body.ATN_cost,
      ATN_date: body.ATN_date
    }
    
    const insertQuery = `
      INSERT INTO GPA_Additions (
        ATN_name, 
        ATN_description, 
        ATN_project_id, 
        ATN_cost, 
        ATN_date
      ) VALUES (?, ?, ?, ?, ?)
    `
    
    const result = await executeQuery(insertQuery, [
      additionData.ATN_name,
      additionData.ATN_description || null,
      additionData.ATN_project_id,
      additionData.ATN_cost,
      additionData.ATN_date
    ]) as any
    
    return NextResponse.json({ 
      message: 'Addition created successfully',
      additionId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
