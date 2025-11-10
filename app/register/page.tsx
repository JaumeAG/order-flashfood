"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errormail, setErrorMail] = useState("")
  const [errorcontra, setErrorContra] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      setErrorContra("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/registeruser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          password_confirmation: confirmPassword, 
          name: nombre, 
          surnames: apellidos,
          fecha_nacimiento: fechaNacimiento
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }

      const data = await response.json()

      localStorage.setItem('token', data.access_token)
      router.push('/userregistered')
    } catch (error: any) {
      try {
        const responseBody = JSON.parse(error.message);

        if (responseBody.errors) {
          setErrorMail("")
          setErrorContra("")

          if (responseBody.errors.email) {
            setErrorMail(responseBody.errors.email[0])
          }

          if (responseBody.errors.password) {
            setErrorContra(responseBody.errors.password[0])
          }

          return
        }
      } catch {
        setErrorMail(error.message)
        setErrorContra(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    toast.info("Registro con Google próximamente disponible")
  }

  const handleFacebookRegister = () => {
    toast.info("Registro con Facebook próximamente disponible")
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
          <Card className="shadow-2xl border-0 backdrop-blur-sm relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>

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
              
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#2E2523' }}>
                ¡Hola!
              </CardTitle>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6" style={{ color: '#2E2523CC' }}>
                Selecciona una de estas opciones
              </p>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
              {/* Botones de registro social */}
              <div className="space-y-3 sm:space-y-4">
                {/* Botón Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg border-2 transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  style={{
                    borderColor: '#E0E0E0',
                    backgroundColor: '#FFFFFF',
                    color: '#2E2523'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E4512F'
                    e.currentTarget.style.backgroundColor = '#F7F3F1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                  }}
                  onClick={handleGoogleRegister}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </Button>

                {/* Botón Facebook */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg border-2 transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  style={{
                    borderColor: '#E0E0E0',
                    backgroundColor: '#FFFFFF',
                    color: '#2E2523'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E4512F'
                    e.currentTarget.style.backgroundColor = '#F7F3F1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                  }}
                  onClick={handleFacebookRegister}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </Button>

                {/* Botón Email */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg border-2 transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  style={{
                    borderColor: '#E0E0E0',
                    backgroundColor: '#FFFFFF',
                    color: '#2E2523'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E4512F'
                    e.currentTarget.style.backgroundColor = '#F7F3F1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                  }}
                  onClick={() => setShowEmailDialog(true)}
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#2E2523' }} />
                  <span>E-mail</span>
                </Button>
              </div>

              {/* Footer - Términos y condiciones */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#2E2523CC' }}>
                  Al crear una cuenta, aceptas automáticamente nuestras{" "}
                  <a 
                    href="/terminos" 
                    className="font-semibold hover:underline touch-manipulation"
                    style={{ color: '#D64A3A' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E4512F'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D64A3A'
                    }}
                  >
                    Condiciones de servicio
                  </a>
                  {", "}
                  <a 
                    href="/privacidad" 
                    className="font-semibold hover:underline touch-manipulation"
                    style={{ color: '#D64A3A' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E4512F'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D64A3A'
                    }}
                  >
                    Política de privacidad
                  </a>
                  {" y "}
                  <a 
                    href="/cookies" 
                    className="font-semibold hover:underline touch-manipulation"
                    style={{ color: '#D64A3A' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E4512F'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D64A3A'
                    }}
                  >
                    Política de cookies
                  </a>
                </p>
              </div>

              {/* Enlace a login */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-sm sm:text-base" style={{ color: '#2E2523CC' }}>
                  ¿Ya tienes cuenta?{" "}
                  <a 
                    href="/login" 
                    className="font-semibold transition-colors duration-200 hover:underline touch-manipulation"
                    style={{ color: '#D64A3A' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E4512F'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D64A3A'
                    }}
                  >
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para registro con Email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold" style={{ color: '#2E2523' }}>
              Registro con E-mail
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base" style={{ color: '#2E2523CC' }}>
              Completa el formulario para crear tu cuenta
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm sm:text-base font-semibold" style={{ color: '#2E2523' }}>
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Adrián"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                  className="h-12 sm:h-14 text-base border-2 transition-all duration-200"
                  style={{
                    borderColor: '#E0E0E0',
                    backgroundColor: '#F7F3F1',
                    fontSize: '16px'
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
                    />
                  </div>
                  <div className="space-y-2">
                <Label htmlFor="apellidos" className="text-sm sm:text-base font-semibold" style={{ color: '#2E2523' }}>
                      Apellidos
                    </Label>
                    <Input
                      id="apellidos"
                      type="text"
                      placeholder="García Martínez"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                  className="h-12 sm:h-14 text-base border-2 transition-all duration-200"
                  style={{
                    borderColor: '#E0E0E0',
                    backgroundColor: '#F7F3F1',
                    fontSize: '16px'
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base font-semibold" style={{ color: '#2E2523' }}>
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                className="h-12 sm:h-14 text-base border-2 transition-all duration-200"
                style={{
                  borderColor: '#E0E0E0',
                  backgroundColor: '#F7F3F1',
                  fontSize: '16px'
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
              {errormail && <p className="text-sm mt-1" style={{ color: '#D64A3A' }}>{errormail}</p>}
                </div>

                <div className="space-y-2">
              <Label htmlFor="fechaNacimiento" className="text-sm sm:text-base font-semibold" style={{ color: '#2E2523' }}>
                Fecha de nacimiento
                  </Label>
                  <Input
                id="fechaNacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="h-12 sm:h-14 text-base border-2 transition-all duration-200"
                style={{
                  borderColor: '#E0E0E0',
                  backgroundColor: '#F7F3F1',
                  fontSize: '16px',
                  color: fechaNacimiento ? '#2E2523' : '#2E2523CC'
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
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  />
                </div>

                  <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base font-semibold" style={{ color: '#2E2523' }}>
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                  className="h-12 sm:h-14 text-base pl-4 pr-14 sm:pr-16 border-2 transition-all duration-200"
                  style={{
                    borderColor: '#E0E0E0',
                    backgroundColor: '#F7F3F1',
                    fontSize: '16px'
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
                  autoComplete="new-password"
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
              {errorcontra && <p className="text-sm mt-1" style={{ color: '#D64A3A' }}>{errorcontra}</p>}
                  </div>

                  <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-semibold" style={{ color: '#2E2523' }}>
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 sm:h-14 text-base border-2 transition-all duration-200"
                style={{
                  borderColor: '#E0E0E0',
                  backgroundColor: '#F7F3F1',
                  fontSize: '16px'
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
                autoComplete="new-password"
                    />
                </div>

                <Button
                  type="submit"
              className="w-full h-14 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation mt-4"
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cuenta...</span>
                    </div>
                  ) : (
                "Crear cuenta"
                  )}
                </Button>
              </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}                   
