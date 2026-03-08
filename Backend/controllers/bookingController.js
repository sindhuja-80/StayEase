import pool from "../config/db.js";
import transporter from "../config/nodemailer.js";
import Stripe from "stripe"


// CHECK ROOM AVAILABILITY
export const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {

    const bookingsRes = await pool.query(
      `SELECT * FROM bookings
       WHERE room = $1
       AND check_in_date <= $2
       AND check_out_date >= $3`,
      [room, checkOutDate, checkInDate]
    );

    return bookingsRes.rows.length === 0;

  } catch (error) {
    console.error("Availability check error:", error.message);
    return false;
  }
};


// API: CHECK AVAILABILITY
export const checkAvailabilityAPI = async (req, res) => {
  try {

    const { room, checkInDate, checkOutDate } = req.body;

    if (!room || !checkInDate || !checkOutDate) {
      return res.json({
        success: false,
        message: "Missing required fields"
      });
    }

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room
    });

    res.json({
      success: true,
      isAvailable
    });

  } catch (error) {

    console.error(error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {

    if (!req.user) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user.id;

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is not available"
      });
    }

    // GET ROOM + HOTEL DATA
    const roomDataRes = await pool.query(
      `SELECT r.*, h.id AS hotel_id, h.name AS hotel_name
       FROM rooms r
       JOIN hotels h ON r.hotel = h.id
       WHERE r.id = $1`,
      [room]
    );

    const roomData = roomDataRes.rows[0];

    if (!roomData) {
      return res.json({
        success: false,
        message: "Room not found"
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) {
      return res.json({
        success: false,
        message: "Invalid booking dates"
      });
    }

    let totalPrice = parseFloat(roomData.price_per_night) * nights;

    await pool.query(
      `INSERT INTO bookings
      ("user", room, hotel, guests, check_in_date, check_out_date, total_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        user,
        room,
        roomData.hotel_id,
        Number(guests),
        checkInDate,
        checkOutDate,
        totalPrice
      ]
    );

    // EMAIL CONFIRMATION
    // get user email from database
const userRes = await pool.query(
  "SELECT email, username FROM users WHERE id=$1",
  [user]
);

const userData = userRes.rows[0];

if(!userData || !userData.email){
  console.log("User email not found, skipping mail");
} else {
const mailOptions = {

  from: process.env.SENDER_EMAIL,

  to: userData.email,

  subject: "Booking Confirmation",

  html: `
  <h2>Your Booking Details</h2>

  <p>Dear ${userData.username || "Guest"},</p>

  <p>Thank you for booking with StayEase.</p>

  <ul>
    <li><b>Hotel:</b> ${roomData.hotel_name}</li>
    <li><b>Room Type:</b> ${roomData.room_type}</li>
    <li><b>Guests:</b> ${guests}</li>
    <li><b>Check-in:</b> ${checkInDate}</li>
    <li><b>Check-out:</b> ${checkOutDate}</li>
    <li><b>Total Price:</b> ₹${totalPrice}</li>
  </ul>

  <p>StayEase Team</p>
  `
};


    await transporter.sendMail(mailOptions);
}
    res.json({
      success: true,
      message: "Booking created successfully"
    });

  } catch (error) {

    console.error("Create booking error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


// GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {

    if (!req.user) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = req.user.id;

    const bookingsRes = await pool.query(
      `SELECT 
  b.id,
  b.room,
  b.hotel,
  b.guests,
  b.check_in_date,
  b.check_out_date,
  b.total_price,
  b.is_paid,
  r.room_type,
  r.images,
  h.name,
  h.address
FROM bookings b
LEFT JOIN rooms r ON b.room = r.id
LEFT JOIN hotels h ON b.hotel = h.id
WHERE b."user" = $1
ORDER BY b.created_at DESC`,
      [user]
    );

    res.json({
      success: true,
      bookings: bookingsRes.rows
    });

  } catch (error) {

    console.error(error);

    res.json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};


// GET HOTEL BOOKINGS
export const getHotelBookings = async (req, res) => {
  try {

    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;

    const hotelRes = await pool.query(
      "SELECT * FROM hotels WHERE owner = $1",
      [authInfo?.userId]
    );

    const hotel = hotelRes.rows[0];

    if (!hotel) {
      return res.json({
        success: false,
        message: "No Hotel found"
      });
    }

    const bookingsRes = await pool.query(
      `SELECT b.*, r.*, h.*, u.*
       FROM bookings b
       LEFT JOIN rooms r ON b.room = r.id
       LEFT JOIN hotels h ON b.hotel = h.id
       LEFT JOIN users u ON b."user" = u.id
       WHERE b.hotel = $1
       ORDER BY b.created_at DESC`,
      [hotel.id]
    );

    const bookings = bookingsRes.rows;

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + parseFloat(booking.total_price || 0),
      0
    );

    res.json({
      success: true,
      totalBookings,
      totalRevenue,
      bookings,
      hotelName:hotel.name
    });

  } catch (error) {

    console.error(error);

    res.json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripePayment = async (req, res) => {

  try {

    const { bookingId } = req.body

    const bookingRes = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    )

    const booking = bookingRes.rows[0]

    if (!booking) {
      return res.json({
        success:false,
        message:"Booking not found"
      })
    }

    const roomRes = await pool.query(
      `SELECT r.*, h.name AS hotel_name
       FROM rooms r
       JOIN hotels h ON r.hotel = h.id
       WHERE r.id = $1`,
      [booking.room]
    )

    const room = roomRes.rows[0]

    const totalPrice = booking.total_price

    const { origin } = req.headers

    const session = await stripe.checkout.sessions.create({

      payment_method_types:["card"],

      line_items:[
        {
          price_data:{
            currency:"inr",
            product_data:{
              name: room.hotel_name,
            },
            unit_amount: totalPrice * 100
          },
          quantity:1
        }
      ],

      mode:"payment",

      success_url:`${origin}/my-bookings?success=true&bookingId=${booking.id}`,

      cancel_url:`${origin}/my-bookings`,

      metadata:{
        bookingId: booking.id
      }

    })

    res.json({
      success:true,
      url:session.url
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      success:false,
      message:error.message
    })

  }
}
export const confirmStripePayment = async (req, res) => {

  try {

    const { bookingId } = req.body;

    console.log("Confirm payment request:", bookingId);

    if (!bookingId) {
      return res.json({
        success:false,
        message:"Booking ID required"
      });
    }

    const update = await pool.query(
      "UPDATE bookings SET is_paid = true WHERE id = $1 RETURNING *",
      [bookingId]
    );

    if(update.rowCount === 0){
      return res.json({
        success:false,
        message:"Booking not found"
      });
    }

    console.log("Booking updated:", update.rows[0]);

    res.json({
      success:true,
      message:"Payment confirmed"
    });

  } catch(error){

    console.log("Confirm payment error:", error);

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};