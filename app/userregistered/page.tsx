"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Mail } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserRegisteredPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al login después de 5 segundos (opcional)
    // const timer = setTimeout(() => {
    //   router.push('/login')
    // }, 5000)
    // return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F7F3F1' }}>
      {/* Fondo con gradiente suave */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #F7F3F1 0%, rgba(228, 81, 47, 0.05) 50%, #F7F3F1 100%)'
      }}></div>
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E4512F' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Elementos decorativos animados - Ocultos en móvil */}
      <div 
        className="hidden sm:block absolute top-10 left-10 w-40 h-40 md:w-48 md:h-48 rounded-full blur-2xl animate-pulse" 
        style={{ backgroundColor: 'rgba(228, 81, 47, 0.2)' }}
      ></div>
      <div 
        className="hidden sm:block absolute top-32 right-20 w-56 h-56 md:w-64 md:h-64 rounded-full blur-3xl animate-pulse" 
        style={{ 
          backgroundColor: 'rgba(214, 74, 58, 0.2)',
          animationDelay: '1s',
          animationDuration: '4s'
        }}
      ></div>
      <div 
        className="hidden sm:block absolute bottom-20 left-1/4 w-36 h-36 md:w-44 md:h-44 rounded-full blur-2xl animate-pulse" 
        style={{ 
          backgroundColor: 'rgba(228, 81, 47, 0.15)',
          animationDelay: '2s',
          animationDuration: '4s'
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-md px-2 sm:px-0">
          <Card className="shadow-2xl border-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <CardHeader className="text-center pb-4 sm:pb-6 md:pb-8 pt-5 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
              {/* Logo de la marca */}
              <div className="mx-auto mb-3 sm:mb-4 md:mb-5 flex items-center justify-center">
                <div className="relative w-64 h-32 sm:w-80 sm:h-40 md:w-96 md:h-48 lg:w-[28rem] lg:h-56" style={{ aspectRatio: '2/1' }}>
                  <Image 
                    src="/branding/Light-Background.svg" 
                    alt="FlashFood Logo" 
                    fill
                    className="object-contain drop-shadow-lg"
                    priority
                  />
                </div>
              </div>
              
              {/* Icono de éxito */}
              <div className="mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)' }}>
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#D64A3A' }} />
                </div>
              </div>

              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#2E2523' }}>
                ¡Cuenta creada exitosamente!
              </CardTitle>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6" style={{ color: '#2E2523CC' }}>
                Tu cuenta ha sido registrada correctamente
              </p>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Mensaje principal */}
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm sm:text-base" style={{ color: '#2E2523CC' }}>
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#D64A3A' }} />
                    <span>Ya puedes iniciar sesión con tu cuenta</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#2E2523AA' }}>
                    Inicia sesión para comenzar a disfrutar de todos los beneficios de FlashFood
                  </p>
                </div>

                {/* Botón para ir al login */}
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full h-14 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                  style={{
                    backgroundColor: '#D64A3A',
                    borderColor: '#D64A3A',
                    color: '#FFFFFF',
                    minHeight: '48px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E4512F'
                    e.currentTarget.style.borderColor = '#E4512F'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#D64A3A'
                    e.currentTarget.style.borderColor = '#D64A3A'
                  }}
                >
                  Iniciar sesión
                </Button>

                {/* Enlace alternativo */}
                <div className="text-center">
                  <p className="text-sm sm:text-base" style={{ color: '#2E2523CC' }}>
                    ¿Necesitas ayuda?{" "}
                    <a 
                      href="/" 
                      className="font-semibold transition-colors duration-200 hover:underline touch-manipulation"
                      style={{ color: '#D64A3A' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#E4512F'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#D64A3A'
                      }}
                    >
                      Volver al inicio
                    </a>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 sm:mt-8 text-center">
                <div className="text-xs sm:text-sm font-medium" style={{ color: '#2E2523AA' }}>
                  Powered by <span className="font-semibold" style={{ color: '#D64A3A' }}>FlashFood</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
