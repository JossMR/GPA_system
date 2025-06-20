export function Footer() {
  return (
    <footer className="border-t border-[#a2c523]/20 gradient-accent">
      <div className="container flex items-center justify-between py-6">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-white font-bold text-xs">GA</span>
          </div>
          <span className="text-sm text-white/80">© 2025 Gestor de Proyectos Arquitectónicos</span>
        </div>
        <div className="flex items-center space-x-4 text-white/60 text-sm">
          <span>Versión 1.0</span>
          <span>•</span>
          <span>Hecho con ❤️</span>
        </div>
      </div>
    </footer>
  )
}
