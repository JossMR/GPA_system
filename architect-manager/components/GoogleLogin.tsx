"use client"

//import { useUser } from "@/context/UserContext"
import { GoogleLogin } from "@react-oauth/google"
import { useState, useEffect } from "react"
import { User, useAuth } from "@/components/auth-provider";
interface GoogleLoginButtonProps {
  onSuccessRedirect: () => void
  setLoading: (value: boolean) => void
}

export default function GoogleLoginButton({ onSuccessRedirect, setLoading }: GoogleLoginButtonProps) {
  //const { setUser } = useUser()
  const [error, setError] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string>("")
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
    setError(null)
    console.log(credentialResponse)
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
      console.log(data)
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
        return
      }
      console.log(data.message)
      // Authentication successful, update user context
      const user: User = {
        id: data.user.id,
        active: data.user.active === 1,
        name: data.user.name,
        flastname: data.user.flastname,
        slastname: data.user.slastname,
        picture: data.user.picture,
        roleid: data.user.roleid,
        email: data.user.email
      }
      login(user);
      // Redirect to the success page
      onSuccessRedirect()
    } catch (error) {
      console.error("Error during Google authentication:", error)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center">
      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

      <GoogleLogin
        onSuccess={handleLogin}
        onError={() => {
          setError("Failed to authenticate with Google. Please try again.")
          setLoading(false)
        }}
        useOneTap
        size="large"
        width={300}
      />
    </div>
  )
}
