import React from 'react'
import { assets } from '../assets/assets.js'
import { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

const Hero = () => {
  const {navigate,getToken,axios,setSearchedCities}=useAppContext()
  const [destination,setDestination]=useState("")

  const onSearch=async (e)=>{
    e.preventDefault()
    navigate(`/rooms?destination=${destination}`)
    // call api to save this city in user's recent searches
    await axios.post('/api/user/store-recent-searches',{recentSearchedCity:destination},{headers:{Authorization:`Bearer ${await getToken()}`}})

    // add destination to recent searches  of cities max 3 recent searches
    setSearchedCities(prevSearchedCities => {
      const updatedSearchedCities = [destination, ...prevSearchedCities]
      if (updatedSearchedCities.length > 3) {
        updatedSearchedCities.shift() // remove the oldest search if more than 3
      } return updatedSearchedCities
  })
}
    const cities = ["Hyderabad", "Mumbai", "Delhi", "Chennai", "Bangalore"];
  return (
   <div className="relative h-screen flex items-center ">
  <div className="absolute inset-0 bg-[url('/src/assets/heroImage.jpg')] bg-cover bg-center"></div>
  <div className="absolute inset-0 bg-black/60"></div>
  <div className="relative z-10 flex flex-col items-start px-6 md:px-16 lg:px-24 xl:px-32 text-white max-w-2xl">
    
    <p className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-medium mt-20">
      Indulge in Timeless Comfort
    </p>

    <h1 className="font-playfair text-3xl md:text-6xl font-bold leading-tight mt-5">
      Find Your Perfect Stay
    </h1>

    <p className="mt-4 text-sm md:text-lg text-gray-200">
      Book your perfect stay with ease. Discover top-rated hotels, seamless booking, and unforgettable experiences—all in one place.
    </p>
        <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-lg px-6 py-4  flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto mt-8'>

            <div>
                <div className='flex items-center gap-2'>
                   <img src={assets.calenderIcon} alt='' className='h-4'></img>
                   <label htmlFor='destinationInput'>Destination</label>
                </div>
                <input onChange={(e)=>setDestination(e.target.value)} value={destination} list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />
                <datalist id='destinations'>{cities.map((city,index)=>(
                    <option value={city} key={index}></option>
                ))}</datalist>
            </div>

            <div>
                <div className='flex items-center gap-2'>
                  <img className='h-4' src={assets.calenderIcon}></img>
                    <label htmlFor="checkIn">Check in</label>
                </div>
                <input id="checkIn" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img className='h-4' src={assets.calenderIcon}></img>
                    <label htmlFor="checkOut">Check out</label>
                </div>
                <input id="checkOut" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                <label htmlFor="guests">Guests</label>
                <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
            </div>

            <button className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
             <img src={assets.searchIcon} alt='search' className='h-7'></img>
                <span>Search</span>
            </button>
        </form>
    
  </div>
</div>
  )
}

export default Hero
