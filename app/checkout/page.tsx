"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getApiHeaders, getApiUrl } from "@/lib/tenant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Plus,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  User,
  MapPin,
  Clock
} from "lucide-react"
import Image from "next/image"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  observaciones?: string
  image?: string
}

interface SavedCard {
  id: number
  last_four_digits: string
  brand: string
  expiry_month: number
  expiry_year: number
  is_default: boolean
}

interface LoyaltyConfig {
  valor_por_euro: number
  valor_euro_por_punto: number
  puntos_canje: number
  descuento_canje: number
  activo: boolean
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>({
    valor_por_euro: 1.0,
    valor_euro_por_punto: 0.02,
    puntos_canje: 50,
    descuento_canje: 5.0,
    activo: true
  })
  const [currentPoints, setCurrentPoints] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showNewCard, setShowNewCard] = useState(false)
  const [loadingCards, setLoadingCards] = useState(false)
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [mesaInfo, setMesaInfo] = useState<{ id: number, name: string } | null>(null)
  const router = useRouter()

  // Cargar datos del carrito y configuración
  useEffect(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('cart')
    console.log('Carrito desde localStorage:', savedCart)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log('Carrito parseado:', parsedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error('Error parseando carrito:', error)
        localStorage.removeItem('cart')
      }
    }

    // Cargar información de mesa
    const mesaId = localStorage.getItem('selectedMesa')
    console.log('Mesa ID desde localStorage:', mesaId)

    if (mesaId) {
      // Cargar nombre de la mesa desde la API
      const fetchMesaName = async () => {
        try {
          const response = await fetch(`/api/public/mesas/${mesaId}`, {
            headers: getApiHeaders(),
          })

          if (response.ok) {
            const mesaData = await response.json()
            setMesaInfo({
              id: parseInt(mesaId),
              name: mesaData.name
            })
            // Guardar el nombre en localStorage para futuras referencias
            localStorage.setItem('nameMesa', mesaData.name)
          } else {
            console.error('Error cargando nombre de mesa')
            setMesaInfo({
              id: parseInt(mesaId),
              name: `Mesa ${mesaId}`
            })
          }
        } catch (error) {
          console.error('Error cargando nombre de mesa:', error)
          setMesaInfo({
            id: parseInt(mesaId),
            name: `Mesa ${mesaId}`
          })
        }
      }

      fetchMesaName()
    } else {
      console.error('No se encontró mesa en localStorage')
      // Redirigir al dashboard si no hay mesa
      router.push('/dashboard')
    }

    // Verificar autenticación
    const token = localStorage.getItem('tokenClient')
    setIsAuthenticated(!!token)

    // Cargar configuración de fidelización
    const fetchLoyaltyConfig = async () => {
      try {
        const response = await fetch('/api/fidelizacion', {
          headers: getApiHeaders(),
        })

        if (response.ok) {
          const config = await response.json()
          setLoyaltyConfig(config)
        }
      } catch (error) {
        console.error('Error cargando configuración de fidelización:', error)
      }
    }

    fetchLoyaltyConfig()

    // Cargar puntos del usuario si está autenticado
    if (token) {
      const fetchUserPoints = async () => {
        try {
          const response = await fetch('/api/user/points', {
            headers: getApiHeaders(),
          })

          if (response.ok) {
            const data = await response.json()
            console.log('Puntos del usuario:', data)
            setCurrentPoints(data.puntos)
          }
        } catch (error) {
          console.error('Error cargando puntos del usuario:', error)
        }
      }

      fetchUserPoints()
    }
  }, [])

  // Cargar tarjetas guardadas si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const fetchSavedCards = async () => {
        setLoadingCards(true)
        try {
          const response = await fetch('/api/user/payment-cards', {
            headers: getApiHeaders(),
          })

          if (response.ok) {
            const responseData = await response.json()
            console.log('Respuesta completa:', responseData)
            
            // La API devuelve { cards: [...] }, necesitamos extraer el array
            const cards = responseData.cards || responseData
            
            // Verificar que cards sea un array
            if (Array.isArray(cards)) {
              setSavedCards(cards)
              // Seleccionar tarjeta por defecto si existe
              const defaultCard = cards.find((card: SavedCard) => card.is_default)
              if (defaultCard) {
                setSelectedCard(defaultCard.id)
              }
            } else {
              console.error('La respuesta no contiene un array de tarjetas:', responseData)
              setSavedCards([])
            }
          } else {
            console.error('Error en la respuesta:', response.status, response.statusText)
            setSavedCards([])
          }
        } catch (error) {
          console.error('Error cargando tarjetas guardadas:', error)
          setSavedCards([])
        } finally {
          setLoadingCards(false)
        }
      }

      fetchSavedCards()
    }
  }, [isAuthenticated])

  const getSubtotalWithIVA = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getSubtotal = () => {
    const totalWithIVA = getSubtotalWithIVA()
    return totalWithIVA / 1.10 // Quitar el IVA del 10%
  }

  const getIVA = () => {
    return getSubtotal() * 0.10 // 10% de IVA sobre el subtotal sin IVA
  }

  const getTotalPrice = () => {
    return getSubtotal() + getIVA()
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getPotentialPoints = () => {
    const subtotal = getSubtotal()
    return Math.floor(subtotal * loyaltyConfig.valor_por_euro)
  }

  const getDiscountValue = () => {
    const points = getPotentialPoints()
    return (points * loyaltyConfig.valor_euro_por_punto).toFixed(2)
  }

  // Validaciones de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  const validateCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '')
    return cleanNumber.length >= 13 && cleanNumber.length <= 19
  }

  const validateExpiry = (expiry: string) => {
    const [month, year] = expiry.split('/')
    if (!month || !year) return false
    const monthNum = parseInt(month)
    const yearNum = parseInt('20' + year)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    return monthNum >= 1 && monthNum <= 12 &&
      (yearNum > currentYear || (yearNum === currentYear && monthNum >= currentMonth))
  }

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv)
  }

  const validateCardForm = () => {
    if (selectedCard) return true // Tarjeta guardada seleccionada

    return validateCardNumber(newCard.number) &&
      validateExpiry(newCard.expiry) &&
      validateCVV(newCard.cvv) &&
      newCard.name.trim().length > 0
  }

  const handleConfirmOrder = async () => {
    if (!mesaInfo) {
      alert('No se ha seleccionado una mesa')
      return
    }

    if (!validateCardForm()) {
      alert('Por favor completa correctamente la información de la tarjeta')
      return
    }

    setIsProcessing(true)

    try {
      // Preparar datos del pedido
      const orderData = {
        mesa_id: mesaInfo.id,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          observaciones: item.observaciones || null
        }))
      }

      console.log('Datos del pedido a enviar:', orderData)
      console.log('ID de la mesa:', mesaInfo.id)

      // Crear pedido
      const response = await fetch('/api/client/pedidos', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()

        // Limpiar carrito
        localStorage.removeItem('cart')
        setCart([])

        // Redirigir a página de éxito
        router.push(`/order-success?pedido=${result.pedido.id}`)
      } else {
        const error = await response.json()
        alert(`Error al crear el pedido: ${error.message}`)
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error)
      alert('Error al procesar el pedido. Por favor intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  console.log('Estado del carrito en checkout:', cart)
  console.log('Estado de autenticación:', isAuthenticated)
  console.log('Tarjetas guardadas:', savedCards)
  console.log('Tarjeta seleccionada:', selectedCard)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carrito vacío</h2>
          <p className="text-gray-600 mb-4">No hay productos en tu carrito</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
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
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Finalizar Pedido</h1>
                <p className="text-sm text-gray-500">Mesa {mesaInfo?.name}</p>
              </div>
            </div>

            {/* Indicador de puntos */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currentPoints} puntos
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen del pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Información del Pedido</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mesa:</span>
                    <span className="font-medium">{mesaInfo?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de artículos:</span>
                    <span className="font-medium">{getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">€{getSubtotal().toFixed(2)}</span>
                  </div>
                  {isAuthenticated && getPotentialPoints() > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Puntos que ganarás:</span>
                      <span className="font-medium">{getPotentialPoints()} puntos</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Productos del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Productos del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {item.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        {item.observaciones && (
                          <p className="text-sm text-gray-500">Obs: {item.observaciones}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de pago */}
          <div className="space-y-6">
            {/* Método de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Método de Pago</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showNewCard ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Tarjetas guardadas</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCard(false)}
                        className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
                      >
                        ← Volver
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="card-number">Número de tarjeta</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={newCard.number}
                          onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })}
                          maxLength={19}
                          className={!validateCardNumber(newCard.number) && newCard.number.length > 0 ? 'border-red-500' : ''}
                        />
                        {!validateCardNumber(newCard.number) && newCard.number.length > 0 && (
                          <p className="text-red-500 text-xs mt-1">Número de tarjeta inválido</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="card-expiry">Vencimiento</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/AA"
                            value={newCard.expiry}
                            onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                            maxLength={5}
                            className={!validateExpiry(newCard.expiry) && newCard.expiry.length > 0 ? 'border-red-500' : ''}
                          />
                          {!validateExpiry(newCard.expiry) && newCard.expiry.length > 0 && (
                            <p className="text-red-500 text-xs mt-1">Fecha inválida</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input
                            id="card-cvv"
                            placeholder="123"
                            value={newCard.cvv}
                            onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                            maxLength={4}
                            className={!validateCVV(newCard.cvv) && newCard.cvv.length > 0 ? 'border-red-500' : ''}
                          />
                          {!validateCVV(newCard.cvv) && newCard.cvv.length > 0 && (
                            <p className="text-red-500 text-xs mt-1">CVV inválido</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                        <Input
                          id="card-name"
                          placeholder="Juan Pérez"
                          value={newCard.name}
                          onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                          className={newCard.name.trim().length === 0 && newCard.name.length > 0 ? 'border-red-500' : ''}
                        />
                        {newCard.name.trim().length === 0 && newCard.name.length > 0 && (
                          <p className="text-red-500 text-xs mt-1">Nombre requerido</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isAuthenticated ? (
                  loadingCards ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">Cargando tarjetas...</span>
                    </div>
                  ) : savedCards.length > 0 ? (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Tarjetas guardadas</Label>
                      {savedCards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCard === card.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => {
                          setSelectedCard(card.id)
                          setShowNewCard(false)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                **** **** **** {card.last_four_digits}
                              </div>
                                <div className="text-sm text-gray-500">
                                  {card.brand !== 'unknown' && card.brand !== 'Unknown' ? (
                                    <>
                                      {card.brand} • {card.expiry_month}/{card.expiry_year}
                                    </>
                                  ) : (
                                    <>
                                      {card.expiry_month}/{card.expiry_year}
                                    </>
                                  )}
                                </div>
                            </div>
                          </div>
                          {card.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Por defecto
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowNewCard(true)
                        setSelectedCard(null)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Usar otra tarjeta
                    </Button>
                  </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">No tienes tarjetas guardadas</p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowNewCard(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar tarjeta
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Información de la tarjeta</Label>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="card-number">Número de tarjeta</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={newCard.number}
                          onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })}
                          maxLength={19}
                          className={!validateCardNumber(newCard.number) && newCard.number.length > 0 ? 'border-red-500' : ''}
                        />
                        {!validateCardNumber(newCard.number) && newCard.number.length > 0 && (
                          <p className="text-red-500 text-xs mt-1">Número de tarjeta inválido</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="card-expiry">Vencimiento</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/AA"
                            value={newCard.expiry}
                            onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                            maxLength={5}
                            className={!validateExpiry(newCard.expiry) && newCard.expiry.length > 0 ? 'border-red-500' : ''}
                          />
                          {!validateExpiry(newCard.expiry) && newCard.expiry.length > 0 && (
                            <p className="text-red-500 text-xs mt-1">Fecha inválida</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input
                            id="card-cvv"
                            placeholder="123"
                            value={newCard.cvv}
                            onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                            maxLength={4}
                            className={!validateCVV(newCard.cvv) && newCard.cvv.length > 0 ? 'border-red-500' : ''}
                          />
                          {!validateCVV(newCard.cvv) && newCard.cvv.length > 0 && (
                            <p className="text-red-500 text-xs mt-1">CVV inválido</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                        <Input
                          id="card-name"
                          placeholder="Juan Pérez"
                          value={newCard.name}
                          onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                          className={newCard.name.trim().length === 0 && newCard.name.length > 0 ? 'border-red-500' : ''}
                        />
                        {newCard.name.trim().length === 0 && newCard.name.length > 0 && (
                          <p className="text-red-500 text-xs mt-1">Nombre requerido</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen de pago */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>€{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (10%):</span>
                    <span>€{getIVA().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>€{getTotalPrice().toFixed(2)}</span>
                  </div>

                  {isAuthenticated && getPotentialPoints() > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-orange-700">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Ganarás {getPotentialPoints()} puntos
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Equivalente a €{getDiscountValue()} de descuento futuro
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botón de confirmar */}
            <Button
              onClick={handleConfirmOrder}
              disabled={isProcessing || !validateCardForm()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Pedido</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}