import React, { useEffect, useState } from "react";
import { assets, facilityIcons, roomCommonData } from "../assets/assets.js";
import { useParams } from "react-router-dom";
import StarRating from "../components/StarRating.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import toast from "react-hot-toast";

const RoomDetails = () => {

  const { id } = useParams();

  const { rooms, getToken, axios, navigate, currency } = useAppContext();

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // CHECK AVAILABILITY
  const checkAvailability = async () => {

    try {

      if (!checkInDate || !checkOutDate) {
        return toast.error("Please select dates");
      }

      if (checkInDate >= checkOutDate) {
        return toast.error("Check-Out must be after Check-In");
      }

      const { data } = await axios.post(
        "/api/bookings/check-availability",
        {
          room: id,
          checkInDate,
          checkOutDate
        }
      );

      if (data.success) {

        if (data.isAvailable) {

          setIsAvailable(true);
          toast.success("Room is available");

        } else {

          setIsAvailable(false);
          toast.error("Room not available");

        }

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }

  };

  // BOOK ROOM
  const onSubmitHandler = async (e) => {

    e.preventDefault();

    try {

      if (!isAvailable) {
        return checkAvailability();
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod: "Pay at hotel"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {

        toast.success("Booking successful");

        navigate("/my-bookings");

        window.scrollTo(0, 0);

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }

  };

  useEffect(() => {

    const foundRoom = rooms.find(
      (room) => String(room.id) === id
    );

    if (foundRoom) {

      setRoom(foundRoom);

      setMainImage(
        foundRoom.images?.[0] || "/room-placeholder.png"
      );

    }

  }, [id, rooms]);

  if (!room) return null;

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">

      {/* TITLE */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">

        <h1 className="text-3xl md:text-4xl font-playfair">
          {room.hotel.name}
          <span className="font-inter text-sm"> {room.roomType}</span>
        </h1>

        <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
          20% off
        </p>

      </div>

      {/* RATING */}
      <div className="flex items-center gap-1 mt-2">
        <StarRating />
        <p className="ml-2">200+ reviews</p>
      </div>

      {/* ADDRESS */}
      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location" />
        <span>{room.hotel.address}</span>
      </div>

      {/* IMAGES */}
      <div className="flex flex-col lg:flex-row mt-6 gap-6">

        <div className="lg:w-1/2 w-full">

          <img
            src={mainImage}
            alt="room"
            className="w-full rounded-xl shadow-lg object-cover"
            onError={(e) => (e.target.src = "/room-placeholder.png")}
          />

        </div>

        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">

          {room.images?.map((image, index) => (

            <img
              key={index}
              src={image}
              alt="room"
              onClick={() => setMainImage(image)}
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                mainImage === image && "outline-3 outline-orange-500"
              }`}
            />

          ))}

        </div>

      </div>

      {/* AMENITIES */}
      <div className="flex flex-col md:flex-row md:justify-between mt-10">

        <div>

          <h1 className="text-3xl md:text-4xl font-playfair">
            Experience Luxury Like Never Before
          </h1>

          <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">

            {(room.amenities || []).map((item, index) => (

              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
              >

                <img
                  src={facilityIcons[item]}
                  alt={item}
                  className="w-5 h-5"
                />

                <p className="text-xs">{item}</p>

              </div>

            ))}

          </div>

        </div>

        <p className="text-2xl font-medium">
          {currency}
          {room.pricePerNight}/night
        </p>

      </div>

      {/* BOOKING FORM */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-lg p-6 rounded-xl mx-auto mt-16 max-w-6xl"
      >

        <div className="flex flex-col md:flex-row gap-6">

          <div>

            <label className="font-medium">Check-In</label>

            <input
              type="date"
              value={checkInDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="border rounded px-3 py-2 mt-1"
              required
            />

          </div>

          <div>

            <label className="font-medium">Check-Out</label>

            <input
              type="date"
              value={checkOutDate}
              min={checkInDate}
              disabled={!checkInDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="border rounded px-3 py-2 mt-1"
              required
            />

          </div>

          <div>

            <label className="font-medium">Guests</label>

            <input
              type="number"
              value={guests}
              min={1}
              onChange={(e) => setGuests(e.target.value)}
              className="border rounded px-3 py-2 mt-1 max-w-20"
            />

          </div>

        </div>

        <button className="bg-primary text-white px-8 py-3 rounded mt-6 md:mt-0">
          {isAvailable ? "Book Now" : "Check Availability"}
        </button>

      </form>

      {/* HOST */}
      <div className="flex flex-col items-start gap-4 mt-16">

        <div className="flex gap-4">

          <img
            src={room.hotel.owner?.image || "/user.png"}
            alt="host"
            className="h-14 w-14 rounded-full"
          />

          <div>

            <p>Hosted by {room.hotel.name}</p>

            <div className="flex items-center mt-1">

              <StarRating />

              <p className="ml-2">200+ reviews</p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );

};

export default RoomDetails;