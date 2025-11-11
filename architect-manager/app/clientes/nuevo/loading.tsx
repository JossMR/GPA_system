export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary-lighter/5 via-background to-primary-light/5">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#486b00] mx-auto" />
        <p className="text-muted-foreground text-lg font-medium">Preparando formulario...</p>
      </div>
    </div>
  )
}
