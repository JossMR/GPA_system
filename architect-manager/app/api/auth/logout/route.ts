import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get("session_token")?.value
    try {
        if (!sessionToken) throw new Error("No session token")
        verify(sessionToken, process.env.JWT_SECRET || "supersecret")
    } catch (error) {

    }
    const response = NextResponse.json({ message: "Logout successful" })

    response.cookies.set({
        name: "session_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
    })

    return response
}