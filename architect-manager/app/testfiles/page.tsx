"use client"

import { MainLayout } from "@/components/main-layout"
import { useEffect, useState } from "react";
import { GPAProject } from "@/models/GPA_project";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";

export default function test() {
    const [Projects, setProjects] = useState<GPAProject[]>([])
    useEffect(() => {
        const fetchProjects = async()=>{
            const response = await fetch("api/projects")
            const data = await response.json()
            console.log("gola")
            const projects: GPAProject[] = data.projects
            console.log(projects)
            setProjects(projects)
        }
        fetchProjects()
    },[])

    return (
        <MainLayout>
            <div>
                hola
                <Select>
                    {Projects.map((project, index)=>(
                    <SelectContent>
                        {project.PRJ_id}
                    </SelectContent>
                    ))}
                </Select>
            </div>
        </MainLayout>
    );
}