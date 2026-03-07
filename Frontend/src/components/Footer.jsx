import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
const Footer = () => {
  return (
        <div className=' bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                           <Link to="/" className="flex items-center gap-2">
                    <img width="45" height="50" viewBox="0 0 157 40" fill="none" 
                    src="https://img.freepik.com/free-vector/booking-hotel-online-cartoon-icon-illustration-business-technology-icon-concept_138676-2126.jpg?semt=ais_user_personalization&w=740&q=80" className="rounded-full  h-11">
                             </img>
                             <p className={`text-2xl font-semibold `}>
  StayEase
</p></Link>
                    <p className='text-sm'>
                       Discover the world's most extraordinary places to stay, from boutique hotels to luxury villas and private islands.
                    </p>
                    <div className='flex items-center gap-3 mt-4'>
                       
                       <img src={assets.instagramIcon} alt='instagram-icon' className='w-6'></img>
                        <img src={assets.linkendinIcon} alt='instagram-icon' className='w-6'></img>
                         <img src={assets.twitterIcon} alt='instagram-icon' className='w-6'></img>
                    </div>
                </div>

                <div>
                    <p className=' font-playfair text-lg text-gray-800'>COMPANY</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Press</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Partners</a></li>
                    </ul>
                </div>

                <div>
                    <p className=' font-playfair text-lg text-gray-800'>SUPPORT</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Safety Information</a></li>
                        <li><a href="#">Cancellation Options</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Accessibility</a></li>
                    </ul>
                </div>

                <div className='max-w-80'>
                    <p className='text-lg text-gray-800 font-playfair'>STAY UPDATED</p>
                    <p className=' font-playfair mt-3 text-sm'>
                        Subscribe to our newsletter for inspiration and special offers.
                    </p>
                    <div className='flex items-center mt-4'>
                        <input type="text" className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none' placeholder='Your email' />
                        <button className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r'>
                       <img src={assets.arrowIcon} alt='arrow-icon' className='invert transition-all w-3.5'></img>
                        </button>
                    </div>
                </div>
            </div>
            <hr className='border-gray-300 mt-8' />
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} <a href="https://prebuiltui.com">StayEase</a>. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                    <li><a href="#">Sitemap</a></li>
                </ul>
            </div>
        </div>

  )
}

export default Footer
