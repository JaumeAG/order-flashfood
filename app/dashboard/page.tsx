"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import {
  Minus,
  Plus,
  ShoppingCart,
  User,
  LogIn,
  LogOut,
  Search,
  Clock,
  Pizza,
  Coffee,
  IceCream,
  Salad,
  Fish,
  Beef,
  CupSoda,
  Beer,
  Wine,
  Sandwich,
  CakeSlice,
  Wheat,
  Croissant,
  Martini,
  Soup,
  CookingPot,
  EggFried,
  Hamburger,
  Utensils,
  NotebookPen,
  Sparkles,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
// import { '', getApiUrl } from "@/lib/tenant"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import { useAuthClientRedirect } from "@/hooks/useAuthClientRedirect"

// Mapa de iconos para las familias
const iconMap: Record<string, any> = {
  Pizza,
  Coffee,
  IceCream,
  Salad,
  Fish,
  Beef,
  CupSoda,
  Beer,
  Wine,
  Sandwich,
  CakeSlice,
  Wheat,
  Croissant,
  Martini,
  Soup,
  CookingPot,
  EggFried,
  Hamburger,
  Utensils, // icono por defecto
};


interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  observaciones?: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  image?: string
  available: boolean
  category: number | string
}

interface Categories {
  id: number | string
  name: string
  icon?: string
}
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Imagen skeleton */}
        <div className="relative w-full h-32 sm:w-24 sm:h-24 flex-shrink-0">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Contenido skeleton */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-0">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 sm:h-5 w-3/4 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function CategorySkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-9 px-3 flex items-center gap-2 rounded-md border bg-muted flex-shrink-0"
        >
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  // useAuthClientRedirect();
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Categories[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedMesa, setSelectedMesa] = useState<number | null>(null)
  const [nameMesa, setNameMesa] = useState<string | null>(null)
  const [showQRWarning, setShowQRWarning] = useState(false)
  const [mesaValidada, setMesaValidada] = useState<boolean | null>(null)
  const [validandoMesa, setValidandoMesa] = useState(false)
  const [usingCache, setUsingCache] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [selectedProductForObservations, setSelectedProductForObservations] = useState<Product | null>(null)
  const [observationsText, setObservationsText] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showPointsBanner, setShowPointsBanner] = useState(false)
  const [showSmartPopup, setShowSmartPopup] = useState(false)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [potentialPoints, setPotentialPoints] = useState(0)
  const [loyaltyConfig, setLoyaltyConfig] = useState({
    valor_por_euro: 1.00,
    valor_euro_por_punto: 0.02,
    puntos_canje: 50,
    descuento_canje: 5.00,
    activo: true
  })
  const router = useRouter()



  // Cargar carrito desde localStorage al inicio
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error cargando carrito desde localStorage:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // Cargar configuración de fidelización
  useEffect(() => {
    const fetchLoyaltyConfig = async () => {
      try {
        const response = await fetch('/api/fidelizacion', {
          headers: {},
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
  }, [])

  // Cargar puntos del usuario autenticado
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/user/points', {
            headers: {},
          })
          
          if (response.ok) {
            const data = await response.json()
            setCurrentPoints(data.puntos)
          }
        } catch (error) {
          console.error('Error cargando puntos del usuario:', error)
        }
      }
    }

    fetchUserPoints()
  }, [isAuthenticated])

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('tokenClient')
    setIsAuthenticated(!!token)
    
    // Mostrar modal de bienvenida si no está autenticado (solo después de validar mesa)
    if (!token && mesaValidada === true) {
      setShowWelcomeModal(true)
      setShowPointsBanner(true)
    }
  }, [mesaValidada])

  // Calcular puntos potenciales en tiempo real
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const points = Math.floor(total * loyaltyConfig.valor_por_euro) // Puntos según configuración del negocio
    setPotentialPoints(points)
    
    // Mostrar pop-up inteligente cuando tenga suficientes puntos para canjear (solo si mesa está validada)
    if (points >= loyaltyConfig.puntos_canje && !isAuthenticated && !showSmartPopup && mesaValidada === true && !validandoMesa) {
      setShowSmartPopup(true)
    }
  }, [cart, isAuthenticated, mesaValidada, validandoMesa, loyaltyConfig])

  useEffect(() => {
    // Inicializar recomendaciones cuando se cargan los productos
    if (products.length > 0 && aiRecommendations.length === 0) {
      updateAIRecommendations();
    }
  }, [products]);

  useEffect(() => {

    const token = localStorage.getItem('tokenClient');


    const fetchFamilies = async () => {
      try {
        console.log('🔍 fetchFamilies - Headers:', '');
        console.log('🔍 fetchFamilies - URL:', window.location.hostname);

        const res = await fetch("/api/dashfamilies", {
          headers: {},
        })

        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json()

        console.log('🔍 fetchFamilies - Datos recibidos:', data);

        // Normalizar categorías
        const allCategories = [
          { id: "all", name: "Todos", icon: "Utensils" }, // 👈 extra "Todos"
          ...data.map((family: any) => ({
            id: String(family.id),
            name: family.name,
            icon: family.icon || "Utensils",
          })),
        ]

        // Normalizar productos
        const allProducts = data.flatMap((family: any) =>
          family.products.map((p: any) => ({
            ...p,
            category: String(family.id), // asociar con familia
          }))
        )

        setCategories(allCategories)
        setProducts(allProducts)
      } catch (err) {
        console.error("Error cargando familias:", err);
      } finally {
        setLoadingProducts(false)
        setLoadingCategories(false)
      }
    }

    fetchFamilies()

  }, [])

  // Función para verificar si la mesa ya fue validada recientemente
  const isMesaRecentlyValidated = (mesaId: number) => {
    const cacheKey = `mesa_validated_${mesaId}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const { timestamp, valid } = JSON.parse(cached)
        const now = Date.now()
        const cacheExpiry = 30 * 60 * 1000 // 30 minutos
        
        // Si la validación es reciente (menos de 30 minutos) y fue exitosa
        if (now - timestamp < cacheExpiry && valid) {
          return true
        }
      } catch (error) {
        console.error('Error parsing mesa validation cache:', error)
        localStorage.removeItem(cacheKey)
      }
    }
    
    return false
  }

  // Función para guardar el estado de validación de mesa en caché
  const cacheMesaValidation = (mesaId: number, valid: boolean) => {
    const cacheKey = `mesa_validated_${mesaId}`
    const cacheData = {
      timestamp: Date.now(),
      valid: valid
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  }

  // Función para limpiar el caché de validación de mesa
  const clearMesaValidationCache = (mesaId?: number) => {
    if (mesaId) {
      // Limpiar caché de una mesa específica
      const cacheKey = `mesa_validated_${mesaId}`
      localStorage.removeItem(cacheKey)
    } else {
      // Limpiar todos los cachés de validación de mesa
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('mesa_validated_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Detectar parámetro de mesa desde la URL (QR)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mesaId = urlParams.get('mesa')

    const fetchNameMesa = async () => {
      const nameMesa = await fetch(`/api/public/mesas/${mesaId}`, {
        headers: {},
      })
      const mesaData = await nameMesa.json()
      setNameMesa(mesaData.name)
      localStorage.setItem('nameMesa', mesaData.name)
    }

    if (mesaId) {
      fetchNameMesa()
      const mesaIdNumber = parseInt(mesaId)
      setSelectedMesa(mesaIdNumber)
      localStorage.setItem('selectedMesa', mesaId)
      console.log('Mesa detectada desde QR:', mesaId)

      // Verificar si la mesa ya fue validada recientemente
      if (isMesaRecentlyValidated(mesaIdNumber)) {
        console.log('Mesa ya validada recientemente, usando caché')
        setMesaValidada(true)
        setShowQRWarning(false)
        setUsingCache(true)
        setInitialLoading(false)
        // Ocultar el indicador de caché después de 2 segundos
        setTimeout(() => setUsingCache(false), 2000)
      } else {
        // Validar que la mesa existe y pertenece al negocio
        validarMesa(mesaIdNumber)
      }
    } else {
      // Intentar cargar mesa guardada
      const savedMesa = localStorage.getItem('selectedMesa')
      const savedNameMesa = localStorage.getItem('nameMesa')
      if (savedMesa) {
        const mesaIdNumber = parseInt(savedMesa)
        setSelectedMesa(mesaIdNumber)
        if (savedNameMesa) {
          setNameMesa(savedNameMesa)
        }
        
        // Verificar si la mesa ya fue validada recientemente
        if (isMesaRecentlyValidated(mesaIdNumber)) {
          console.log('Mesa guardada ya validada recientemente, usando caché')
          setMesaValidada(true)
          setShowQRWarning(false)
          setUsingCache(true)
          setInitialLoading(false)
          // Ocultar el indicador de caché después de 2 segundos
          setTimeout(() => setUsingCache(false), 2000)
        } else {
          // Validar mesa guardada también
          validarMesa(mesaIdNumber)
        }
      } else {
        // No hay mesa ni QR - mostrar advertencia
        setShowQRWarning(true)
        setMesaValidada(false)
        setInitialLoading(false)
      }
    }
  }, [])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showCartModal) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }
  }, [showCartModal])

  // Manejar tecla ESC para cerrar modal de imagen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown)
      // Bloquear scroll cuando la imagen está abierta
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [] // seguridad extra
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesSearch && product.available
    })
  }, [products, selectedCategory, searchTerm])

  const addToCart = (product: Product, observaciones?: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      let newCart
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        newCart = [
          ...prevCart,
          { id: product.id, name: product.name, price: product.price, quantity: 1, observaciones: observaciones || '' },
        ]
      }
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })

    // Mostrar mensaje de confirmación
    setAddedProduct(product.name)
    setTimeout(() => setAddedProduct(null), 2000)
  }

  const handleAddToCartWithObservations = (product: Product) => {
    setSelectedProductForObservations(product)
    setObservationsText('')
    setShowObservationsModal(true)
  }

  const confirmAddToCart = () => {
    if (selectedProductForObservations) {
      addToCart(selectedProductForObservations, observationsText)
      setShowObservationsModal(false)
      setSelectedProductForObservations(null)
      setObservationsText('')
    }
  }


  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)
      let newCart
      if (existingItem && existingItem.quantity > 1) {
        newCart = prevCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        newCart = prevCart.filter((item) => item.id !== productId)
      }
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const generateAIRecommendations = () => {
    if (products.length === 0) return [];

    // Mezclar el array de productos y tomar 3 aleatorios
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  const updateAIRecommendations = async () => {
    setIsAIThinking(true);

    // Simular tiempo de "pensamiento" de la IA (1.5-2.5 segundos)
    const thinkingTime = Math.random() * 1000 + 1500; // Entre 1.5 y 2.5 segundos

    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    const newRecommendations = generateAIRecommendations();
    setAiRecommendations(newRecommendations);
    setIsAIThinking(false);
  }

  const validarMesa = async (mesaId: number) => {
    setValidandoMesa(true);
    try {
      const token = localStorage.getItem('tokenClient');
      const response = await fetch(`/api/mesas/${mesaId}`, {
        headers: {},
      });

      if (response.ok) {
        setMesaValidada(true);
        setShowQRWarning(false);
        setInitialLoading(false);
        // Guardar en caché que la mesa fue validada exitosamente
        cacheMesaValidation(mesaId, true);
      } else {
        setMesaValidada(false);
        setShowQRWarning(true);
        setSelectedMesa(null);
        setInitialLoading(false);
        // Guardar en caché que la mesa no es válida
        cacheMesaValidation(mesaId, false);
      }
    } catch (error) {
      console.error('Error validando mesa:', error);
      setMesaValidada(false);
      setShowQRWarning(true);
      setSelectedMesa(null);
      setInitialLoading(false);
      // Guardar en caché que la mesa no es válida
      cacheMesaValidation(mesaId, false);
    } finally {
      setValidandoMesa(false);
    }
  }

  const createOrder = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsCreatingOrder(true);

    try {
      // const token = localStorage.getItem('tokenClient');
      // if (!token) {
      //   alert('No estás autenticado');
      //   setIsCreatingOrder(false);
      //   return;
      // }


      // Validar que haya una mesa seleccionada
      if (!selectedMesa) {
        alert('No se ha detectado una mesa. Por favor, escanea el código QR de la mesa.');
        return;
      }

      // Preparar los datos del pedido
      const orderData = {
        mesa_id: selectedMesa, // Usar la mesa detectada desde el QR
        // negocio_id ya no es necesario - se determina automáticamente del subdominio
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          observaciones: item.observaciones || null
        }))
      };

      const response = await fetch('/api/client/pedidos', {
        method: 'POST',
        headers: {},
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();

        // Mostrar modal de éxito
        setOrderSuccess(true);
        setShowSuccessModal(true);

        // Limpiar el carrito
        setCart([]);
        localStorage.removeItem('cart');
        setShowCartModal(false);
      } else {
        const error = await response.json();
        console.error('Error creando pedido:', error);
        alert('Error al crear el pedido: ' + (error.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al crear el pedido');
    } finally {
      setIsCreatingOrder(false);
    }
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3F1' }}>
      {/* Indicador de caché */}
      {usingCache && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-2 text-center text-sm z-50">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Mesa validada (usando caché)</span>
          </div>
        </div>
      )}

      {/* Header móvil optimizado - Solo se muestra si hay mesa seleccionada y validada */}
      {selectedMesa && mesaValidada && !validandoMesa && (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="px-4">
            <div className="flex justify-between items-center h-14">
              {/* Logo y título */}
              <div className="flex items-center space-x-3">
                
                <div className="flex items-center gap-3">
                  <Image src="branding/webclip.png" alt="FlashFood" width={32} height={32} />
                  <Badge variant="outline" className="flex items-center gap-1" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)', borderColor: '#D64A3A', color: '#D64A3A' }}>
                    <Utensils className="w-3 h-3" />
                    Mesa {nameMesa}
                  </Badge>
                </div>
              </div>

              {/* Carrito y menú usuario */}
              <div className="flex items-center space-x-2">
                {/* Botón de IA */}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white hover:from-purple-600 hover:to-pink-600"
                  onClick={() => setShowAIModal(true)}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>

                {/* Carrito con badge */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-transparent"
                    style={{ borderColor: 'rgba(214, 74, 58, 0.3)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={() => setShowCartModal(true)}
                  >
                    <NotebookPen className="w-4 h-4" style={{ color: '#D64A3A' }} />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center" style={{ backgroundColor: '#D64A3A' }}>
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Indicador de puntos y menú usuario */}
                <div className="flex items-center space-x-1">
                  {/* Indicador de puntos - solo en desktop */}
                  {isAuthenticated ? (
                    <div className="hidden lg:flex items-center space-x-2 text-white px-3 py-2 rounded-lg" style={{ background: 'linear-gradient(to right, #D64A3A, #E4512F)' }}>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {currentPoints} puntos
                      </span>
                    </div>
                  ) : potentialPoints > 0 ? (
                    <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F7F3F1', color: '#2E2523' }}>
                      <Sparkles className="w-4 h-4" style={{ color: '#D64A3A' }} />
                      <span className="text-sm font-medium">
                        +{potentialPoints} puntos
                      </span>
                    </div>
                  ) : null}

                  {/* Menú usuario o botones de autenticación */}
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2">
                          <User className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Clock className="w-4 h-4 mr-2" />
                          Historial
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { 
                          localStorage.removeItem('tokenClient'); 
                          setIsAuthenticated(false);
                          // Limpiar caché de validación de mesa al cerrar sesión
                          clearMesaValidationCache();
                          router.push("/login") 
                        }} className="cursor-pointer">
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push("/login")}
                        className="p-2"
                        title="Iniciar sesión"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => router.push("/register")}
                        className="p-2"
                        title="Registrarse"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Contenido principal optimizado para móvil */}
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)' }}>
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D64A3A', borderTopColor: 'transparent' }}></div>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#2E2523' }}>
            Cargando...
          </h2>
          <p style={{ color: '#2E2523CC' }}>
            Verificando acceso a la mesa.
          </p>
        </div>
      ) : validandoMesa ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)' }}>
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D64A3A', borderTopColor: 'transparent' }}></div>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#2E2523' }}>
            Validando mesa...
          </h2>
          <p style={{ color: '#2E2523CC' }}>
            Verificando que la mesa existe.
          </p>
        </div>
      ) : !showQRWarning && mesaValidada ? (
        <>
          <div className="px-4 py-4">
            {/* Búsqueda */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar platos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2"
                  style={{ 
                    borderColor: '#E0E0E0',
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
                />
              </div>
            </div>

            {/* Categorías - Scroll horizontal */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {loadingCategories ? (
                  <CategorySkeleton />
                ) : (
                  Array.isArray(categories) &&
                  categories.map((category) => {
                    const IconComponent = iconMap[category.icon || "Utensils"] || Utensils;
                    const categoryId = String(category.id);
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === categoryId ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(categoryId)}
                        className={`whitespace-nowrap ${selectedCategory === categoryId ? "text-white" : "bg-white"}`}
                        style={selectedCategory === categoryId ? {
                          backgroundColor: '#D64A3A',
                          borderColor: '#D64A3A'
                        } : {
                          borderColor: 'rgba(214, 74, 58, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedCategory !== categoryId) {
                            e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.1)'
                          } else {
                            e.currentTarget.style.backgroundColor = '#E4512F'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCategory !== categoryId) {
                            e.currentTarget.style.backgroundColor = '#FFFFFF'
                          } else {
                            e.currentTarget.style.backgroundColor = '#D64A3A'
                          }
                        }}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        {category.name}
                      </Button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Grid de productos - Responsive mejorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-20">
              {loadingProducts
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : filteredProducts.map((product) => {
                  return (
                    <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:scale-[1.02] bg-white">
                      <div className="flex flex-col sm:flex-row h-full">
                        {/* Imagen del producto */}
                        <div
                          className="relative w-full h-32 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                          onClick={() => {
                            const imageUrl = product.image && product.image.trim() !== "" ? product.image : "https://img.freepik.com/foto-gratis/rebanada-pizza-crujiente-carne-queso_140725-6974.jpg";

                            setSelectedImage(imageUrl);
                          }}
                        >
                          <Image
                            src={product.image && product.image.trim() !== "" ? product.image : "https://img.freepik.com/foto-gratis/rebanada-pizza-crujiente-carne-queso_140725-6974.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Overlay hover */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>

                        {/* Contenido del producto */}
                        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-0">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 transition-colors" style={{ color: '#2E2523' }} onMouseEnter={(e) => e.currentTarget.style.color = '#D64A3A'} onMouseLeave={(e) => e.currentTarget.style.color = '#2E2523'}>{product.name}</h3>
                            <p className="text-sm mb-3 line-clamp-2 sm:line-clamp-3 leading-relaxed" style={{ color: '#2E2523CC' }}>{product.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-lg sm:text-xl font-bold" style={{ color: '#D64A3A' }}>€{product.price.toFixed(2)}</span>
                              <span className="text-xs" style={{ color: '#2E2523AA' }}>por unidad</span>
                            </div>
                            <Button
                              onClick={() => handleAddToCartWithObservations(product)}
                              size="sm"
                              className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                              style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#E4512F'
                                e.currentTarget.style.borderColor = '#E4512F'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#D64A3A'
                                e.currentTarget.style.borderColor = '#D64A3A'
                              }}
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Mensaje de confirmación sutil */}
          {addedProduct && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-from-top">
              <div className="text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2" style={{ backgroundColor: '#D64A3A' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">¡{addedProduct} añadido al pedido!</span>
              </div>
            </div>
          )}

          {/* Modal del carrito completo */}
          {showCartModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 overflow-hidden"
              onClick={() => setShowCartModal(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <div
                className="bg-white rounded-t-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
              >
                {/* Header del modal */}
                <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)' }}>
                      <ShoppingCart className="w-4 h-4" style={{ color: '#D64A3A' }} />
                    </div>
                    <h2 className="text-lg font-semibold" style={{ color: '#2E2523' }}>Mi Pedido</h2>
                    {cart.length > 0 && (
                      <Badge variant="secondary" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)', color: '#D64A3A' }}>
                        {getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCartModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                {/* Contenido del carrito */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <NotebookPen className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3" style={{ color: '#2E2523' }}>Tu carrito está vacío</h3>
                      <p className="text-center mb-8 max-w-sm" style={{ color: '#2E2523CC' }}>
                        Añade algunos productos deliciosos para comenzar tu pedido
                      </p>
                      <Button
                        onClick={() => setShowCartModal(false)}
                        className="text-white px-6 py-3 rounded-lg font-medium"
                        style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E4512F'
                          e.currentTarget.style.borderColor = '#E4512F'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#D64A3A'
                          e.currentTarget.style.borderColor = '#D64A3A'
                        }}
                      >
                        Explorar menú
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      {cart.map((item) => {
                        // Buscar el producto completo para obtener la imagen
                        const fullProduct = products.find(p => p.id === item.id);
                        const productImage = fullProduct?.image && fullProduct.image.trim() !== "" && fullProduct.image !== "/placeholder.svg"
                          ? fullProduct.image
                          : "https://img.freepik.com/foto-gratis/rebanada-pizza-crujiente-carne-queso_140725-6974.jpg";

                        return (
                          <div key={item.id} className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200" onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(214, 74, 58, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}>
                            <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4">
                              {/* Imagen del producto */}
                              <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  <Image
                                    src={productImage}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>

                                {/* Información del producto */}
                                <div className="flex-1 min-w-0 sm:text-center">
                                  <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2" style={{ color: '#2E2523' }}>{item.name}</h3>
                                  <p className="text-xs sm:text-sm mb-2" style={{ color: '#2E2523CC' }}>€{item.price.toFixed(2)} cada uno</p>
                                  {item.observaciones && (
                                    <div className="mb-2">
                                      <p className="text-xs mb-1" style={{ color: '#2E2523AA' }}>Observaciones:</p>
                                      <p className="text-xs px-2 py-1 rounded border-l-2" style={{ color: '#2E2523', backgroundColor: '#F7F3F1', borderColor: '#D64A3A' }}>
                                        {item.observaciones}
                                      </p>
                                    </div>
                                  )}

                                  {/* Controles de cantidad - Móvil */}
                                  <div className="flex items-center justify-between sm:hidden">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeFromCart(item.id)}
                                        className="w-8 h-8 p-0 border-gray-300 hover:bg-red-50 hover:border-red-300"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-6 text-center font-semibold text-gray-900 text-sm">{item.quantity}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const fullProduct = products.find(p => p.id === item.id);
                                          if (fullProduct) {
                                            addToCart(fullProduct);
                                          }
                                        }}
                                        className="w-8 h-8 p-0 border-gray-300 hover:bg-green-50 hover:border-green-300"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-base" style={{ color: '#D64A3A' }}>€{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Controles de cantidad - Desktop */}
                              <div className="hidden sm:flex sm:flex-col sm:items-center sm:justify-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-9 h-9 p-0 border-gray-300 hover:bg-red-50 hover:border-red-300"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fullProduct = products.find(p => p.id === item.id);
                                      if (fullProduct) {
                                        addToCart(fullProduct);
                                      }
                                    }}
                                    className="w-9 h-9 p-0 border-gray-300 hover:bg-green-50 hover:border-green-300"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-lg" style={{ color: '#D64A3A' }}>€{(item.price * item.quantity).toFixed(2)}</p>
                                  <p className="text-xs" style={{ color: '#2E2523AA' }}>total</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer con total y botones */}
                {cart.length > 0 && (
                  <div className="border-t bg-white p-4 space-y-4 sticky bottom-0">
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold" style={{ color: '#2E2523' }}>Total:</span>
                        <Badge variant="outline" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)', color: '#D64A3A', borderColor: '#D64A3A' }}>
                          {getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'}
                        </Badge>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: '#D64A3A' }}>€{getTotalPrice().toFixed(2)}</span>
                    </div>
                    
                    {/* Indicador de puntos */}
                    {potentialPoints > 0 && (
                      <div className="mt-3 p-2 sm:p-3 rounded-lg border" style={{ background: 'linear-gradient(to right, rgba(214, 74, 58, 0.1), rgba(228, 81, 47, 0.1))', borderColor: 'rgba(214, 74, 58, 0.3)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#D64A3A' }} />
                            <span className="text-xs sm:text-sm font-medium truncate" style={{ color: '#2E2523' }}>
                              {isAuthenticated ? 'Ganarás' : 'Ganarías'} {potentialPoints} puntos
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium flex-shrink-0 ml-2" style={{ color: '#D64A3A' }}>
                            €{(potentialPoints * loyaltyConfig.valor_euro_por_punto).toFixed(2)}
                          </span>
                        </div>
                        {!isAuthenticated && (
                          <p className="text-xs mt-1" style={{ color: '#2E2523AA' }}>
                            Regístrate para ganar puntos con este pedido
                          </p>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCart([]);
                          localStorage.removeItem('cart');
                        }}
                        className="font-medium py-3"
                        style={{ color: '#D64A3A', borderColor: 'rgba(214, 74, 58, 0.3)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.1)'
                          e.currentTarget.style.borderColor = '#D64A3A'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = 'rgba(214, 74, 58, 0.3)'
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Vaciar
                      </Button>
                      <Button
                        onClick={createOrder}
                        disabled={isCreatingOrder}
                        className={`text-white font-semibold py-3 ${isCreatingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                        onMouseEnter={(e) => {
                          if (!isCreatingOrder) {
                            e.currentTarget.style.backgroundColor = '#E4512F'
                            e.currentTarget.style.borderColor = '#E4512F'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCreatingOrder) {
                            e.currentTarget.style.backgroundColor = '#D64A3A'
                            e.currentTarget.style.borderColor = '#D64A3A'
                          }
                        }}
                      >
                        {isCreatingOrder ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pedir
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCartModal(false);
                          router.push("/checkout");
                        }}
                        className="text-white font-medium py-3"
                        style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E4512F'
                          e.currentTarget.style.borderColor = '#E4512F'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#D64A3A'
                          e.currentTarget.style.borderColor = '#D64A3A'
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pedir y Pagar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal de IA - Recomendaciones */}
          {showAIModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAIModal(false)}
            >
              <div
                className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">Asistente IA</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIModal(false)}
                    className="p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                {/* Contenido del modal */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#2E2523' }}>¿No sabes qué pedir?</h3>
                    <p className="text-sm" style={{ color: '#2E2523CC' }}>Deja que nuestra IA te sorprenda con recomendaciones personalizadas</p>
                  </div>

                  {/* Estado de carga de la IA */}
                  {isAIThinking ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#2E2523' }}>La IA está pensando...</span>
                        </div>
                        <div className="flex justify-center space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>

                      {/* Skeleton de recomendaciones */}
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                              </div>
                              <div className="w-16 h-8 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Recomendaciones normales */
                    <div className="space-y-3">
                      <h4 className="font-medium" style={{ color: '#2E2523' }}>✨ Recomendaciones para ti:</h4>

                      {aiRecommendations.map((product, index) => {
                        const colors = [
                          { bg: 'linear-gradient(to right, rgba(214, 74, 58, 0.1), rgba(228, 81, 47, 0.1))', border: 'rgba(214, 74, 58, 0.3)', iconBg: 'rgba(214, 74, 58, 0.1)', iconColor: '#D64A3A', priceColor: '#D64A3A', buttonColor: '#D64A3A', buttonHover: '#E4512F' },
                          { bg: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))', border: 'rgba(59, 130, 246, 0.3)', iconBg: 'rgba(59, 130, 246, 0.1)', iconColor: '#3B82F6', priceColor: '#3B82F6', buttonColor: '#3B82F6', buttonHover: '#2563EB' },
                          { bg: 'linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))', border: 'rgba(34, 197, 94, 0.3)', iconBg: 'rgba(34, 197, 94, 0.1)', iconColor: '#22C55E', priceColor: '#22C55E', buttonColor: '#22C55E', buttonHover: '#16A34A' }
                        ];

                        const colorScheme = colors[index % colors.length];
                        const productImage = product.image && product.image.trim() !== "" && product.image !== "/placeholder.svg"
                          ? product.image
                          : "https://img.freepik.com/foto-gratis/rebanada-pizza-crujiente-carne-queso_140725-6974.jpg";

                        return (
                          <div key={product.id} className="rounded-lg p-3 border animate-slide-in-from-top" style={{ background: colorScheme.bg, borderColor: colorScheme.border }}>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: colorScheme.iconBg }}>
                                <Image
                                  src={productImage}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium" style={{ color: '#2E2523' }}>{product.name}</h5>
                                <p className="text-xs line-clamp-1" style={{ color: '#2E2523CC' }}>{product.description}</p>
                                <p className="text-sm font-semibold" style={{ color: colorScheme.priceColor }}>€{product.price.toFixed(2)}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  addToCart(product);
                                  setShowAIModal(false);
                                }}
                                className="text-white"
                                style={{ backgroundColor: colorScheme.buttonColor, borderColor: colorScheme.buttonColor }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = colorScheme.buttonHover
                                  e.currentTarget.style.borderColor = colorScheme.buttonHover
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = colorScheme.buttonColor
                                  e.currentTarget.style.borderColor = colorScheme.buttonColor
                                }}
                              >
                                Añadir
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Botón de sorpresa */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        // Actualizar las recomendaciones con productos aleatorios
                        updateAIRecommendations();
                      }}
                      disabled={isAIThinking}
                      className={`w-full text-white ${isAIThinking
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        }`}
                    >
                      {isAIThinking ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          La IA está pensando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          ¡Sorpréndeme con nuevas recomendaciones!
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal para imagen ampliada */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <div className="relative w-full h-full max-w-6xl max-h-[95vh] flex items-center justify-center">
                {/* Botón de cerrar - Siempre visible */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Contenedor de la imagen */}
                <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
                  <Image
                    src={selectedImage}
                    alt="Imagen ampliada"
                    fill
                    className="object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => {
                      console.log('Error loading image:', selectedImage);
                      e.currentTarget.src = "https://img.freepik.com/foto-gratis/rebanada-pizza-crujiente-carne-queso_140725-6974.jpg";
                    }}
                    priority
                  />
                </div>

                {/* Overlay de fondo para cerrar */}
                <div
                  className="absolute inset-0 -z-10"
                  onClick={() => setSelectedImage(null)}
                />

                {/* Instrucciones de uso */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="hidden sm:inline">Haz clic fuera de la imagen o presiona ESC para cerrar</span>
                    <span className="sm:hidden">Toca fuera de la imagen para cerrar</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de éxito del pedido */}
          {showSuccessModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSuccessModal(false)}
            >
              <div
                className="bg-white rounded-2xl w-full max-w-md p-6 text-center animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icono de éxito animado */}
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Título de éxito */}
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2E2523' }}>
                  ¡Pedido Realizado!
                </h2>

                {/* Mensaje descriptivo */}
                <p className="mb-6 leading-relaxed" style={{ color: '#2E2523CC' }}>
                  Tu pedido ha sido enviado a cocina exitosamente.
                  <br />
                  <span className="font-medium" style={{ color: '#D64A3A' }}>¡Pronto estará listo!</span>
                </p>

                {/* Información adicional */}
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)' }}>
                  <div className="flex items-center justify-center space-x-2" style={{ color: '#D64A3A' }}>
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Tiempo estimado: 15-25 minutos
                    </span>
                  </div>
                </div>

                {/* Botón de cerrar */}
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full text-white font-medium py-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E4512F'
                    e.currentTarget.style.borderColor = '#E4512F'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#D64A3A'
                    e.currentTarget.style.borderColor = '#D64A3A'
                  }}
                >
                  ¡Perfecto!
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#2E2523' }}>
            {mesaValidada === false ? 'Mesa No Válida' : 'Acceso Restringido'}
          </h2>
          <p className="mb-6 max-w-md" style={{ color: '#2E2523CC' }}>
            {mesaValidada === false
              ? 'La mesa especificada no existe o no pertenece a este restaurante. Por favor, escanea el código QR correcto de tu mesa.'
              : 'Para poder ver la carta y realizar pedidos, necesitas escanear el código QR ubicado en tu mesa.'
            }
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
            <p className="text-sm text-blue-800">
              <strong>💡 ¿Cómo funciona?</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 text-left space-y-1">
              <li>1. Busca el código QR en tu mesa</li>
              <li>2. Escanéalo con la cámara de tu móvil</li>
              <li>3. Accede a la carta digital completa</li>
              <li>4. Realiza tu pedido directamente</li>
            </ol>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Si no encuentras el código QR, solicítalo al personal del restaurante.
          </p>
        </div>
      )}

      {/* Modal de Observaciones */}
      {showObservationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#2E2523' }}>
                Agregar observaciones
              </h3>
              <button
                onClick={() => setShowObservationsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProductForObservations && (
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  {selectedProductForObservations.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={selectedProductForObservations.image}
                        alt={selectedProductForObservations.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium" style={{ color: '#2E2523' }}>{selectedProductForObservations.name}</h4>
                    <p className="text-sm" style={{ color: '#2E2523AA' }}>€{selectedProductForObservations.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="observations" className="block text-sm font-medium mb-2" style={{ color: '#2E2523' }}>
                Observaciones (opcional)
              </label>
              <Textarea
                id="observations"
                value={observationsText}
                onChange={(e) => setObservationsText(e.target.value)}
                placeholder="Ej: Sin cebolla, bien cocido, sin sal..."
                className="w-full min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {observationsText.length}/500 caracteres
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowObservationsModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmAddToCart}
                className="flex-1 text-white"
                style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E4512F'
                  e.currentTarget.style.borderColor = '#E4512F'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D64A3A'
                  e.currentTarget.style.borderColor = '#D64A3A'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar al carrito
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de bienvenida con incentivos de puntos */}
      {showWelcomeModal && !validandoMesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #D64A3A 0%, #E4512F 100%)' }}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#2E2523' }}>
                ¡Únete a nuestro programa de fidelización!
              </h2>
              <p className="text-sm" style={{ color: '#2E2523CC' }}>
                Gana puntos por cada euro gastado y canjéalos por descuentos reales
              </p>
            </div>

            {/* Beneficios compactos */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-sm text-gray-700">
                  {loyaltyConfig.valor_por_euro} punto{loyaltyConfig.valor_por_euro !== 1 ? 's' : ''} = 1€ gastado
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-sm text-gray-700">
                  {loyaltyConfig.puntos_canje} puntos = €{loyaltyConfig.descuento_canje} de descuento
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="text-sm text-gray-700">Sin límite de tiempo</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowWelcomeModal(false)
                  router.push("/register")
                }}
                className="w-full text-white text-base py-3"
                style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E4512F'
                  e.currentTarget.style.borderColor = '#E4512F'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D64A3A'
                  e.currentTarget.style.borderColor = '#D64A3A'
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Registrarse gratis
              </Button>
              
              <Button
                onClick={() => {
                  setShowWelcomeModal(false)
                  router.push("/login")
                }}
                variant="outline"
                className="w-full text-base py-3"
              >
                Ya tengo cuenta
              </Button>
              
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Continuar sin cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de puntos */}
      {showPointsBanner && !isAuthenticated && !validandoMesa && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 sm:p-3 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">
                <span className="hidden sm:inline">¡Gana {potentialPoints} puntos con este pedido! (€{potentialPoints} de descuento futuro)</span>
                <span className="sm:hidden">¡Gana {potentialPoints} puntos! (€{potentialPoints} descuento)</span>
              </span>
            </div>
            <button
              onClick={() => setShowPointsBanner(false)}
              className="text-white/80 hover:text-white flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pop-up inteligente por valor */}
      {showSmartPopup && !validandoMesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-sm w-full p-4 sm:p-6 relative">
            <button
              onClick={() => setShowSmartPopup(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="text-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl font-bold">{potentialPoints}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                ¡Ya puedes canjear puntos!
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Con este pedido de €{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} 
                ganarías <strong>{potentialPoints} puntos</strong>
                <br />
                ¡Suficientes para canjear <strong>€{(potentialPoints * loyaltyConfig.valor_euro_por_punto).toFixed(2)}</strong> de descuento!
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowSmartPopup(false)
                  router.push("/register")
                }}
                className="w-full text-white text-sm sm:text-base py-2 sm:py-3"
                style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E4512F'
                  e.currentTarget.style.borderColor = '#E4512F'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D64A3A'
                  e.currentTarget.style.borderColor = '#D64A3A'
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Registrarse y canjear €{(potentialPoints * loyaltyConfig.valor_euro_por_punto).toFixed(2)}</span>
                <span className="sm:hidden">Registrarse y canjear</span>
              </Button>
              
              <Button
                onClick={() => {
                  setShowSmartPopup(false)
                  router.push("/login")
                }}
                variant="outline"
                className="w-full text-sm sm:text-base py-2 sm:py-3"
              >
                Ya tengo cuenta
              </Button>
              
              <button
                onClick={() => setShowSmartPopup(false)}
                className="w-full text-xs sm:text-sm text-gray-500 hover:text-gray-700 py-1"
              >
                Continuar sin puntos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
