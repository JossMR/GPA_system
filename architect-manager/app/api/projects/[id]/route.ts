import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAProject } from '@/models/GPA_project'
import { GPAClient } from '@/models/GPA_client'
import { GPAcategory } from '@/models/GPA_category'

// Helper function to make API calls to main endpoints
async function fetchProjectRelatedData(projectId: number, request: NextRequest) {
  try {
    const baseUrl = new URL(request.url).origin
    
    // Create promises for all related data fetches using main API endpoints
    const [categoriesRes, observationsRes, documentsRes, paymentsRes] = await Promise.all([
      fetch(`${baseUrl}/api/categories?project_id=${projectId}`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${baseUrl}/api/observations?project_id=${projectId}`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${baseUrl}/api/documents?project_id=${projectId}`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${baseUrl}/api/payments?project_id=${projectId}`, {
        headers: { 'Content-Type': 'application/json' }
      })
    ])

    const categories = categoriesRes.ok ? await categoriesRes.json() : []
    const observations = observationsRes.ok ? await observationsRes.json() : []
    const documents = documentsRes.ok ? await documentsRes.json() : []
    const payments = paymentsRes.ok ? await paymentsRes.json() : []

    return {
      categories,
      observations,
      documents,
      payments
    }
  } catch (error) {
    console.error('Error fetching project related data via main API endpoints:', error)
    return {
      categories: [],
      types: undefined,
      observations: [],
      documents: [],
      payments: []
    }
  }
}

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

    const { searchParams } = new URL(request.url)
    const includeRelated = searchParams.get('include') === 'all'

    // Get project basic information
    const projectQuery = `
      SELECT * FROM GPA_Projects 
      WHERE PRJ_id = ?
    `
    
    const projects = await executeQuery(projectQuery, [projectId]) as GPAProject[]
    
    if (projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    let project = projects[0]
    const typeRes = await fetch(`${new URL(request.url).origin}/api/types`, {
        headers: { 'Content-Type': 'application/json' }
      });
    const typeData = typeRes.ok ? await typeRes.json() : null;
    project.type = typeData;

    const clientRes = await fetch(`${new URL(request.url).origin}/api/clients/${project?.PRJ_client_id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
    const clientJson = clientRes.ok ? await clientRes.json() : null;
    const clientData = clientJson ? clientJson.client as GPAClient : null;
    project.client_name = clientData?.CLI_name;

    const categoriesRes = await fetch(`${new URL(request.url).origin}/api/categories?project_id=${project.PRJ_id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() as GPAcategory[] : null;
    project.categories_names=[]
    categoriesData?.forEach((category,index)=>{project.categories_names?.push(category.CAT_name)})
    
    if (includeRelated) {
      // Get all related data using main API endpoints
      const relatedData = await fetchProjectRelatedData(projectId, request)
      project = {
        ...project,
        ...relatedData
      }
    }

    return NextResponse.json({project}, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const projectId = parseInt(resolvedParams.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2,
      PRJ_additional_directions,
      PRJ_budget,
      PRJ_entry_date,
      PRJ_completion_date,
      PRJ_logbook_number,
      PRJ_logbook_close_date,
      PRJ_category_id,
      PRJ_type_id,
      PRJ_state,
      PRJ_final_price,
      PRJ_notes,
      PRJ_province,
      PRJ_canton,
      PRJ_district,
      PRJ_neighborhood
    } = body

    const updateQuery = `
      UPDATE GPA_Projects SET
        PRJ_client_id = ?,
        PRJ_case_number = ?,
        PRJ_area_m2 = ?,
        PRJ_additional_directions = ?,
        PRJ_budget = ?,
        PRJ_entry_date = ?,
        PRJ_completion_date = ?,
        PRJ_logbook_number = ?,
        PRJ_logbook_close_date = ?,
        PRJ_category_id = ?,
        PRJ_type_id = ?,
        PRJ_state = ?,
        PRJ_final_price = ?,
        PRJ_notes = ?,
        PRJ_province = ?,
        PRJ_canton = ?,
        PRJ_district = ?,
        PRJ_neighborhood = ?
      WHERE PRJ_id = ?
    `

    await executeQuery(updateQuery, [
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2,
      PRJ_additional_directions,
      PRJ_budget,
      PRJ_entry_date,
      PRJ_completion_date,
      PRJ_logbook_number,
      PRJ_logbook_close_date,
      PRJ_category_id,
      PRJ_type_id,
      PRJ_state,
      PRJ_final_price,
      PRJ_notes,
      PRJ_province,
      PRJ_canton,
      PRJ_district,
      PRJ_neighborhood,
      projectId
    ])

    return NextResponse.json({ message: 'Project updated successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const projectId = parseInt(resolvedParams.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const deleteQuery = `DELETE FROM GPA_Projects WHERE PRJ_id = ?`
    await executeQuery(deleteQuery, [projectId])

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
