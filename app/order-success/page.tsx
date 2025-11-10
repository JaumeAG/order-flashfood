"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { getApiHeaders } from "@/lib/tenant"
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Sparkles,
  ArrowLeft,
  Home
} from "lucide-react"

interface OrderData {
  id: number
  referencia: string
  total: number
  estado: string
  mesa_id: number
  mesa_name: string
  created_at: string
  items: Array<{
    id: number
    name: string
    cantidad: number
    precio: number
    observaciones?: string
  }>
}

export default function OrderSuccessPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('pedido')

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('tokenClient')
    setIsAuthenticated(!!token)

    if (pedidoId) {
      const fetchOrderData = async () => {
        try {
          const response = await fetch(`/api/client/pedidos/${pedidoId}`, {
           headers: {},
          })

          if (response.ok) {
            const orderData = await response.json()
            setOrderData(orderData)
            
            // Calcular puntos ganados (1 punto por euro)
            const pointsEarned = Math.floor(Number(orderData.total))
            setPointsEarned(pointsEarned)
          } else {
            console.error('Error cargando datos del pedido:', response.status)
          }
        } catch (error) {
          console.error('Error cargando datos del pedido:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchOrderData()
    } else {
      setLoading(false)
    }
  }, [pedidoId])

  // Cargar puntos del usuario si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserPoints = async () => {
        try {
          const response = await fetch('/api/user/points', {
           headers: {},
          })

          if (response.ok) {
            const data = await response.json()
            setCurrentPoints(data.puntos || 0)
          }
        } catch (error) {
          console.error('Error cargando puntos del usuario:', error)
        }
      }

      fetchUserPoints()
    }
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo encontrar la información del pedido</p>
          <Button onClick={() => router.push('/dashboard')}>
            <Home className="w-4 h-4 mr-2" />
            Volver al menú
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pedido Confirmado</h1>
                <p className="text-sm text-gray-500">Tu pedido ha sido procesado exitosamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Confirmación */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ¡Pedido Confirmado!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Tu pedido ha sido enviado a la cocina y será preparado en breve.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 inline-block">
                    <p className="text-sm text-gray-500">Número de pedido</p>
                    <p className="text-lg font-mono font-bold">{orderData.referencia}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado del pedido */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Estado del Pedido</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Pedido recibido</p>
                        <p className="text-sm text-gray-500">Tu pedido ha sido confirmado</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">En preparación</p>
                        <p className="text-sm text-gray-400">La cocina está preparando tu pedido</p>
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Listo para servir</p>
                        <p className="text-sm text-gray-400">Tu pedido estará listo en breve</p>
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Detalles del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.observaciones && (
                          <p className="text-sm text-gray-500">Obs: {item.observaciones}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{(item.precio * item.cantidad).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">x{item.cantidad}</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>€{Number(orderData.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información de la mesa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Información de Entrega</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mesa:</span>
                    <span className="font-medium">{orderData.mesa_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {orderData.estado}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">
                      {new Date(orderData.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Puntos del usuario */}
            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Puntos de Fidelización</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Puntos actuales */}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-lg font-bold">{currentPoints}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Tienes <strong>{currentPoints} puntos</strong> disponibles
                      </p>
                      <p className="text-xs text-gray-500">
                        Equivalente a €{(currentPoints * 0.02).toFixed(2)} de descuento
                      </p>
                    </div>

                    {/* Puntos ganados en este pedido */}
                    {pointsEarned > 0 && (
                      <>
                        <div className="border-t pt-4">
                          <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-sm font-bold">+{pointsEarned}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Ganaste <strong>{pointsEarned} puntos</strong> con este pedido
                            </p>
                            <p className="text-xs text-gray-500">
                              Equivalente a €{(pointsEarned * 0.02).toFixed(2)} de descuento futuro
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Puntos ganados para usuarios no autenticados */}
            {!isAuthenticated && pointsEarned > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Puntos Perdidos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-lg font-bold">{pointsEarned}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Perdiste <strong>{pointsEarned} puntos</strong> por no estar registrado
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Equivalente a €{(pointsEarned * 0.02).toFixed(2)} de descuento
                    </p>
                    <Button
                      onClick={() => router.push('/register')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                    >
                      Registrarse para ganar puntos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al Menú
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Hacer Otro Pedido
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
