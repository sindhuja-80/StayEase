import React, { useMemo, useState } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onChange(e.target.checked, label)}
            />
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input
                type="radio"
                name='sortOption'
                checked={selected}
                onChange={() => onChange(label)}
            />
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const AllRooms = () => {

    const { rooms, navigate, currency } = useAppContext()
    const [searchParams, setSearchParams] = useSearchParams()

    const [selectedFilters, setSelectedFilters] = useState({
        roomType: [],
        priceRange: [],
    })

    const [selectedSort, setSelectedSort] = useState("")
    const [openFilters, setOpenFilters] = useState(false)

    const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"]
    const priceRanges = ["0 to 500", "500 to 1000", "1000 to 2000", "2000 to 3000"]
    const sortOptions = ["Price: Low to High", "Price: High to Low", "Newest First"]

    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters(prev => {
            const updated = { ...prev }
            if (checked) updated[type].push(value)
            else updated[type] = updated[type].filter(item => item !== value)
            return updated
        })
    }

    const handleSortChange = (option) => setSelectedSort(option)

    const matchesRoomType = (room) =>
        selectedFilters.roomType.length === 0 ||
        selectedFilters.roomType.includes(room.roomType)

    const matchesPriceRange = (room) =>
        selectedFilters.priceRange.length === 0 ||
        selectedFilters.priceRange.some(range => {
            const [min, max] = range.split(" to ").map(Number)
            return room.pricePerNight >= min && room.pricePerNight <= max
        })

    const matchesDestination = () => true

    const sortRooms = (a, b) => {
        if (selectedSort === "Price: Low to High") return a.pricePerNight - b.pricePerNight
        if (selectedSort === "Price: High to Low") return b.pricePerNight - a.pricePerNight
        if (selectedSort === "Newest First") return new Date(b.createdAt) - new Date(a.createdAt)
        return 0
    }

    const filteredRooms = useMemo(() => {
        return rooms
            .filter(room =>
                matchesRoomType(room) &&
                matchesPriceRange(room) &&
                matchesDestination(room)
            )
            .sort(sortRooms)
    }, [rooms, selectedFilters, selectedSort])

    const clearFilters = () => {
        setSelectedFilters({ roomType: [], priceRange: [] })
        setSelectedSort("")
        setSearchParams({})
    }

    return (
        <div className='flex flex-col-reverse lg:flex-row pt-28 px-4 md:px-16 lg:px-24 xl:px-32'>

            <div>

                {filteredRooms.length === 0 ? (
                    <p className='text-gray-500 mt-10'>No Rooms Available</p>
                ) : (
                    filteredRooms.map(room => (
                        <div
                            key={room.id}
                            className='flex flex-col md:flex-row py-10 gap-6 border-b'
                        >

                            <img
                                onClick={() => { navigate(`/rooms/${room.id}`); scrollTo(0, 0) }}
                                src={room.images[0]}
                                className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
                            />

                            <div className='md:w-1/2 flex flex-col gap-2'>

                                <p className='text-gray-800 text-3xl font-playfair cursor-pointer'>
                                    {room.roomType}
                                </p>

                                <div className='flex items-center'>
                                    <StarRating />
                                </div>

                                <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                                    {room.amenities.map((item, index) => (
                                        <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                                            <img src={facilityIcons[item]} className='w-5 h-5' />
                                            <p className='text-xs'>{item}</p>
                                        </div>
                                    ))}
                                </div>

                                <p className='text-xl font-medium text-gray-700'>
                                    {currency}{room.pricePerNight} /night
                                </p>

                            </div>
                        </div>
                    ))
                )}

            </div>
        </div>
    )
}

export default AllRooms