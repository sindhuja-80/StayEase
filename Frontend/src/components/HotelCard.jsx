import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const HotelCard = ({ room, index }) => {
   if (!room) return null;
   // Handle both old structure (room.hotel.name) and new API structure (room.name from joined query)
   const hotelName = room.hotel?.name || room.name
   const hotelAddress = room.hotel?.address || room.address
   const price = room.price_per_night || room.pricePerNight
   const roomId = room.id || room._id
   const roomImage = room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80'
  return (
    <Link 
      to={'/rooms/' + roomId} 
      onClick={() => window.scrollTo(0, 0)} 
      className="block relative max-w-70 w-full bg-white rounded-xl shadow-md overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.05)]"
    >
      <img
        src={roomImage}
        alt="room"
        className="w-full h-48 object-cover"
        onError={(e) => e.target.src = '/room-placeholder.png'}
      />
      {index % 2 === 0 && (
        <p className="absolute top-3 left-3 px-3 py-1 text-xs bg-white text-gray-800 font-medium rounded-full shadow">
          Best Seller
        </p>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="font-playfair text-lg font-semibold text-gray-800">
            {hotelName}
          </p>

          <div className="flex items-center gap-1 text-sm">
            <img src={assets.starIconFilled} alt="star" className="w-4 h-4" />
            <span>4.5</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <img src={assets.locationIcon} alt="location" className="w-4 h-4" />
          <span>{hotelAddress}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p>
            <span className="text-lg font-semibold text-gray-800">
              ₹{price}
            </span>{" "}
            /night
          </p>

          <button
            onClick={(e) => e.preventDefault()}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Book Now
          </button>
        </div>

      </div>
    </Link>
  )
}

export default HotelCard