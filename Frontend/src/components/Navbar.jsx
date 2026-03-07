import React from "react";
import { Link, useLocation,} from "react-router-dom";
import {assets} from "../assets/assets.js"
import { useClerk, UserButton, SignIn} from "@clerk/clerk-react";
import { useEffect,useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";

const BookIcon = () => (
  <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
  </svg>
);

const Navbar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Hotels', path: '/rooms' },
        { name: 'Reviews', path: '/' },
        { name: 'About', path: '/' },
    ];


    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);

    const {openSignIn}= useClerk()
    const location=useLocation()

    const {user,navigate,isOwner,setShowHotelReg}=useAppContext()

    const handleLoginClick = () => {
        console.log('Login button clicked, opening sign-in...')
        if (openSignIn && typeof openSignIn === 'function') {
            try {
                openSignIn()
            } catch (error) {
                console.error('Error calling openSignIn:', error)
                setShowSignIn(true)
            }
        } else {
            console.log('openSignIn not available, showing fallback')
            setShowSignIn(true)
        }
    }

   useEffect(() => { 
    if(location.pathname !== "/"){
        setIsScrolled(true)
        return
    }else{
        setIsScrolled(false)
    }
    setIsScrolled(prev=>location.pathname!=='/' ?true : prev)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    return (
        <>
            <nav className={`fixed top-0 left-0  w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4" : "py-4 md:py-6"}`}>

                <Link to="/" className="flex items-center gap-2">
                    <img width="45" height="50" viewBox="0 0 157 40" fill="none" 
                    src="https://img.freepik.com/free-vector/booking-hotel-online-cartoon-icon-illustration-business-technology-icon-concept_138676-2126.jpg?semt=ais_user_personalization&w=740&q=80" className="rounded-full h-11">
                             </img>
                             <p className={`text-2xl font-semibold ${isScrolled ? "text-black" : "text-white"}`}>
  StayEase
</p>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                            {link.name}
                            <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                        </a>
                    ))}

                 { user && (
                   <button className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`} onClick={()=> isOwner ? navigate('/owner') : setShowHotelReg(true)}>
                      {isOwner? " Admin Hub" : "List Your Hotel"}
                    </button>)}
                </div>

                {/* Desktop Right */}
                <div className="hidden md:flex items-center gap-4">
                 <img src={assets.searchIcon} alt="search" className={`${isScrolled && 'invert'} h-7 transition-all duration-500`}></img>

                 {user?(
                    <UserButton><UserButton.MenuItems >
                        <UserButton.Action label="My Bookings" labelIcon={<BookIcon></BookIcon>} onClick={()=>navigate('/my-bookings')}></UserButton.Action>
                        </UserButton.MenuItems></UserButton>
                 ):(
                    <button className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${isScrolled ? "text-white bg-black" : "bg-white text-black"}`}  onClick={handleLoginClick} >
                        Login
                    </button>)}
                </div>

                {/* Mobile Menu Button */}
             
                <div className={`${isScrolled && 'invert'} h-4 flex items-center gap-3 md:hidden`}>
                          {user && <UserButton><UserButton.MenuItems >
                        <UserButton.Action label="My Bookings" labelIcon={<BookIcon></BookIcon>} onClick={()=>navigate('/my-bookings')}></UserButton.Action>
                        </UserButton.MenuItems></UserButton>}
                   <img src={assets.menuIcon} alt="menu"   onClick={() => setIsMenuOpen(true)} ></img>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                       <img  onClick={() => setIsMenuOpen(false)} src={assets.closeIcon} alt="close" className="h-6.5 " />
                    </button>

                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
                            {link.name}
                        </a>
                    ))}
                   
                  {user &&  ( <button className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"  onClick={()=> isOwner ? navigate('/owner') : setShowHotelReg(true)}>
                      {isOwner? " Admin Hub" : "List Your Hotel"}
                    </button>)}
                {!user && 
                    <button onClick={handleLoginClick} className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
                        Login
                    </button>}
                </div>
            </nav>
            {showSignIn && (
                <div className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70' onClick={() => setShowSignIn(false)}>
                    <div onClick={(e) => e.stopPropagation()} className='bg-white rounded-xl p-8'>
                        <button className='absolute top-4 right-4' onClick={() => setShowSignIn(false)}>✕</button>
                        <SignIn />
                    </div>
                </div>
            )}
        </>
    );
}
export default Navbar