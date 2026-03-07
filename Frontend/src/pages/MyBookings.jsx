import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets.js'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { axios, getToken, user } = useAppContext()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/bookings/user', {
          headers: { Authorization: `Bearer ${await getToken()}` },
        })
        if (data.success) {
          setBookings(data.bookings)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      fetchBookings()
    }
  }, [user, axios, getToken])
  return (
    <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-12'>
      <Title title="My Bookings" subTitle="Easily manage your past ,current,and upcoming hotel reservations in one place.Plan your trips seamlessly with just a few clicks" align='left'></Title>
<div className="max-w-6xl mt-6 w-full text-gray-800">

  <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
    <div>Hotels</div>
    <div>Date & Timings</div>
    <div>Payment</div>
  </div>

  {bookings?.map((booking, index) => (
    <div
      key={booking.id || index}
      className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 py-6"
    >
      <div className="flex flex-col md:flex-row">
        <img
          src={booking.images?.[0] || "/fallback.jpg"}
          alt="hotel-img"
          className="w-full md:w-44 h-32 rounded shadow object-cover"
        />

        <div className="flex flex-col gap-1.5 mt-3 md:mt-0 md:ml-4">
          <p className="font-playfair text-2xl">
            {booking?.name}
            <span className="font-inter text-sm">
              {" "}
              ({booking.room_type})
            </span>
          </p>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <img src={assets.locationIcon} alt="location-icon" />
            <span>{booking.address}</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <img src={assets.guestsIcon} alt="guests-icon" />
            <span>Guests: {booking.guests}</span>
          </div>

          <p className="font-semibold">Total: ₹{booking.total_price}</p>
        </div>
      </div>

      {/* Date & Timings */}
      <div className="flex flex-col justify-center text-sm text-gray-600 mt-3 md:mt-0">
        <p>
          Check-In:{" "}
          {new Date(booking?.check_in_date).toDateString()}
        </p>
        <p>
          Check-Out:{" "}
          {new Date(booking?.check_out_date).toDateString()}
        </p>
      </div>

      {/* Payment */}
      <div className="flex flex-col justify-center mt-3 md:mt-0">
       <div className='flex items-center gap-2'>
        <div className={`h-3 w-3 rounded-full ${booking.is_paid ? "bg-green-500" : "bg-red-500"}`}></div>
        <p className={`text-sm ${booking.is_paid ? "text-green-600" : "text-red-600"}`}>{booking.is_paid? "Paid" : "UnPaid"}</p>
       </div>
       {!booking.is_paid && (
        <button className='px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer'>Pay Now</button>
       )}
      </div>

    </div>
  ))}

  {/* Empty State */}
  {bookings?.length === 0 && (
    <p className="text-center text-gray-500 py-6">
      No bookings found
    </p>
  )}

</div>
    </div>
  )
}

export default MyBookings
