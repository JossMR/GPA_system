import Link from "next/link"
import { Heart, Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-gray-100 dark:bg-muted/30 backdrop-blur-sm">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">GA</span>
              </div>
              <div>
                <div className="font-bold text-lg bg-gradient-to-r from-primary-dark to-primary-medium bg-clip-text text-transparent">
                  Gestor Arquitectónico
                </div>
                <div className="text-xs text-muted-foreground">Proyectos Profesionales</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma moderna para la gestión profesional de proyectos arquitectónicos, 
              clientes y pagos.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary-dark">Enlaces Rápidos</h3>
            <div className="space-y-2">
              <Link href="/clientes" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Clientes
              </Link>
              <Link href="/proyectos" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Proyectos
              </Link>
              <Link href="/pagos" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Pagos
              </Link>
              <Link href="/reportes" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Reportes
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© 2025 Gestor de Proyectos Arquitectónicos.</span>
            <span>Todos los derechos reservados.</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Hecho</span>
              <span>en Costa Rica</span>
            </div>
            <div className="h-4 w-px bg-border/40"></div>
            <span className="text-sm text-muted-foreground">Versión 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
