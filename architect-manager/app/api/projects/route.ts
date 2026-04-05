import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAProject, getLocalMySQLDateTime } from '@/models/GPA_project'

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

    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '0', 10)
    const search = (searchParams.get('search') || '').trim()
    const orderByParam = searchParams.get('orderBy') || 'PRJ_case_number'
    const orderDirParam = (searchParams.get('orderDir') || 'DESC').toUpperCase()

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 0 ? 0 : limitParam
    const hasPagination = searchParams.has('page') || searchParams.has('limit')

    const orderByMap: Record<string, string> = {
      PRJ_id: 'p.PRJ_id',
      PRJ_case_number: 'p.PRJ_case_number',
      PRJ_entry_date: 'p.PRJ_entry_date',
      PRJ_start_construction_date: 'p.PRJ_start_construction_date',
      PRJ_completion_date: 'p.PRJ_completion_date',
      PRJ_state: 'p.PRJ_state',
      client_name: 'c.CLI_name',
      type_name: 't.TYP_name'
    }
    const orderBy = orderByMap[orderByParam] ? orderByParam : 'PRJ_case_number'
    const orderBySql = orderByMap[orderBy]
    const orderDir = orderDirParam === 'ASC' ? 'ASC' : 'DESC'

    const filterParams: (string | number)[] = []
    let whereClause = ''
    if (search) {
      const likeSearch = `%${search}%`
      whereClause = `
        WHERE (
          p.PRJ_case_number LIKE ?
          OR p.PRJ_state LIKE ?
          OR c.CLI_name LIKE ?
          OR c.CLI_f_lastname LIKE ?
          OR c.CLI_s_lastname LIKE ?
          OR c.CLI_identification LIKE ?
          OR t.TYP_name LIKE ?
        )
      `
      filterParams.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch)
    }

    const totalResult = await executeQuery(
      `SELECT COUNT(p.PRJ_id) as totalProjects
      FROM gpa_projects p
      LEFT JOIN gpa_clients c ON c.CLI_id = p.PRJ_client_id
      LEFT JOIN gpa_types t ON t.TYP_id = p.PRJ_type_id
      ${whereClause}`,
      filterParams
    ) as any[]

    const totalProjects = Number(totalResult[0]?.totalProjects || 0)
    const effectiveLimit = hasPagination && limit > 0 ? limit : totalProjects || 1
    const totalPages = effectiveLimit > 0 ? Math.ceil(totalProjects / effectiveLimit) : 0
    const offset = (page - 1) * effectiveLimit

    const paginationSql = hasPagination && limit > 0 ? 'LIMIT ?, ?' : ''
    const queryParams = hasPagination && limit > 0
      ? [...filterParams, offset, effectiveLimit]
      : filterParams

    const rawProjects = await executeQuery(
      `SELECT
        p.*,
        c.CLI_name,
        c.CLI_f_lastname,
        c.CLI_s_lastname,
        c.CLI_identification,
        t.TYP_id,
        t.TYP_name
      FROM gpa_projects p
      LEFT JOIN gpa_clients c ON c.CLI_id = p.PRJ_client_id
      LEFT JOIN gpa_types t ON t.TYP_id = p.PRJ_type_id
      ${whereClause}
      ORDER BY ${orderBySql} ${orderDir}
      ${paginationSql}`,
      queryParams
    ) as any[]

    const projects = rawProjects.map((project) => {
      const parsedProject = project as GPAProject & {
        CLI_name?: string
        CLI_f_lastname?: string
        CLI_s_lastname?: string
        CLI_identification?: string
        TYP_id?: number
        TYP_name?: string
      }

      const fullName = [parsedProject.CLI_name, parsedProject.CLI_f_lastname, parsedProject.CLI_s_lastname]
        .filter(Boolean)
        .join(' ')
        .trim()

      return {
        ...parsedProject,
        client_name: fullName || undefined,
        client_identification: parsedProject.CLI_identification,
        type: parsedProject.TYP_id
          ? { TYP_id: parsedProject.TYP_id, TYP_name: parsedProject.TYP_name || '' }
          : undefined
      } as GPAProject
    })

    const projectIds = projects
      .map((project) => project.PRJ_id)
      .filter((id): id is number => typeof id === 'number')

    if (projectIds.length > 0) {
      const placeholders = projectIds.map(() => '?').join(',')
      const categoriesRows = await executeQuery(
        `SELECT
          pc.PRJ_id,
          c.CAT_name
        FROM gpa_projectsxgpa_categories pc
        INNER JOIN gpa_categories c ON c.CAT_id = pc.CAT_id
        WHERE pc.PRJ_id IN (${placeholders})`,
        projectIds
      ) as Array<{ PRJ_id: number; CAT_name: string }>

      const categoriesByProject = categoriesRows.reduce<Record<number, string[]>>((accumulator, row) => {
        if (!accumulator[row.PRJ_id]) {
          accumulator[row.PRJ_id] = []
        }
        accumulator[row.PRJ_id].push(row.CAT_name)
        return accumulator
      }, {})

      projects.forEach((project) => {
        if (project.PRJ_id) {
          project.categories_names = categoriesByProject[project.PRJ_id] || []
        }
      })
    }

    if (!includeRelated) {
      return NextResponse.json({
        projects,
        page,
        limit: effectiveLimit,
        totalProjects,
        totalPages,
        orderBy,
        orderDir
      }, { status: 200 })
    }

    const projectsWithRelatedData = await Promise.all(
      projects.map(async (project) => {
        if (project.PRJ_id) {
          const relatedData = await fetchProjectRelatedData(project.PRJ_id, request)
          return {
            ...project,
            ...relatedData
          }
        }
        return project
      })
    )
    return NextResponse.json({
      projects: projectsWithRelatedData,
      page,
      limit: effectiveLimit,
      totalProjects,
      totalPages,
      orderBy,
      orderDir
    }, { status: 200 })

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
