import React from 'react'
import Title from './Title'
import { assets } from '../assets/assets.js'
import StarRating from './StarRating.jsx'

const Testimonials = () => {
  const testimonials = [] // No dummy data - testimonials should come from API
  
  if (testimonials.length === 0) {
    return null // Don't show section if no testimonials
  }

  return (
    <div className='flex flex-col items-centr px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30'>
      <Title title="Review"  subTitle="Hear from travelers who experienced comfort and luxury."></Title>
      <div className="flex flex-wrap items-center  gap-6 mt-20">
   {testimonials.map((testimonial)=>(
    <div key={testimonial.id} className='bg-white p-6 rounded-xl shadow '>
        <div className='flex items-center gap-3' >
            <img className='w-12 h-12 rounded-full' src={testimonial.image} alt={testimonial.name}></img>
            <div>
                <p className='font-playfair text-xl'>
                    {testimonial.name}
                </p>
                <p className='text-gary-500'>{testimonial.address}</p>
            </div>
        </div>
        <div className='flex items-center gap-1 mt-4'>
            <StarRating></StarRating>
        </div>
        <p className='text-gary-500 max-w-90 mt-4'>{testimonial.review}</p>
    </div>
   )
   )}
</div>
    </div>
  )
}

export default Testimonials
