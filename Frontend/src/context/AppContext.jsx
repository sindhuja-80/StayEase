import axios from "axios"
import { useContext, useEffect, useState, createContext } from "react"
import { useNavigate } from "react-router-dom"
import { useUser, useAuth } from "@clerk/clerk-react"
import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"

// Backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
axios.defaults.baseURL = API_BASE_URL
console.log("🔗 API Base URL:", API_BASE_URL)

const AppContext = createContext()

export const AppProvider = ({ children }) => {

  const currency = import.meta.env.VITE_CURRENCY || "$"
  const navigate = useNavigate()

  const { user } = useUser()
  const { getToken } = useAuth()

  const [isOwner, setIsOwner] = useState(false)
  const [showHotelReg, setShowHotelReg] = useState(false)
  const [searchedCities, setSearchedCities] = useState([])
  const [rooms, setRooms] = useState([])

  // FETCH ROOMS
  const fetchRooms = async () => {
    try {

      console.log("📡 Fetching rooms from:", `${API_BASE_URL}/api/rooms`)

      const { data } = await axios.get("/api/rooms")

      console.log("✅ Rooms fetched:", data)

      if (data.success) {

        // Convert backend fields → frontend fields
        const formattedRooms = (data.rooms || []).map(room => ({
          id: room.id,
          roomType: room.room_type,
          pricePerNight: Number(room.price_per_night),
          amenities: room.amenities || [],
          images: room.images || [],
          isAvailable: room.is_available,
          createdAt: room.created_at,

          hotel: {
            id: room.hotel,
            name: room.hotel_name || "Hotel",
            address: room.hotel_address || "",
            city: room.hotel_city || "",
            owner: {
              image: room.owner_image || ""
            }
          }
        }))

        setRooms(formattedRooms)

        console.log("✅ Rooms formatted:", formattedRooms.length)

      } else {

        console.warn("❌ API returned error:", data.message)
        toast.error(data.message || "Failed to load rooms")

      }

    } catch (error) {

      console.error("❌ Network Error fetching rooms:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      })

      toast.error("Network Error: Cannot connect to backend")

    }
  }

  // FETCH USER
  const fetchUser = async () => {
    try {

      const token = await getToken()

      console.log("📡 Fetching user")

      const { data } = await axios.get(
        "/api/user",
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {

        setIsOwner(data.role === "hotelOwner")
        setSearchedCities(data.recentSearchedCities || [])

        console.log("✅ User loaded:", data.role)

      } else {

        console.warn("⚠️ User fetch failed, retrying...")

        setTimeout(() => {
          fetchUser()
        }, 3000)

      }

    } catch (error) {

      console.error("❌ Network Error fetching user:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })

    }
  }

  useEffect(() => {
    if (user) fetchUser()
  }, [user])

  useEffect(() => {
    fetchRooms()
  }, [])

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    fetchRooms
  }

  return (
    <AppContext.Provider value={value}>
      <Toaster position="top-right" />
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)