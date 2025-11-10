"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
// import { getApiHeaders } from "@/lib/tenant"
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Settings,
  Bell,
  CreditCard,
  Plus,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// Datos mock del usuario
const userData = {
  id: "1",
  name: "María García",
  email: "maria.garcia@email.com",
  phone: "+34 612 345 678",
  avatar: "/placeholder.svg?height=100&width=100",
  address: {
    street: "Calle Mayor, 123",
    city: "Madrid",
    postalCode: "28001",
    country: "España",
  },
  joinDate: "2023-01-15",
  totalOrders: 47,
  favoriteRestaurant: "RestauApp",
}

// Historial de pedidos mock
const orderHistory = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    total: 24.5,
    status: "Entregado",
    items: ["Paella Valenciana", "Gazpacho Andaluz", "Agua Mineral"],
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    total: 18.9,
    status: "Entregado",
    items: ["Salmón a la Plancha", "Ensalada César"],
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    total: 32.75,
    status: "Entregado",
    items: ["Tiramisú", "Coca-Cola", "Paella Valenciana"],
  },
]

// Tarjetas guardadas mock
const initialSavedCards = [
  {
    id: "card1",
    name: "Tarjeta principal",
    last4: "4532",
    brand: "Visa",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: "card2",
    name: "Tarjeta trabajo",
    last4: "8901",
    brand: "Mastercard",
    expiry: "08/25",
    isDefault: false,
  },
]

interface UserProfile {
  id: number;
  name: string;
  surnames: string | null;
  email: string;
  telf: string | null;
  created_at: string;
  totalOrders: number;
  avatar: string | null;
}

export default function ProfilePage() {


  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAddCardDialog, setShowAddCardDialog] = useState(false)
  
  // Estados para pedidos
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  // Estados para tarjetas de pago
  const [paymentCards, setPaymentCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para puntos y estadísticas
  const [currentPoints, setCurrentPoints] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0); // Total histórico de pedidos
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [monthlyPointsEarned, setMonthlyPointsEarned] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [minRedeemablePoints, setMinRedeemablePoints] = useState(0); // Mínimo de puntos para canjear
  const [pointsLoaded, setPointsLoaded] = useState(false); // Estado para saber si los puntos están cargados

  useEffect(() => {
    const token = localStorage.getItem('tokenClient');

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error al obtener perfil:", errorText);
          throw new Error("No se pudo obtener el perfil del usuario");
        }

        const data = await response.json();
        console.log('Datos del usuario:', data);
        console.log('Avatar del usuario:', data.avatar);
        setUser(data);
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

  }, [router])

  // Debug avatar cuando cambie
  useEffect(() => {
    if (user) {
      console.log('Avatar actualizado:', user.avatar, 'Tipo:', typeof user.avatar);
    }
  }, [user?.avatar]);

  // Cargar pedidos cuando se abra la pestaña de pedidos
  useEffect(() => {
    if (activeTab === "orders") {
      fetchPedidos();
    }
  }, [activeTab]);

  // Cargar tarjetas cuando se abra la pestaña de tarjetas
  useEffect(() => {
    if (activeTab === "cards") {
      fetchPaymentCards();
    }
  }, [activeTab]);

  // Cargar puntos y estadísticas cuando se abra la pestaña de perfil
  useEffect(() => {
    if (activeTab === "profile") {
      setPointsLoaded(false); // Resetear estado de puntos
      fetchUserPointsAndStats();
    }
  }, [activeTab]);

  // Función para obtener puntos y estadísticas del usuario
  const fetchUserPointsAndStats = async () => {
    const token = localStorage.getItem('tokenClient');
    if (!token) return;

    setLoadingPoints(true);
    try {
      // Obtener puntos actuales y configuración de fidelización
      const [pointsResponse, configResponse] = await Promise.all([
        fetch("/api/user/points", {
          method: "GET",
          headers: {},
        }),
        fetch("/api/fidelizacion", {
          method: "GET",
          headers: {},
        })
      ]);

      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setCurrentPoints(pointsData.puntos || 0);
      }

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setMinRedeemablePoints(configData.puntos_canje || 100);
      }

      // Obtener todos los pedidos del usuario (histórico completo)
      const allOrdersResponse = await fetch("/api/user/pedidos", {
        method: "GET",
        headers: {},
      });

      if (allOrdersResponse.ok) {
        const allOrdersData = await allOrdersResponse.json();
        const allPedidos = allOrdersData.pedidos || [];
        
        // Establecer total histórico de pedidos
        setTotalOrders(allPedidos.length);
        
        // Calcular estadísticas del mes actual
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const pedidosDelMes = allPedidos.filter((pedido: any) => {
          const pedidoDate = new Date(pedido.created_at);
          return pedidoDate >= startOfMonth && pedidoDate <= endOfMonth;
        });
        
        setMonthlyOrders(pedidosDelMes.length);
        
        // Calcular puntos ganados este mes (1 punto por euro)
        const totalSpent = pedidosDelMes.reduce((sum: number, pedido: any) => {
          return sum + parseFloat(pedido.total);
        }, 0);
        setMonthlyPointsEarned(Math.floor(totalSpent));
      }

    } catch (error) {
      console.error("Error al obtener puntos y estadísticas:", error);
    } finally {
      setLoadingPoints(false);
      setPointsLoaded(true); // Marcar que los puntos han terminado de cargar (exitoso o con error)
    }
  };

  // Función para obtener pedidos del usuario
  const fetchPedidos = async () => {
    const token = localStorage.getItem('tokenClient');
    if (!token) return;

    setLoadingPedidos(true);
    try {
      const response = await fetch("/api/user/pedidos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron obtener los pedidos");
      }

      const data = await response.json();
      setPedidos(data.pedidos || []);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  // Función para abrir modal de pedido
  const openPedidoModal = (pedido: any) => {
    setSelectedPedido(pedido);
    setShowPedidoModal(true);
  };

  // Función para obtener tarjetas del usuario
  const fetchPaymentCards = async () => {
    const token = localStorage.getItem('tokenClient');
    if (!token) return;

    setLoadingCards(true);
    try {
      const response = await fetch("/api/user/payment-cards", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron obtener las tarjetas");
      }

      const data = await response.json();
      setPaymentCards(data.cards || []);
    } catch (error) {
      console.error("Error al obtener tarjetas:", error);
    } finally {
      setLoadingCards(false);
    }
  };

  // Función para agregar nueva tarjeta
  const handleAddCard = async () => {
    const token = localStorage.getItem('tokenClient');
    if (!token) return;

    setAddingCard(true);
    try {
      // Simular datos de la pasarela de pago
      const cardData = {
        card_token: `tok_${Date.now()}`, // Token simulado de la pasarela
        last_four_digits: newCardInfo.number.slice(-4),
        brand: detectCardBrand(newCardInfo.number),
        expiry_month: newCardInfo.expiry.split('/')[0],
        expiry_year: `20${newCardInfo.expiry.split('/')[1]}`,
        cardholder_name: newCardInfo.name,
        is_default: paymentCards.length === 0, // Primera tarjeta es por defecto
        metadata: {
          source: 'manual_entry', // Indica que fue entrada manual
          added_at: new Date().toISOString()
        }
      };

      const response = await fetch("/api/user/payment-cards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la tarjeta");
      }

      const result = await response.json();
      
      // Actualizar la lista de tarjetas
      await fetchPaymentCards();
      
      // Limpiar el formulario
      setNewCardInfo({
        number: "",
        expiry: "",
        cvv: "",
        name: "",
        cardName: "",
      });
      
      setShowAddCardDialog(false);
      
      // Mostrar modal de éxito
      setSuccessMessage("¡Tarjeta agregada correctamente!");
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error al agregar tarjeta:", error);
      setSuccessMessage("Error al agregar la tarjeta: " + (error instanceof Error ? error.message : 'Error desconocido'));
      setShowSuccessModal(true);
    } finally {
      setAddingCard(false);
    }
  };

  // Función para eliminar tarjeta
  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      return;
    }

    const token = localStorage.getItem('tokenClient');
    if (!token) return;

    try {
      const response = await fetch(`/api/user/payment-cards/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la tarjeta");
      }

      // Actualizar la lista de tarjetas
      await fetchPaymentCards();
      alert("Tarjeta eliminada correctamente");
      
    } catch (error) {
      console.error("Error al eliminar tarjeta:", error);
      alert("Error al eliminar la tarjeta");
    }
  };

  // Función para establecer tarjeta por defecto
  const handleSetDefaultCard = async (cardId: number) => {
    const token = localStorage.getItem('tokenClient');
    if (!token) return;

    try {
      const response = await fetch(`/api/user/payment-cards/${cardId}/set-default`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al establecer tarjeta por defecto");
      }

      // Actualizar la lista de tarjetas
      await fetchPaymentCards();
      alert("Tarjeta establecida como principal");
      
    } catch (error) {
      console.error("Error al establecer tarjeta por defecto:", error);
      alert("Error al establecer tarjeta por defecto");
    }
  };

  // Función para detectar la marca de la tarjeta
  const detectCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    
    return 'unknown';
  };

  // Función para formatear el número de tarjeta
  const formatCardNumber = (value: string): string => {
    // Remover todos los espacios y caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Limitar a 16 dígitos máximo
    const limited = cleaned.slice(0, 16);
    
    // Agregar espacios cada 4 dígitos
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Función para formatear la fecha de expiración
  const formatExpiryDate = (value: string): string => {
    // Remover caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Limitar a 4 dígitos máximo
    const limited = cleaned.slice(0, 4);
    
    // Agregar slash después de 2 dígitos
    if (limited.length >= 2) {
      return limited.slice(0, 2) + '/' + limited.slice(2);
    }
    
    return limited;
  };

  // Función para formatear CVV
  const formatCVV = (value: string): string => {
    // Remover caracteres no numéricos y limitar a 4 dígitos
    return value.replace(/\D/g, '').slice(0, 4);
  };

  //Actualizar avatar usuario

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(user?.avatar || "/placeholder.svg");

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  }

  // Función para manejar la imagen seleccionada
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string) // Previsualizar en pantalla
        if (user) {
          setUser({ ...user, avatar: reader.result as string }) // Actualizar en el estado global
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Estados para los formularios
  const [formErrorsPassword, setFormErrorsPassword] = useState<{
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  }>({})
  const [profileData, setProfileData] = useState(userData)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Estados para notificaciones
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  })

  // Estados para tarjetas
  const [savedCards, setSavedCards] = useState(initialSavedCards)
  const [newCardInfo, setNewCardInfo] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    cardName: "",
  })

  const handleSaveProfile = async () => {
    // Aquí iría la lógica para guardar el perfil
    try {
      const token = localStorage.getItem("tokenClient") // o el nombre que uses
      if (!token) {
        console.error("No hay token disponible")
        return
      }

      const response = await fetch("/api/user/update/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil")
      }

      const result = await response.json()
      toast.success("Perfil actualizado correctamente")

      setIsEditing(false)
    } catch (error) {
      console.error("Error al guardar el perfil:", error)
    }
  }

  const handleChangePassword = async () => {
    // Aquí iría la lógica para cambiar la contraseña
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await fetch("/api/user/update/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        // Intentamos parsear el JSON de errores que viene de Laravel
        const errorData = await response.json();
        if (errorData.errors) {
          setFormErrorsPassword(errorData.errors); // Mostrar errores en el formulario
        } else {
          throw new Error(errorData.message || "Error desconocido");
        }
        return;
      }

      const result = await response.json();
      toast.success(result.message);

      // Reset formulario y errores
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFormErrorsPassword({});

    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      toast.error("Error al cambiar la contraseña");
    }
  }


  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return (
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            VISA
          </div>
        )
      case "mastercard":
        return (
          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
        )
      case "amex":
      case "american express":
        return (
          <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
            AMEX
          </div>
        )
      case "discover":
        return (
          <div className="w-8 h-5 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">
            DISC
          </div>
        )
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregado":
        return "bg-green-100 text-green-800"
      case "En camino":
        return "bg-blue-100 text-blue-800"
      case "Preparando":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3F1' }}>
      {/* Header móvil optimizado */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #D64A3A 0%, #E4512F 100%)' }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <h1 className="">Mi Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Pestañas optimizadas para móvil */}
          <TabsList className="grid grid-cols-5 gap-0.5 h-auto p-0.5 rounded-lg" style={{ backgroundColor: '#F7F3F1' }}>
            <TabsTrigger 
              value="profile" 
              className="flex flex-col items-center space-y-0.5 px-1 py-2 text-[10px] data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
              style={activeTab === 'profile' ? { backgroundColor: '#D64A3A' } : {}}
            >
              <User className="w-3 h-3" />
              <span className="leading-tight">Perfil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex flex-col items-center space-y-0.5 px-1 py-2 text-[10px] data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
              style={activeTab === 'orders' ? { backgroundColor: '#D64A3A' } : {}}
            >
              <Clock className="w-3 h-3" />
              <span className="leading-tight">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cards" 
              className="flex flex-col items-center space-y-0.5 px-1 py-2 text-[10px] data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
              style={activeTab === 'cards' ? { backgroundColor: '#D64A3A' } : {}}
            >
              <CreditCard className="w-3 h-3" />
              <span className="leading-tight">Tarjetas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex flex-col items-center space-y-0.5 px-1 py-2 text-[10px] data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
              style={activeTab === 'security' ? { backgroundColor: '#D64A3A' } : {}}
            >
              <Settings className="w-3 h-3" />
              <span className="leading-tight">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex flex-col items-center space-y-0.5 px-1 py-2 text-[10px] data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
              style={activeTab === 'notifications' ? { backgroundColor: '#D64A3A' } : {}}
            >
              <Bell className="w-3 h-3" />
              <span className="leading-tight">Notificaciones</span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Perfil */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Información Personal</CardTitle>
                <CardDescription className="text-sm">Gestiona tu información personal y de contacto</CardDescription>
              </CardHeader>
              {loading || !pointsLoaded ? (
                <div className="w-full flex flex-col items-center space-y-4 p-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cargando información personal...</p>
                  </div>
                </div>
              ) : (
                <CardContent className="space-y-4">
                  {/* Avatar y información básica */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage 
                          src={user?.avatar && user.avatar !== 'null' && user.avatar !== '' ? user.avatar : undefined} 
                          alt={user?.name} 
                        />
                        <AvatarFallback className="text-xl">
                          {user?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-1 -right-1 rounded-full w-7 h-7 p-0 bg-white shadow-sm"
                            onClick={handleButtonClick}
                          >
                            <Camera className="w-3 h-3" />
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </>
                      )}
                    </div>

                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold">{user?.name} {user?.surnames}</h2>
                      <p className="text-sm" style={{ color: '#2E2523CC' }}>
                        Miembro desde{" "}
                        {new Date(user?.created_at || '').toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="text-xs">{totalOrders} pedidos</Badge>
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verificado
                        </div>
                      </div>
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                        className="mt-2"
                        style={isEditing ? { backgroundColor: '#D64A3A', borderColor: '#D64A3A', color: '#FFFFFF' } : { borderColor: 'rgba(214, 74, 58, 0.3)', color: '#D64A3A' }}
                        onMouseEnter={(e) => {
                          if (isEditing) {
                            e.currentTarget.style.backgroundColor = '#E4512F'
                            e.currentTarget.style.borderColor = '#E4512F'
                          } else {
                            e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isEditing) {
                            e.currentTarget.style.backgroundColor = '#D64A3A'
                            e.currentTarget.style.borderColor = '#D64A3A'
                          } else {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        {isEditing ? "Guardar" : "Editar"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Sección de Puntos */}
                  <div className="rounded-lg p-4 border" style={{ background: 'linear-gradient(to right, rgba(214, 74, 58, 0.1), rgba(228, 81, 47, 0.1))', borderColor: 'rgba(214, 74, 58, 0.3)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, #D64A3A, #E4512F)' }}>
                          <span className="text-white font-bold text-lg">★</span>
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: '#2E2523' }}>Mis Puntos</h3>
                          <p className="text-sm" style={{ color: '#2E2523CC' }}>Acumula puntos con cada pedido</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {loadingPoints ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D64A3A' }}></div>
                            <span className="text-sm" style={{ color: '#2E2523AA' }}>Cargando...</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold" style={{ color: '#D64A3A' }}>{currentPoints.toLocaleString()}</div>
                            <div className="text-xs" style={{ color: '#2E2523AA' }}>puntos disponibles</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(214, 74, 58, 0.3)' }}>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold" style={{ color: '#2E2523' }}>
                            {loadingPoints ? '...' : totalOrders}
                          </div>
                          <div className="text-xs" style={{ color: '#2E2523CC' }}>Total de pedidos</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold" style={{ color: '#D64A3A' }}>
                            {loadingPoints ? '...' : monthlyPointsEarned}
                          </div>
                          <div className="text-xs" style={{ color: '#2E2523CC' }}>Puntos ganados</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1" style={{ color: '#2E2523CC' }}>
                        <span>Progreso al mínimo canjeable</span>
                        <span>{currentPoints} / {minRedeemablePoints}</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: '#E0E0E0' }}>
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{
                            width: `${Math.min((currentPoints / minRedeemablePoints) * 100, 100)}%`,
                            background: 'linear-gradient(to right, #D64A3A, #E4512F)'
                          }}
                        ></div>
                      </div>
                      {currentPoints >= minRedeemablePoints && (
                        <div className="mt-2 text-center">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ¡Puedes canjear puntos!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Formulario de información personal */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="name"
                          value={user?.name || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                          disabled={!isEditing}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="surnames" className="text-sm font-medium">Apellidos</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="surnames"
                          value={user?.surnames || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, surnames: e.target.value } : null)}
                          disabled={!isEditing}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                          disabled={!isEditing}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          value={user?.telf || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, telf: e.target.value } : null)}
                          disabled={!isEditing}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        className="flex-1"
                        style={{ borderColor: 'rgba(214, 74, 58, 0.3)', color: '#D64A3A' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveProfile} 
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
                        Guardar
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Pestaña de Pedidos */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Mis Pedidos</CardTitle>
                <CardDescription className="text-sm">Revisa tus pedidos y su estado actual</CardDescription>
                <Button 
                  onClick={fetchPedidos} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-fit"
                  disabled={loadingPedidos}
                >
                  {loadingPedidos ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                      Cargando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingPedidos ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-3 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: '#E0E0E0' }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#2E2523' }}>No tienes pedidos</h3>
                    <p className="text-sm mb-4" style={{ color: '#2E2523CC' }}>
                      Cuando hagas un pedido, aparecerá aquí
                    </p>
                    <Button 
                      onClick={() => router.push('/dashboard')}
                      className="text-white"
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
                      Hacer Pedido
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {pedidos.map((pedido) => {
                      const pedidoDate = new Date(pedido.created_at);
                      const today = new Date();
                      const isToday = pedidoDate.toDateString() === today.toDateString();
                      
                      return (
                        <div 
                          key={pedido.id} 
                          className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
                            isToday 
                              ? 'shadow-sm hover:shadow-md' 
                              : ''
                          }`}
                          style={isToday ? {
                            borderColor: 'rgba(214, 74, 58, 0.4)',
                            backgroundColor: 'rgba(214, 74, 58, 0.1)'
                          } : {
                            borderColor: '#E0E0E0',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (isToday) {
                              e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.15)'
                            } else {
                              e.currentTarget.style.backgroundColor = '#F7F3F1'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isToday) {
                              e.currentTarget.style.backgroundColor = 'rgba(214, 74, 58, 0.1)'
                            } else {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          }}
                          onClick={() => openPedidoModal(pedido)}
                        >
                          <div className="space-y-3">
                            {/* Header con referencia y precio */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="font-medium text-sm sm:text-base">Referencia: {pedido.referencia}</span>
                                {isToday && (
                                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium w-fit" style={{ backgroundColor: 'rgba(214, 74, 58, 0.1)', color: '#D64A3A' }}>
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#D64A3A' }}></div>
                                    <span>Hoy</span>
                                  </div>
                                )}
                              </div>
                              <p className="font-bold text-lg sm:text-xl" style={{ color: '#D64A3A' }}>€{parseFloat(pedido.total).toFixed(2)}</p>
                            </div>
                          
                            {/* Fecha y mesa */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                              <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(pedido.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Mesa: {pedido.mesa?.name || 'N/A'}
                              </p>
                            </div>
                            
                            {/* Productos - responsive */}
                            <div className="space-y-1">
                              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                                {pedido.dishes && pedido.dishes.slice(0, 3).map((dish: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm bg-white rounded px-2 py-1 border">
                                    <span className="text-gray-700 truncate flex-1 mr-2">{dish.name}</span>
                                    <span className="text-gray-500 font-medium">x{dish.pivot.cantidad}</span>
                                  </div>
                                ))}
                              </div>
                              {pedido.dishes && pedido.dishes.length > 3 && (
                                <div className="flex items-center justify-center pt-2">
                                  <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    +{pedido.dishes.length - 3} productos más
                                  </span>
                                </div>
                              )}
                              {pedido.dishes && pedido.dishes.length <= 3 && pedido.dishes.length > 0 && (
                                <div className="flex items-center justify-center pt-2">
                                  <span className="text-xs text-gray-400">
                                    Toca para ver detalles
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Tarjetas */}
          <TabsContent value="cards" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Mis Tarjetas</CardTitle>
                    <CardDescription className="text-sm">Gestiona tus métodos de pago</CardDescription>
                  </div>
                  <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-8 px-3">
                        <Plus className="w-3 h-3 mr-1" />
                        <span className="text-xs">Añadir</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg">Añadir nueva tarjeta</DialogTitle>
                        <DialogDescription className="text-sm">Añade una nueva tarjeta de crédito o débito</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName" className="text-sm font-medium">Nombre para la tarjeta</Label>
                          <Input
                            id="cardName"
                            placeholder="Ej: Tarjeta personal..."
                            value={newCardInfo.cardName}
                            onChange={(e) => setNewCardInfo({ ...newCardInfo, cardName: e.target.value })}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className="text-sm font-medium">Número de tarjeta</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={newCardInfo.number}
                            onChange={(e) => setNewCardInfo({ ...newCardInfo, number: formatCardNumber(e.target.value) })}
                            className="h-10 text-sm"
                            maxLength={19} // 16 dígitos + 3 espacios
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="expiry" className="text-sm font-medium">Vencimiento</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/AA"
                              value={newCardInfo.expiry}
                              onChange={(e) => setNewCardInfo({ ...newCardInfo, expiry: formatExpiryDate(e.target.value) })}
                              className="h-10 text-sm"
                              maxLength={5} // MM/AA
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={newCardInfo.cvv}
                              onChange={(e) => setNewCardInfo({ ...newCardInfo, cvv: formatCVV(e.target.value) })}
                              className="h-10 text-sm"
                              maxLength={4} // CVV puede ser 3 o 4 dígitos
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardHolderName" className="text-sm font-medium">Nombre en la tarjeta</Label>
                          <Input
                            id="cardHolderName"
                            placeholder="Nombre como aparece en la tarjeta"
                            value={newCardInfo.name}
                            onChange={(e) => setNewCardInfo({ ...newCardInfo, name: e.target.value })}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddCardDialog(false)} 
                            className="flex-1 h-10 text-sm"
                            disabled={addingCard}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleAddCard} 
                            className="flex-1 h-10 text-sm text-white"
                            style={{ backgroundColor: '#D64A3A', borderColor: '#D64A3A' }}
                            onMouseEnter={(e) => {
                              if (!addingCard) {
                                e.currentTarget.style.backgroundColor = '#E4512F'
                                e.currentTarget.style.borderColor = '#E4512F'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!addingCard) {
                                e.currentTarget.style.backgroundColor = '#D64A3A'
                                e.currentTarget.style.borderColor = '#D64A3A'
                              }
                            }}
                            disabled={addingCard}
                          >
                            {addingCard ? (
                              <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Guardando...
                              </>
                            ) : (
                              'Añadir tarjeta'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loadingCards ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando tarjetas...</span>
                  </div>
                ) : paymentCards.length > 0 ? (
                  <div className="space-y-3">
                    {paymentCards.map((card) => (
                      <div key={card.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {getCardIcon(card.brand)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium text-sm truncate">{card.cardholder_name || 'Tarjeta'}</p>
                                  {card.is_default && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                      Principal
                                    </Badge>
                                  )}
                                  {card.is_expired && (
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                      Expirada
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  •••• •••• •••• {card.last_four_digits} • Vence {card.expiry_formatted}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          {!card.is_default && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSetDefaultCard(card.id)}
                              className="w-full text-xs h-8"
                            >
                              Hacer principal
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-2">No tienes tarjetas guardadas</h3>
                    <p className="text-sm text-gray-600 mb-4">Añade una tarjeta para hacer tus pedidos más rápido</p>
                    <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
                      <DialogTrigger asChild>
                        <Button className="h-10 px-4">
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="text-sm">Añadir tu primera tarjeta</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-lg">Añadir nueva tarjeta</DialogTitle>
                          <DialogDescription className="text-sm">Añade una nueva tarjeta de crédito o débito</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardName" className="text-sm font-medium">Nombre para la tarjeta</Label>
                            <Input
                              id="cardName"
                              placeholder="Ej: Tarjeta personal..."
                              value={newCardInfo.cardName}
                              onChange={(e) => setNewCardInfo({ ...newCardInfo, cardName: e.target.value })}
                              className="h-10 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber" className="text-sm font-medium">Número de tarjeta</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={newCardInfo.number}
                              onChange={(e) => setNewCardInfo({ ...newCardInfo, number: e.target.value })}
                              className="h-10 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="expiry" className="text-sm font-medium">Vencimiento</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/AA"
                                value={newCardInfo.expiry}
                                onChange={(e) => setNewCardInfo({ ...newCardInfo, expiry: e.target.value })}
                                className="h-10 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={newCardInfo.cvv}
                                onChange={(e) => setNewCardInfo({ ...newCardInfo, cvv: e.target.value })}
                                className="h-10 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardHolderName" className="text-sm font-medium">Nombre en la tarjeta</Label>
                            <Input
                              id="cardHolderName"
                              placeholder="Nombre como aparece en la tarjeta"
                              value={newCardInfo.name}
                              onChange={(e) => setNewCardInfo({ ...newCardInfo, name: e.target.value })}
                              className="h-10 text-sm"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowAddCardDialog(false)} className="flex-1 h-10 text-sm">
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleAddCard} 
                              className="flex-1 h-10 text-sm text-white"
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
                              Añadir tarjeta
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Seguridad */}
          <TabsContent value="security" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
                <CardDescription className="text-sm">Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="pr-10 h-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    {formErrorsPassword.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{formErrorsPassword.currentPassword[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="pr-10 h-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    {formErrorsPassword.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{formErrorsPassword.newPassword[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="pr-10 h-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    {formErrorsPassword.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{formErrorsPassword.confirmPassword[0]}</p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  className="w-full h-10 text-sm text-white"
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
                  Cambiar contraseña
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <Card className="opacity-50 pointer-events-none border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Configuración de Cuenta</CardTitle>
                  <CardDescription className="text-sm">
                    Gestiona la configuración de seguridad de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Autenticación de dos factores</p>
                      <p className="text-xs text-gray-600">Añade una capa extra de seguridad</p>
                    </div>
                    <Switch className="flex-shrink-0" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Sesiones activas</p>
                      <p className="text-xs text-gray-600">Gestiona dónde has iniciado sesión</p>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0 h-8 px-3 text-xs">
                      Ver sesiones
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Overlay con mensaje */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="bg-white shadow-md rounded-lg p-3 mx-4">
                  <span className="text-gray-800 font-medium text-sm text-center block">
                    En desarrollo para próximas versiones
                  </span>
                </div>
              </div>
            </div>

          </TabsContent>

          {/* Pestaña de Notificaciones */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Preferencias de Notificación</CardTitle>
                <CardDescription className="text-sm">Controla qué notificaciones quieres recibir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Actualizaciones de pedidos</p>
                    <p className="text-xs text-gray-600">Recibe notificaciones sobre el estado de tus pedidos</p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Promociones y ofertas</p>
                    <p className="text-xs text-gray-600">Recibe información sobre descuentos y ofertas especiales</p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Newsletter</p>
                    <p className="text-xs text-gray-600">Recibe nuestro boletín con novedades y recetas</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                  />
                </div>

                <Separator />

                <Button className="w-full">Guardar preferencias</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de detalles del pedido */}
      <Dialog open={showPedidoModal} onOpenChange={setShowPedidoModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Detalles del Pedido
            </DialogTitle>
            <DialogDescription>
              {selectedPedido && `Referencia: ${selectedPedido.referencia}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-4">
              {/* Información del pedido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPedido.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Mesa</p>
                  <p className="text-sm text-gray-900">{selectedPedido.mesa?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-lg font-bold text-orange-500">€{parseFloat(selectedPedido.total).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <p className="text-sm text-gray-900">En preparación</p>
                </div>
              </div>

              {/* Lista de productos */}
              <div>
                <h3 className="text-lg font-medium mb-3">Productos del pedido</h3>
                <div className="space-y-2">
                  {selectedPedido.dishes && selectedPedido.dishes.map((dish: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base text-gray-900">{dish.name}</p>
                        {dish.description && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">{dish.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span className="text-sm text-gray-600">x{dish.pivot.cantidad}</span>
                        <span className="font-medium text-sm sm:text-base text-gray-900">
                          €{(parseFloat(dish.price) * dish.pivot.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen del total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total del pedido:</span>
                  <span className="text-orange-500">€{parseFloat(selectedPedido.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de éxito/error */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {successMessage.includes('Error') ? (
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-4">
            <p className={`text-sm ${successMessage.includes('Error') ? 'text-red-600' : 'text-green-600'} mb-4`}>
              {successMessage}
            </p>
            
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className={`w-full ${
                successMessage.includes('Error') 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {successMessage.includes('Error') ? 'Entendido' : '¡Perfecto!'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
