"use client"

//import { useUser } from "@/context/UserContext"
import { GoogleLogin } from "@react-oauth/google"
import { useState, useEffect } from "react"
import { User, useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { permission } from "process"

interface GoogleLoginButtonProps {
  onSuccessRedirect: () => void
  setLoading: (value: boolean) => void
}

export default function GoogleLoginButton({ onSuccessRedirect, setLoading }: GoogleLoginButtonProps) {
  //const { setUser } = useUser()
  const [error, setError] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  // Generate CSRF token on component mount
  useEffect(() => {
    // Generate a random string for CSRF token
    const token = Math.random().toString(36).substring(2, 15)

    // Set the CSRF token in a cookie
    document.cookie = `g_csrf_token=${token}; path=/; SameSite=Strict; ${window.location.protocol === "https:" ? "Secure;" : ""
      }`
    setCsrfToken(token)
  }, [])

  const handleLogin = async (credentialResponse: any) => {
    setLoading(true)
    setIsLoading(true)
    setError(null)
    try {
      // Send the Google credential to our backend for verification
      // Include the CSRF token in the request body
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          g_csrf_token: csrfToken,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        // Handle different error scenarios
        if (response.status === 401 && data.needsRegistration) {
          setError("Your account is not registered in the system.")
        } else if (response.status === 403) {
          setError("Your account is inactive. Please contact an administrator.")
        } else {
          setError(data.error || "Failed to authenticate with Google")
        }
        setLoading(false)
        setIsLoading(false)
        return
      }
      // Update last access date
    try {
      const response2 =await fetch("/api/auth/login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          USR_id: data.user.id,
        }),
      })
      if (!response2.ok) {
        throw new Error("Error updating last access date");
      }
    } catch (error) {
    console.error("API error:", error);
    }

      // Authentication successful, update user context
      const user: User = {
        id: data.user.id,
        active: data.user.active === 1,
        name: data.user.name,
        flastname: data.user.flastname,
        slastname: data.user.slastname,
        picture: data.user.picture,
        roleid: data.user.roleid,
        email: data.user.email,
        permissions: data.user.permissions
      }
      login(user);
      // Redirect to the success page
      onSuccessRedirect()
    } catch (error) {
      console.error("Error during Google authentication:", error)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      {isLoading ? (
        <div className="flex items-center justify-center bg-white border border-gray-300 rounded px-6 py-3 shadow-sm" style={{ width: '300px', height: '50px' }}>
          <Loader2 className="h-5 w-5 animate-spin text-[#486b00] mr-2" />
          <span className="text-sm font-medium text-gray-700">Iniciando sesión...</span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleLogin}
          onError={() => {
            setError("Failed to authenticate with Google. Please try again.")
            setLoading(false)
            setIsLoading(false)
          }}
          useOneTap
          size="large"
          width={300}
        />
      )}
    </div>
  )
}
