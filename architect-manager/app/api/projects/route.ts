import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAProject, getLocalMySQLDateTime } from '@/models/GPA_project'

// Helper function to fetch project related data using main API endpoints
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

    // Parse responses, handle errors gracefully
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
      observations: [],
      documents: [],
      payments: []
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRelated = searchParams.get('include') === 'all'
    
    // Get all projects basic information
    const projectsQuery = `
      SELECT * FROM GPA_Projects
      ORDER BY PRJ_entry_date DESC
    `
    
    const projects = await executeQuery(projectsQuery) as GPAProject[]
    
    if (!includeRelated) {
      // Return projects without related data
      return NextResponse.json(projects, { status: 200 })
    }

    // Include related data for each project using main API endpoints
    const projectsWithRelatedData = await Promise.all(
      projects.map(async (project) => {
        if (project.PRJ_id) {
          // Get types data separately
          const typeRes = await fetch(`${new URL(request.url).origin}/api/types`, {
            headers: { 'Content-Type': 'application/json' }
          });
          const typeData = typeRes.ok ? await typeRes.json() : null;
          
          const relatedData = await fetchProjectRelatedData(project.PRJ_id, request)
          return {
            ...project,
            type: typeData,
            ...relatedData
          }
        }
        return project
      })
    )

    return NextResponse.json(projectsWithRelatedData, { status: 200 })

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
    const body = await request.json()
    const {
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2,
      PRJ_additional_directions,
      PRJ_budget,
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

    // Validate required fields
    if (!PRJ_client_id || !PRJ_case_number || !PRJ_category_id || !PRJ_type_id || !PRJ_state) {
      return NextResponse.json(
        { error: 'Required fields: client_id, case_number, category_id, type_id, state' },
        { status: 400 }
      )
    }

    const insertQuery = `
      INSERT INTO GPA_Projects (
        PRJ_client_id, PRJ_case_number, PRJ_area_m2, PRJ_additional_directions,
        PRJ_budget, PRJ_entry_date, PRJ_completion_date, PRJ_logbook_number,
        PRJ_logbook_close_date, PRJ_category_id, PRJ_type_id, PRJ_state,
        PRJ_final_price, PRJ_notes, PRJ_province, PRJ_canton, PRJ_district, PRJ_neighborhood
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(insertQuery, [
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2,
      PRJ_additional_directions,
      PRJ_budget,
      getLocalMySQLDateTime(),
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
    ]) as any

    return NextResponse.json({ 
      message: 'Project created successfully',
      projectId: result.insertId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
