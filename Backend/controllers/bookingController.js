import client from "../config/db.js";
import transporter from "../config/nodemailer.js";

// function to check availability of room using date overlap
export const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookingsRes = await client.query(
            `SELECT * FROM bookings
             WHERE room = $1
               AND check_in_date <= $2
               AND check_out_date >= $3`,
            [room, checkOutDate, checkInDate]
        );
        return bookingsRes.rows.length === 0;
    } catch (error) {
        console.error(error.message);
        return false;
    }
};

// API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user.id;

        // Before Booking Check availability
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });
        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available" });
        }

        // Get totalPrice from Room (include hotel id)
        const roomDataRes = await client.query(
            'SELECT r.*, h.id as hotel_id FROM rooms r JOIN hotels h ON r.hotel = h.id WHERE r.id = $1',
            [room]
        );
        const roomData = roomDataRes.rows[0];
        let totalPrice = parseFloat(roomData.price_per_night);

        // Calculate totalPrice based on nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;
        await client.query(
            `INSERT INTO bookings ("user", room, hotel, guests, check_in_date, check_out_date, total_price)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [user, room, roomData.hotel_id, +guests, checkInDate, checkOutDate, totalPrice]
        );
        const mailOptions = {
            
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "Booking Confirmation",
            html:`
                <h1>Your Booking Details</h1>
                <p>Dear ${req.user.name},</p>
                <p>Thank you for your booking! Here are your booking details:</p>
                <ul>
                    <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                     <li><strong>Room Type:</strong> ${roomData.room_type}</li>
                     <li><strong>Amenities:</strong> ${roomData.amenities}</li>
                    <li><strong>Guests:</strong> ${guests}</li>
                    <li><strong>Check-in Date:</strong> ${checkInDate}</li>
                    <li><strong>Check-out Date:</strong> ${checkOutDate}</li>
                    <li><strong>Price per Night:</strong> ₹${roomData.price_per_night}</li>
                    <li><strong>Total Price:</strong> ₹${totalPrice}</li>
                </ul>
                <p>We look forward to hosting you!</p>
                <p>Best regards,<br/>StayEase Team</p>`
        }
        await transporter.sendMail(mailOptions)
        res.json({ success: true, message: "Booking created successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create booking" });
    }
};

// API to get bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user.id;
        const bookingsRes = await client.query(
            `SELECT b.*, r.*, h.*
             FROM bookings b
             LEFT JOIN rooms r ON b.room = r.id
             LEFT JOIN hotels h ON b.hotel = h.id
             WHERE b."user" = $1
             ORDER BY b.created_at DESC`,
            [user]
        );
        res.json({ success: true, bookings: bookingsRes.rows });
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
};

export const getHotelBookings = async (req, res) => {
    try {
        const authInfo = typeof req.auth === 'function' ? req.auth() : req.auth;
        const hotelRes = await client.query('SELECT * FROM hotels WHERE owner = $1', [
            authInfo?.userId,
        ]);
        const hotel = hotelRes.rows[0];
        if (!hotel) {
            return res.json({ success: false, message: "No Hotel found" });
        }
        const bookingsRes = await client.query(
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
        const totalRevenue = bookings.reduce((acc, booking) => acc + parseFloat(booking.total_price), 0);
        res.json({ success: true, totalBookings, totalRevenue, bookings });
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
};