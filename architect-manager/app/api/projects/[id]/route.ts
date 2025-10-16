import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAProject } from '@/models/GPA_project'
import { GPAClient } from '@/models/GPA_client'
import { GPAcategory } from '@/models/GPA_category'
import { GPAPayment } from '@/models/GPA_payment'
import { GPAAddition } from '@/models/GPA_addition'

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
    const typeRes = await fetch(`${new URL(request.url).origin}/api/types/${project.PRJ_type_id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const typeData = typeRes.ok ? await typeRes.json() : null;
    project.type = typeData;

    const clientRes = await fetch(`${new URL(request.url).origin}/api/clients/${project?.PRJ_client_id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const clientJson = clientRes.ok ? await clientRes.json() : null;
    const clientData = clientJson ? clientJson.client as GPAClient : null;
    project.client_name = clientData?.CLI_name + " " + clientData?.CLI_f_lastname + " " + clientData?.CLI_s_lastname;

    project.client_identification = clientData?.CLI_identification;

    const categoriesRes = await fetch(`${new URL(request.url).origin}/api/categories?project_id=${project.PRJ_id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() as GPAcategory[] : null;
    project.categories_names = []
    categoriesData?.forEach((category, index) => { project.categories_names?.push(category.CAT_name) })

    project.categories = []
    categoriesData?.forEach((category, index) => { project.categories?.push(category) })

    if (includeRelated) {
      // Get all related data using main API endpoints
      const relatedData = await fetchProjectRelatedData(projectId, request)
      project = {
        ...project,
        ...relatedData
      }
    }

    return NextResponse.json({ project }, { status: 200 })

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
    let {
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2,
      PRJ_additional_directions,
      PRJ_budget,
      PRJ_entry_date,
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
    const projectPayments = await fetch(`${new URL(request.url).origin}/api/payments?project_id=${projectId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const paymentsData = projectPayments.ok ? await projectPayments.json() as GPAPayment[] : [];
    const totalPaid = paymentsData.reduce((sum, payment) => sum + (Number(payment.PAY_amount_paid) || 0), 0);

    const projectAdditions = await fetch(`${new URL(request.url).origin}/api/additions?project_id=${projectId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const additionsData = projectAdditions.ok ? await projectAdditions.json() as GPAAddition[] : [];
    const totalAdditions = additionsData.reduce((sum, addition) => sum + (Number(addition.ATN_cost) || 0), 0);

    const normalizeDate = (date: string | null | undefined) => {
      if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
      }
      return date;
    };

    PRJ_entry_date = normalizeDate(PRJ_entry_date);
    PRJ_completion_date = normalizeDate(PRJ_completion_date);
    PRJ_logbook_close_date = normalizeDate(PRJ_logbook_close_date);
    PRJ_start_construction_date = normalizeDate(PRJ_start_construction_date);
    
    PRJ_remaining_amount = (PRJ_budget || 0) + totalAdditions - totalPaid;
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
        PRJ_type_id = ?,
        PRJ_state = ?,
        PRJ_final_price = ?,
        PRJ_notes = ?,
        PRJ_province = ?,
        PRJ_canton = ?,
        PRJ_district = ?,
        PRJ_neighborhood = ?,
        PRJ_start_construction_date = ?,
        PRJ_remaining_amount = ?
      WHERE PRJ_id = ?
    `

    await executeQuery(updateQuery, [
      PRJ_client_id,
      PRJ_case_number,
      PRJ_area_m2?.toString() || null,
      PRJ_additional_directions || null,
      PRJ_budget?.toString() || null,
      PRJ_entry_date.toString() || null,
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
      PRJ_remaining_amount?.toString() || null,
      projectId
    ])
    const projectCategories = await fetch(`${new URL(request.url).origin}/api/categories?project_id=${projectId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const categoriesData = projectCategories.ok ? await projectCategories.json() as GPAcategory[] : [];

    const existingCategoryIds: number[] = categoriesData
      ? categoriesData.map((cat: GPAcategory) => cat.CAT_id).filter((id): id is number => id !== undefined)
      : [];
    const newCategoryIds: number[] = categories ? categories.map((cat: GPAcategory) => cat.CAT_id) : [];

    const categoriesToAdd = newCategoryIds
      ? newCategoryIds.filter(cat => !existingCategoryIds.includes(cat))
      : [];

    const categoriesToRemove = existingCategoryIds
      ? existingCategoryIds.filter(cat => !newCategoryIds.includes(cat))
      : [];

    for (const catId of categoriesToAdd) {
      await executeQuery(
        `INSERT INTO GPA_ProjectsXGPA_Categories (PRJ_id, CAT_id) VALUES (?, ?)`,
        [projectId, catId]
      );
    }

    for (const catId of categoriesToRemove) {
      await executeQuery(
        `DELETE FROM GPA_ProjectsXGPA_Categories WHERE PRJ_id = ? AND CAT_id = ?`,
        [projectId, catId]
      );
    }
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
