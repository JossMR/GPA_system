import { executeQuery } from '@/lib/database';
import { GPAProject } from '@/models/GPA_project';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    
    const projects: GPAProject[] = await executeQuery(
      `SELECT 
        PRJ_id,
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
      FROM gpa_projects 
      WHERE PRJ_client_id = ?
      ORDER BY PRJ_entry_date DESC`,
      [clientId]
    );
    
    return NextResponse.json({
      message: "Projects retrieved successfully",
      projects
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Server Error: Error fetching projects" },
      { status: 500 }
    );
  }
}