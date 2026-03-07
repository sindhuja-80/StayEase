import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ListRoom = () => {

  const [rooms, setRooms] = useState([])
  const { axios, getToken, user, currency } = useAppContext()

  const fetchRooms = async () => {
    try {

      const { data } = await axios.get('/api/rooms/owner', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setRooms(data.rooms)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleAvailability = async (roomId) => {

    const { data } = await axios.post(
      '/api/rooms/toggle-availability',
      { roomId },
      { headers: { Authorization: `Bearer ${await getToken()}` } }
    )

    if (data.success) {
      toast.success(data.message)
      fetchRooms()
    } else {
      toast.error(data.message)
    }

  }

  useEffect(() => {
    if (user) fetchRooms()
  }, [user])

  return (

    <div>

      <Title align='left' title='Room listings' />

      <div className='mt-5'>

        {rooms.map((item) => (

          <div key={item.id} className='flex justify-between border-b py-3'>

            <p>{item.room_type}</p>

            <p>{currency} {item.price_per_night}</p>

            <input
              type="checkbox"
              checked={item.is_available}
              onChange={() => toggleAvailability(item.id)}
            />

          </div>

        ))}

      </div>

    </div>

  )
}

export default ListRoom