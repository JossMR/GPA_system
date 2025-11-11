import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAProject, getLocalMySQLDateTime } from '@/models/GPA_project'
import { GPAClient } from '@/models/GPA_client'
import { GPAcategory } from '@/models/GPA_category'

async function fetchProjectRelatedData(projectId: number, request: NextRequest) {
  try {
    const baseUrl = new URL(request.url).origin

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

    const projectsQuery = `
      SELECT * FROM GPA_Projects
      ORDER BY PRJ_entry_date DESC
    `

    let projects = await executeQuery(projectsQuery) as GPAProject[]

    await Promise.all(projects.map(async (project, index) => {
      // Fetch type of the project
      const typeRes = await fetch(`${new URL(request.url).origin}/api/types/${project.PRJ_type_id}}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const typeData = typeRes.ok ? await typeRes.json() : null;
      project.type = typeData;

      // Fetch user name owner of the project
      const clientRes = await fetch(`${new URL(request.url).origin}/api/clients/${project?.PRJ_client_id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const clientJson = clientRes.ok ? await clientRes.json() : null;
      const clientData = clientJson ? clientJson.client as GPAClient : null;
      project.client_name = clientData?.CLI_name + " " + clientData?.CLI_f_lastname + " " + clientData?.CLI_s_lastname;
      project.client_identification = clientData?.CLI_identification;
      // Fetch categories names of the project
      const categoriesRes = await fetch(`${new URL(request.url).origin}/api/categories?project_id=${project.PRJ_id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() as GPAcategory[] : null;
      project.categories_names = [];
      categoriesData?.forEach((category) => { project.categories_names?.push(category.CAT_name) });
    }));
    if (!includeRelated) {
      return NextResponse.json({ projects }, { status: 200 })
    }

    const projectsWithRelatedData = await Promise.all(
      projects.map(async (project) => {
        if (project.PRJ_id) {
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
    projects = projectsWithRelatedData

    return NextResponse.json({ projects }, { status: 200 })

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
      PRJ_type_id,
      PRJ_state,
      PRJ_final_price,
      PRJ_notes,
      PRJ_province,
      PRJ_canton,
      PRJ_district,
      PRJ_neighborhood,
      PRJ_start_construction_date,
      PRJ_remaining_amount,
      categories
    } = body

    // Validate required fields
    if (!PRJ_client_id || !PRJ_case_number || !PRJ_type_id || !PRJ_state) {
      return NextResponse.json(
        { error: 'Required fields: client_id, case_number, type_id, state' },
        { status: 400 }
      )
    }
    const insertQuery = `
      INSERT INTO GPA_Projects (
        PRJ_client_id, PRJ_case_number, PRJ_area_m2, PRJ_additional_directions,
        PRJ_budget, PRJ_entry_date, PRJ_completion_date, PRJ_logbook_number,
        PRJ_logbook_close_date, PRJ_type_id, PRJ_state,
        PRJ_final_price, PRJ_notes, PRJ_province, PRJ_canton, PRJ_district, PRJ_neighborhood, PRJ_start_construction_date, PRJ_remaining_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(insertQuery, [
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2?.toString() || null,
      PRJ_additional_directions || null,
      PRJ_budget?.toString() || null,
      getLocalMySQLDateTime(),
      PRJ_completion_date?.toString() || null,
      PRJ_logbook_number?.toString() || null,
      PRJ_logbook_close_date?.toString() || null,
      PRJ_type_id,
      PRJ_state,
      PRJ_final_price?.toString() || null,
      PRJ_notes?.toString() || null,
      PRJ_province?.toString() || null,
      PRJ_canton?.toString() || null,
      PRJ_district?.toString() || null,
      PRJ_neighborhood?.toString() || null,
      PRJ_start_construction_date?.toString() || null,
      PRJ_remaining_amount?.toString() || null
    ]) as any

    const projectId = result.insertId

    // Assign categories if provided
    if (Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        if (cat.CAT_id) {
          await executeQuery(
            'INSERT INTO GPA_ProjectsXGPA_Categories (PRJ_id, CAT_id) VALUES (?, ?)',
            [projectId, cat.CAT_id]
          )
        }
      }
    }

    return NextResponse.json({
      message: 'Project created successfully',
      projectId
    }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
