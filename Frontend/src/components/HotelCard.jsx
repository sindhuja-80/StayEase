import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useClerk, UserButton, SignIn } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext.jsx";

const BookIcon = () => (
  <svg
    className="w-4 h-4 text-gray-700"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Reviews", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const { openSignIn } = useClerk();
  const location = useLocation();

  const { user, navigate, isOwner, setShowHotelReg } = useAppContext();

  const handleLoginClick = () => {
    if (openSignIn) {
      openSignIn();
    } else {
      setShowSignIn(true);
    }
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
          isScrolled
            ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
            : "py-4 md:py-6"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://img.freepik.com/free-vector/booking-hotel-online-cartoon-icon-illustration-business-technology-icon-concept_138676-2126.jpg"
            className="rounded-full h-11"
            alt="logo"
          />
          <p
            className={`text-2xl font-semibold ${
              isScrolled ? "text-black" : "text-white"
            }`}
          >
            StayEase
          </p>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`group flex flex-col gap-0.5 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.name}
              <div
                className={`${
                  isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              />
            </Link>
          ))}

          {user && (
            <button
              className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
                isScrolled ? "text-black" : "text-white"
              }`}
              onClick={() =>
                isOwner ? navigate("/owner") : setShowHotelReg(true)
              }
            >
              {isOwner ? "Admin Hub" : "List Your Hotel"}
            </button>
          )}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          <img
            src={assets.searchIcon}
            alt="search"
            className={`${isScrolled && "invert"} h-7`}
          />

          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<BookIcon />}
                  onClick={() => navigate("/my-bookings")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              className={`px-8 py-2.5 rounded-full ml-4 ${
                isScrolled ? "text-white bg-black" : "bg-white text-black"
              }`}
              onClick={handleLoginClick}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`${isScrolled && "invert"} h-4 flex items-center gap-3 md:hidden`}
        >
          {user && (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<BookIcon />}
                  onClick={() => navigate("/my-bookings")}
                />
              </UserButton.MenuItems>
            </UserButton>
          )}

          <img
            src={assets.menuIcon}
            alt="menu"
            onClick={() => setIsMenuOpen(true)}
          />
        </div>
      </nav>

      {showSignIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowSignIn(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-8"
          >
            <button
              className="absolute top-4 right-4"
              onClick={() => setShowSignIn(false)}
            >
              ✕
            </button>
            <SignIn />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;