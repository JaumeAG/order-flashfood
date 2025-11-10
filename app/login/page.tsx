"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
// import { loginCentralized } from "@/lib/tenant"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState("");

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Usar el sistema de login centralizado que maneja correctamente las URLs
      const data = fetch('/api/loginuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      // El token ya se guarda en loginCentralized
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || "Credenciales incorrectas")
      setIsLoading(false)
    }
  }

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

      {/* Elementos decorativos animados con colores de marca - Más sutiles en móvil */}
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
              {/* Logo de la marca - Formato horizontal adaptado al SVG */}
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
              
              <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#2E2523' }}>
                ¡Pide, disfruta, cobra en puntos!
              </CardTitle>                      
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base font-semibold block" style={{ color: '#2E2523' }}>
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 sm:h-14 text-base sm:text-lg pl-4 pr-4 border-2 transition-all duration-200"
                      style={{
                        borderColor: '#E0E0E0',
                        backgroundColor: '#F7F3F1',
                        fontSize: '16px' // Previene zoom en iOS
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#E4512F'
                        e.target.style.boxShadow = '0 0 0 3px rgba(228, 81, 47, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E0E0E0'
                        e.target.style.boxShadow = 'none'
                      }}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base font-semibold block" style={{ color: '#2E2523' }}>
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 sm:h-14 text-base sm:text-lg pl-4 pr-16 sm:pr-16 border-2 transition-all duration-200"
                      style={{
                        borderColor: '#E0E0E0',
                        backgroundColor: '#F7F3F1',
                        fontSize: '16px' // Previene zoom en iOS
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#E4512F'
                        e.target.style.boxShadow = '0 0 0 3px rgba(228, 81, 47, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E0E0E0'
                        e.target.style.boxShadow = 'none'
                      }}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent touch-manipulation min-w-[48px]"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6" style={{ color: '#2E2523CC' }} />
                      ) : (
                        <Eye className="h-6 w-6" style={{ color: '#2E2523CC' }} />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 sm:h-14 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation mt-4 sm:mt-5"
                  style={{
                    backgroundColor: '#D64A3A',
                    borderColor: '#D64A3A',
                    color: '#FFFFFF',
                    minHeight: '48px' // Tamaño mínimo táctil recomendado
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D64A3A'
                    e.currentTarget.style.borderColor = '#D64A3A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E4512F'
                    e.currentTarget.style.borderColor = '#E4512F'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>

              <div className="mt-5 sm:mt-6 md:mt-8 text-center">
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#2E2523CC' }}>
                  ¿No tienes cuenta?{" "}
                  <a 
                    href="/register" 
                    className="font-semibold transition-colors duration-200 hover:underline touch-manipulation inline-block py-1"
                    style={{ 
                      color: '#D64A3A', 
                      minHeight: '44px', 
                      lineHeight: '44px',
                      textDecorationColor: '#E4512F'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#D64A3A'
                      e.currentTarget.style.textDecorationColor = '#D64A3A'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#E4512F'
                      e.currentTarget.style.textDecorationColor = '#E4512F'
                    }}
                  >
                    Regístrate aquí
                  </a>
                </p>
              </div>

              {/* Línea decorativa */}
              <div className="mt-4 sm:mt-5 md:mt-6 flex items-center">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #E0E0E0, transparent)' }}></div>
                <span className="px-2 sm:px-3 md:px-4 text-xs font-medium" style={{ color: '#2E2523CC' }}>o</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #E0E0E0, transparent)' }}></div>
              </div>

              {/* Enlaces adicionales */}
              <div className="mt-4 sm:mt-5 md:mt-6 text-center space-y-2">
                <a 
                  href="#" 
                  className="text-xs sm:text-sm transition-colors duration-200 hover:underline touch-manipulation inline-block py-2"
                  style={{ 
                    color: '#D64A3A',
                    textDecorationColor: '#D64A3A',
                    minHeight: '44px' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#D64A3A'
                    e.currentTarget.style.textDecorationColor = '#D64A3A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#E4512F'
                    e.currentTarget.style.textDecorationColor = '#E4512F'
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
                <div className="text-xs sm:text-sm font-medium pt-1" style={{ color: '#2E2523AA' }}>
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
