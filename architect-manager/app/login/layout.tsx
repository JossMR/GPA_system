import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { GoogleOAuthProvider } from "@react-oauth/google"; 
import { UserProvider } from "@/context/UserContext";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <GoogleOAuthProvider clientId={clientId}>
      {children}
      <Toaster />
    </GoogleOAuthProvider>
    </>
  )
}
