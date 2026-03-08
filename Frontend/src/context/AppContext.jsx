import axios from "axios"
import { useContext, useEffect, useState, createContext } from "react"
import { useNavigate } from "react-router-dom"
import { useUser, useAuth } from "@clerk/clerk-react"
import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 

axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

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

      const { data } = await axios.get("/api/rooms")

      if (data.success) {

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
            name: room.hotel_name ,
            address: room.hotel_address,
            city: room.hotel_city,
            owner: {
              image: room.owner_image
            }
          }
        }))

        setRooms(formattedRooms)

      } else {
        toast.error(data.message || "Failed to load rooms")
      }

    } catch (error) {
      console.error("Rooms fetch error:", error)
      toast.error("Cannot connect to backend")
    }
  }


  // FETCH USER
  const fetchUser = async () => {
    try {

      const token = await getToken()
      if (!token) return

      const { data } = await axios.get(
        "/api/user",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        setIsOwner(data.role === "owner")
        setSearchedCities(data.recentSearchedCities || [])
      }

    } catch (error) {
      console.error("User fetch error:", error)
    }
  }


  // LOAD USER
  useEffect(() => {
    if (user) {
      fetchUser()
    }
  }, [user])


  // LOAD ROOMS
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
      <Toaster position="top-center" />
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)