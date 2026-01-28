import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
//import { User } from "@/models"
import { OAuth2Client } from "google-auth-library"
import { executeQuery } from "@/lib/database"
import { useReducer } from "react"
//import { connectToDatabase } from "@/lib/connectToDatabase"

// JWT secret from environment variable
const SECRET = process.env.JWT_SECRET || "supersecret"

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "")

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    //await connectToDatabase()


    // Get request body
    const body = await request.json()
    const { credential, g_csrf_token } = body

    // 1. CSRF Protection - Check for CSRF token in cookie and request body
    const csrfTokenCookie = request.cookies.get("g_csrf_token")?.value

    if (!csrfTokenCookie) {
      return NextResponse.json({ error: "No CSRF token in Cookie" }, { status: 400 })
    }

    if (!g_csrf_token) {
      return NextResponse.json({ error: "No CSRF token in request body" }, { status: 400 })
    }

    if (csrfTokenCookie !== g_csrf_token) {
      return NextResponse.json({ error: "Failed to verify double submit cookie" }, { status: 400 })
    }

    // Check if token is provided
    if (!credential) {
      return NextResponse.json({ error: "Google credential is required" }, { status: 400 })
    }

    // 2. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 })
    }

    const { sub, email, email_verified, name, picture, hd } = payload

    // 3. Optional: Domain verification for Google Workspace accounts
    // If you want to restrict to specific domains, uncomment this
    /*
    const allowedDomains = ['yourdomain.com', 'anotherdomain.com']
    if (!hd || !allowedDomains.includes(hd)) {
      return NextResponse.json({
        error: "Only specific domain accounts are allowed"
      }, { status: 403 })
    }
    */

    // 4. Check if email is verified by Google
    if (!email_verified) {
      return NextResponse.json(
        {
          error: "Email not verified by Google",
        },
        { status: 400 },
      )
    }

    // 5. Check if user exists in our database - using sub as unique identifier
    let users = await executeQuery(
      `SELECT 
    gpa_u.*,
    gpa_r.*,
    GROUP_CONCAT(
      CONCAT(gpa_s.SCN_name, ':', gpa_pt.PTY_name) 
      SEPARATOR '|'
    ) as permissions_data
  FROM gpa_users gpa_u 
  JOIN GPA_Roles gpa_r ON gpa_u.USR_role_id = gpa_r.ROL_id 
  LEFT JOIN GPA_PermissionXGPA_Roles gpa_pxr ON gpa_r.ROL_id = gpa_pxr.ROL_id
  LEFT JOIN GPA_Permission gpa_p ON gpa_pxr.PSN_id = gpa_p.PSN_id
  LEFT JOIN GPA_Screen gpa_s ON gpa_p.SCN_id = gpa_s.SCN_id
  LEFT JOIN GPA_Permission_type gpa_pt ON gpa_p.PTY_id = gpa_pt.PTY_id
  WHERE gpa_u.USR_email = ? 
  GROUP BY gpa_u.USR_id
  LIMIT 1`,
      [email]
    );

    let user = users[0];

    // Convertir la cadena de permisos en un array de objetos
    if (user && user.permissions_data) {
      user.permissions = user.permissions_data
        .split('|')
        .map((perm: string) => {
          const [screen, permission_type] = perm.split(':');
          return { screen, permission_type };
        })
        .filter((p: any) => p.screen && p.permission_type);
      delete user.permissions_data; // Limpiar el campo temporal
    } else if (user) {
      user.permissions = [];
    }
    console.log(user);
    /*
    // If user exists with email but not googleId, update the user
    if (!user && email) {
      user = await User.findOne({ email })
      if (user) {
        // Update existing user with Google ID
        user.googleId = sub
        await user.save()
      }
    }
    */
    if (!user || user.length === 0) {
      return NextResponse.json(
        {
          error: "User not registered in the system",
          needsRegistration: true
        },
        { status: 401 },
      )
    }
    if (user.USR_active === 0) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    // Update user's last login
    //user.lastLogin = new Date()
    //await user.save()

    // Create JWT token
    const jwtToken = jwt.sign(
      {
        id: user.USR_id,
        email: user.USR_email,
        name: user.USR_name,
        flastname: user.USR_f_lastname,
        slastname: user.USR_s_lastname,
        active: user.USR_active,
        roleid: user.USR_role_id
      },
      SECRET,
      { expiresIn: "1d" },
    )

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.USR_id,
        email: user.USR_email,
        name: user.USR_name,
        flastname: user.USR_f_lastname,
        slastname: user.USR_s_lastname,
        active: user.USR_active,
        roleid: user.USR_role_id,
        picture: payload?.picture,
      },
    })

    // Set cookie directly on the response
    response.cookies.set({
      name: "session_token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Google login error:", error)
    return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 })
  }
}
