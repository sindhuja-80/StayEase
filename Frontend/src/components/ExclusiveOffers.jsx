import React from 'react'
import Title from './Title'
import {assets} from "../assets/assets.js"

const ExclusiveOffers = () => {
  const exclusiveOffers = [] // No dummy data - offers should come from API
  
  if (exclusiveOffers.length === 0) {
    return null // Don't show section if no offers
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row items-center justify-between '>
        <Title align='left' title='Exclusive Offers' subTitle='Take advanage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.'></Title>
        <button className='group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12'>View all Offers
          <img src={assets.arrowIcon} className='group-hover:translate-x-1 transition-all'></img>
        </button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pl-3 pr-3'>
        {exclusiveOffers.map((item)=>(
          <div key={item._id} className='group relative flex flex-col items-start justify-between gap-1 pt-12 md:pt-16 px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center' style={{backgroundImage:`url(${item.image})`}}>
            <p className='px-3 py-1 absolute top-4 left-4 text-xs bg-white text-gray-800 font-medium rounded-full'>{item.priceOff}% OFF</p>
            <div>
              <p className='text-2xl font-medium font-playfair'>{item.title}</p>
              <p className=''>{item.description}</p>
              <p className='text-xs text-white/70 mt-3'>Expires {item.expiryDate}</p>
            </div>
            <button className='flex items-center gap-2 font-medium cursor-pointer mt-4 mb-5'>
              View Offers
              <img className='invert group-hover:translate-x-1 transition-all' src={assets.arrowIcon} alt="arrow-icon"></img>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExclusiveOffers
