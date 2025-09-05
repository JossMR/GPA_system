import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    try { 
        
    } catch (error) {
        console.error("Google login error:", error)
        return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 })
    }
}