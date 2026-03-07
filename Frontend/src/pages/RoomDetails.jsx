import React, { useEffect, useState } from 'react'
import { assets, facilityIcons, roomCommonData } from '../assets/assets.js';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import toast from 'react-hot-toast';

const RoomDetails = () => {
    const { id } = useParams();
    const { rooms, getToken, axios, navigate } = useAppContext();
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(false);

    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);

    // check if the room is available
    const checkAvailability = async (e) => {
        try {
            if (checkInDate >= checkOutDate) {
                toast.error("Check-Out date must be greater than Check-In date");
            }

            const { data } = await axios.post('/api/bookings/check-availability', {
                room: id,
                checkInDate,
                checkOutDate
            });

            if (data.success) {
                if (data.isAvailable) {
                    setIsAvailable(true);
                    toast.success("Room is available for the selected dates");
                } else {
                    setIsAvailable(false);
                    toast.error("Room is not available for the selected dates");
                }
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    // onSubmitHandler function to check availability and book the room
    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            if (!isAvailable) {
                return checkAvailability();
            } else {

                const token = await getToken(); 

                const { data } = await axios.post(
                    '/api/bookings/book',
                    {
                        room: id,
                        checkInDate,
                        checkOutDate,
                        guests,
                        paymentMethod: 'Pay at hotel'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                if (data.success) {
                    toast.success("Room booked successfully");
                    navigate('/my-bookings');
                    scrollTo(0, 0);
                } else {
                    toast.error(data.message);
                }
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        const room = rooms.find(room => String(room.id) === id);
        room && setRoom(room);
        room && setMainImage(room.images && room.images.length > 0 ? room.images[0] : '/room-placeholder.png');
    }, [id, rooms]);

    return room && (
        <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
                <h1 className='text-3xl md:text-4xl font-playfair'>
                    {room.hotel.name}
                    <span className='font-inter text-sm'> {room.roomType}</span>
                </h1>
                <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>
                    20% off
                </p>
            </div>

            <div className='flex items-center gap-1 mt-2'>
                <StarRating />
                <p className='ml-2'>200+ reviews</p>
            </div>

            <div className='flex items-center gap-1 text-gray-500 mt-2'>
                <img src={assets.locationIcon} alt="location-icon" />
                <span>{room.hotel.address}</span>
            </div>

            <div className='flex flex-col lg:flex-row mt-6 gap-6'>
                <div className='lg:w-1/2 w-full'>
                    <img
                        src={mainImage}
                        alt="room-image"
                        className='w-full rounded-xl shadow-lg object-cover'
                        onError={(e) => e.target.src = '/room-placeholder.png'}
                    />
                </div>

                <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
                    {room?.images?.length > 1 && room.images.map((image, index) => (
                        <img
                            src={image}
                            alt='room image'
                            key={index}
                            onClick={() => setMainImage(image)}
                            className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 'outline-3 outline-orange-500'}`}
                        />
                    ))}
                </div>
            </div>

            <div className='flex flex-col md:flex-row md:justify-between mt-10'>
                <div>
                    <h1 className='text-3xl md:text-4xl font-playfair'>
                        Experience Luxury Like Never Before
                    </h1>
                    <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                        {room.amenities.map((item, index) => (
                            <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                                <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                                <p className='text-xs'>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className='text-2xl font-medium'>
                   ₹{room.pricePerNight}/night
                </p>
            </div>

            <form
                onSubmit={onSubmitHandler}
                className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'
            >
                <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
                    <div className='flex flex-col'>
                        <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
                        <input
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            type="date"
                            id='checkInDate'
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
                        <input
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate}
                            disabled={!checkInDate}
                            type="date"
                            id='checkOutDate'
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor="guests" className='font-medium'>Guests</label>
                        <input
                            onChange={(e) => setGuests(e.target.value)}
                            value={guests}
                            type="number"
                            id='guests'
                            className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />
                    </div>
                </div>

                <button
                    type='submit'
                    className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'
                >
                    {isAvailable ? 'Book Now' : 'Check Availability'}
                </button>
            </form>

            <div className='mt-25 space-y-4'>
                {roomCommonData.map((spec, index) => (
                    <div key={index} className='flex items-start gap-2'>
                        <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5' />
                        <div>
                            <p className='text-base'>{spec.title}</p>
                            <p className='text-gray-500'>{spec.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
                <p>
                    Guests will be allocated on the ground floor according to availability...
                </p>
            </div>

            <div className='flex flex-col items-start gap-4'>
                <div className='flex gap-4'>
                    <img src={room.hotel.owner.image} className='h-14 w-14 md:h-18 md:w-18 rounded-full' />
                    <div>
                        <p>Hosted by {room.hotel.name}</p>
                        <div className='flex items-center mt-1'>
                            <StarRating />
                            <p className='ml-2'>200+ reviews</p>
                        </div>
                    </div>
                </div>
                <button className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull'>
                    Contact Now
                </button>
            </div>
        </div>
    );
};

export default RoomDetails;