import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets.js";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { axios, getToken, user } = useAppContext();

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    try {

      setLoading(true);

      const { data } = await axios.get(
        "/api/bookings/user",
        {
          headers:{
            Authorization:`Bearer ${await getToken()}`
          }
        }
      );

      if(data.success){
        setBookings(data.bookings);
      }

    } catch(error){
      toast.error(error.message);
    } finally{
      setLoading(false);
    }
  };

  // STRIPE SUCCESS CHECK
  useEffect(() => {

    const checkStripeSuccess = async () => {

      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const bookingId = params.get("bookingId");

      if(success && bookingId){

        try{

          await axios.post(
            "/api/bookings/confirm-payment",
            { bookingId },
            {
              headers:{
                Authorization:`Bearer ${await getToken()}`
              }
            }
          );

          toast.success("Payment Successful");
          await fetchBookings();

          // remove query params
          window.history.replaceState({}, document.title, "/my-bookings");

        }catch(error){
          console.log(error);
        }

      }

      if(user){
        fetchBookings();
      }

    };

    checkStripeSuccess();

  },[user]);



  // PAY NOW
  const handlePayment = async (booking) => {

    try{

      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        {
          bookingId: booking.id
        },
        {
          headers:{
            Authorization:`Bearer ${await getToken()}`
          }
        }
      );

      if(data.success){
        window.location.href = data.url;
      }

    }catch(error){
      toast.error(error.message);
    }

  };


  if(loading){
    return(
      <div className="py-40 text-center text-gray-500">
        Loading bookings...
      </div>
    )
  }


  return (

    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-12">

      <Title
        title="My Bookings"
        subTitle="Manage your hotel reservations easily"
        align="left"
      />

      <div className="max-w-6xl mt-6 w-full text-gray-800">

        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.map((booking)=>(
          
          <div
            key={booking.id}
            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 py-6"
          >

            {/* HOTEL INFO */}
            <div className="flex flex-col md:flex-row">

              <img
                src={booking.images?.[0] || "/fallback.jpg"}
                alt="hotel"
                className="w-full md:w-44 h-32 rounded shadow object-cover"
              />

              <div className="flex flex-col gap-1.5 mt-3 md:mt-0 md:ml-4">

                <p className="font-playfair text-2xl">
                  {booking.name}
                  <span className="font-inter text-sm">
                    {" "}({booking.room_type})
                  </span>
                </p>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <img src={assets.locationIcon} />
                  <span>{booking.address}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <img src={assets.guestsIcon} />
                  <span>Guests: {booking.guests}</span>
                </div>

                <p className="font-semibold">
                  Total: ₹{booking.total_price}
                </p>

              </div>
            </div>


            {/* DATE */}
            <div className="flex flex-col justify-center text-sm text-gray-600 mt-3 md:mt-0">

              <p>
                Check-In: {new Date(booking.check_in_date).toDateString()}
              </p>

              <p>
                Check-Out: {new Date(booking.check_out_date).toDateString()}
              </p>

            </div>


            {/* PAYMENT */}
            <div className="flex flex-col justify-center mt-3 md:mt-0">

              <div className="flex items-center gap-2">

                <div
                  className={`h-3 w-3 rounded-full ${
                    booking.is_paid
                    ? "bg-green-500"
                    : "bg-red-500"
                  }`}
                />

                <p
                  className={`text-sm ${
                    booking.is_paid
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
                >
                  {booking.is_paid ? "Paid" : "UnPaid"}
                </p>

              </div>

              {!booking.is_paid && (

                <button
                  onClick={()=>handlePayment(booking)}
                  className="px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Pay Now
                </button>

              )}

            </div>

          </div>

        ))}

        {bookings.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No bookings found
          </p>
        )}

      </div>
    </div>

  );

};

export default MyBookings;