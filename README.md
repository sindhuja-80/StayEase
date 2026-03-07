# StayEase - Hotel Booking Platform ✨

A full-stack hotel booking application with modern architecture, real-time updates, and complete hotel management system.

## 🎯 Project Overview

StayEase is a production-ready hotel booking platform featuring:
- **User Management**: Clerk-based authentication with webhook integration
- **Room Booking**: Real-time availability checking and price calculation
- **Hotel Admin Panel**: Dashboard for revenue tracking and booking management  
- **Image Management**: Cloudinary integration for room photos
- **Database**: PostgreSQL with auto-schema initialization
- **Responsive Design**: Mobile, tablet, and desktop optimized

## 📋 Technology Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL 13+
- **Authentication**: Clerk webhooks
- **Image Upload**: Cloudinary
- **File Upload**: Multer
- **Runtime**: Node.js 16+

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Clerk React SDK
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Routing**: React Router v7

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ & npm/yarn
- PostgreSQL 13+ running locally
- Clerk account (free tier works)
- Cloudinary account (free tier works)

### Step 1: Clone & Install
```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
cd ..
```

### Step 2: Setup Database
```bash
# Create PostgreSQL database
createdb stayease

# Database tables auto-create on first backend run
```

### Step 3: Configure Environment
Backend `.env` is pre-configured. Frontend `.env` is pre-configured.

### Step 4: Start Services
```bash
# Terminal 1 - Start Backend
cd Backend
npm run server
# Expected: "✅ PostgreSQL connected" + "server running on port 5000"

# Terminal 2 - Start Frontend  
cd Frontend
npm run dev
# Expected: "Local: http://localhost:5174"
```

### Step 5: Open Browser
```
http://localhost:5174
```

**✅ Done! Platform is now running.**

## 📁 Project Structure

```
StayEase/
├── Backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection & schema
│   │   └── coludinary.js      # Cloudinary configuration
│   ├── controllers/           # Business logic
│   │   ├── userController.js
│   │   ├── hotelController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   └── clerkWebHooks.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # Clerk auth verification
│   │   └── uploadMiddleware.js # Multer file upload
│   ├── models/                # Mongoose schemas (legacy)
│   ├── routes/                # Express route handlers
│   │   ├── userRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── roomRoutes.js
│   │   └── bookingRoutes.js
│   ├── .env                   # Environment variables
│   └── server.js              # Express app entry
│
├── Frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── HotelReg.jsx
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── AllRooms.jsx
│   │   │   ├── RoomDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── hotelOwner/    # Admin pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── AddRoom.jsx
│   │   │       └── ListRoom.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx # Global state & API
│   │   ├── assets/
│   │   │   └── assets.js      # Icons & dummy data
│   │   ├── App.jsx            # Main component
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Environment variables
│   └── vite.config.js         # Vite configuration
│
├── SETUP_GUIDE.md             # Detailed setup instructions
├── ISSUES_RESOLVED.md         # All fixes documented
├── start.sh                   # Linux/Mac startup script
├── start.bat                  # Windows startup script
└── package.json               # Root package config
```

## 📡 API Endpoints

### User Management
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/user` | ✅ Yes | Get current user profile |
| GET | `/api/user/all` | ❌ No | List all users (debug) |
| POST | `/api/user/test-create` | ❌ No | Create test user |
| POST | `/api/user/store-recent-search` | ✅ Yes | Store searched city |

### Hotel Management
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/hotels` | ✅ Yes | Register new hotel |

### Room Management
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/rooms` | ❌ No | Get all available rooms |
| GET | `/api/rooms/:id` | ❌ No | Get single room details |
| GET | `/api/rooms/owner` | ✅ Yes | Get owner's rooms |
| POST | `/api/rooms` | ✅ Yes | Create new room |
| POST | `/api/rooms/toggle-availability` | ✅ Yes | Toggle room available/unavailable |

### Booking Management
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/bookings/check-availability` | ❌ No | Check room availability for dates |
| POST | `/api/bookings/book` | ✅ Yes | Create new booking |
| GET | `/api/bookings/user` | ✅ Yes | Get user's bookings |
| GET | `/api/bookings/hotel` | ✅ Yes | Get hotel's bookings |

## 🗄️ Database Schema

### users
```sql
id (TEXT, PRIMARY KEY) - Clerk user ID
username (TEXT)
email (TEXT) UNIQUE
image (TEXT)
role (TEXT) - 'user' or 'hotelOwner'
recent_searched_cities (TEXT[])
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### hotels
```sql
id (SERIAL, PRIMARY KEY)
name (TEXT) NOT NULL
address (TEXT) NOT NULL
contact (TEXT) NOT NULL
owner (TEXT, FK → users.id) NOT NULL
city (TEXT) NOT NULL
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### rooms
```sql
id (SERIAL, PRIMARY KEY)
hotel (INTEGER, FK → hotels.id) NOT NULL
room_type (TEXT) NOT NULL
price_per_night (NUMERIC) NOT NULL
amenities (JSONB)
images (TEXT[])
is_available (BOOLEAN, DEFAULT TRUE)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### bookings
```sql
id (SERIAL, PRIMARY KEY)
"user" (TEXT, FK → users.id) NOT NULL
room (INTEGER, FK → rooms.id) NOT NULL
hotel (INTEGER, FK → hotels.id) NOT NULL
check_in_date (DATE) NOT NULL
check_out_date (DATE) NOT NULL
total_price (NUMERIC) NOT NULL
guests (INTEGER) NOT NULL
status (TEXT) - 'pending' or 'completed'
payment_method (TEXT) - 'Pay At Hotel'
is_paid (BOOLEAN, DEFAULT FALSE)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

## 🔐 Authentication Flow

```
1. User clicks Login
   ↓
2. Clerk authentication modal opens
   ↓
3. User signs up/logs in
   ↓
4. Clerk returns JWT token
   ↓
5. Webhook: Clerk → Backend
   ↓
6. Backend creates user in PostgreSQL
   ↓
7. Frontend stores token, fetches user profile
   ↓
8. User data loaded in React context
   ↓
9. All API calls include `Authorization: Bearer {token}`
```

## 👥 User Roles

### Regular User
- Browse hotels and rooms
- Check availability
- Book rooms
- View my bookings
- Track payment status

### Hotel Owner
- Register hotel
- Add/edit/delete rooms
- Upload room images
- Toggle room availability
- View bookings for hotel
- Track revenue
- View analytics dashboard

## 🎨 User Interface

### Public Pages
- **Home**: Featured hotels, testimonials, exclusive offers
- **Hotels Page**: Browse all rooms with filters and sorting
- **Room Details**: Full room info, availability check, booking form
- **My Bookings**: User's reservation history and details

### Admin Pages (Hotel Owner Only)
- **Dashboard**: Revenue analytics and recent bookings
- **Add Room**: Room creation with images and amenities
- **List Rooms**: Room management with availability toggle

## 🧪 Testing the Application

### Test Scenario 1: Browse & Book
```
1. Go to http://localhost:5174
2. Click "Hotels" or any room
3. Select check-in and check-out dates
4. Click "Check Availability"
5. Click "Book Now"
6. View booking in "My Bookings"
```

### Test Scenario 2: Hotel Owner Setup
```
1. Sign up with any email
2. Click "List Your Hotel"
3. Fill in hotel details and submit
4. Now you see "Admin Hub" instead
5. Go to Admin Hub → Add Room
6. Fill room details and submit
7. Go to Admin Hub → List Rooms
8. Toggle availability on/off
9. Go to Admin Hub → Dashboard
10. See your bookings and revenue
```

### Test Scenario 3: Create Test Booking
```bash
# Terminal
curl -X POST http://localhost:5000/api/user/test-create \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_user_123",
    "username": "Test User",
    "email": "test@example.com"
  }'

# Then use this ID for booking tests
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to PostgreSQL"
**Solution:**
1. Ensure PostgreSQL is running
2. Check credentials in Backend/.env
3. Verify database exists: `psql -U postgres -l | grep stayease`

### Issue: Images not uploading
**Solution:**
1. Check Cloudinary credentials in Backend/.env
2. Verify internet connection
3. Check browser console for upload errors
4. Try smaller image files (< 5MB)

### Issue: Login not working
**Solution:**
1. Clear browser cookies/cache (Ctrl+Shift+Delete)
2. Check Clerk keys in Frontend/.env
3. Verify webhook URL in Clerk dashboard
4. Reload page (Ctrl+R)

### Issue: Bookings not saving
**Solution:**
1. Check backend console for errors
2. Verify selected dates and guests
3. Ensure room is_available = true
4. Try booking a different room

### Issue: Dashboard showing 0 bookings
**Solution:**
1. Make sure you're logged in as hotel owner
2. Create a test booking first
3. Refresh page (F5)
4. Check PostgreSQL directly:
   ```sql
   SELECT * FROM bookings WHERE hotel = <your_hotel_id>;
   ```

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd Frontend
npm run build
# Deploy 'dist' folder to Vercel
```

### Backend Deployment (Render/Railway)
```bash
# Update VITE_BACKEND_URL to production backend URL
# Update PostgreSQL connection string
# Deploy Backend folder
```

## 📚 Additional Resources

- **Setup Guide**: See `SETUP_GUIDE.md` for detailed instructions
- **Issues Resolved**: See `ISSUES_RESOLVED.md` for all fixes applied
- **Clerk Docs**: https://clerk.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

## 📝 Environment Variables

### Backend `.env`
```
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=sindhu90
PG_DATABASE=stayease
NODE_ENV=development
SKIP_WEBHOOK_VERIFY=true
CLERK_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend `.env`
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:5000
VITE_CURRENCY=₹
```

## ✨ Features

- ✅ User authentication with Clerk
- ✅ Hotel registration and management
- ✅ Room creation with image uploads
- ✅ Real-time availability checking
- ✅ Booking system with price calculation
- ✅ Admin dashboard with analytics
- ✅ Payment status tracking
- ✅ Recent search history
- ✅ Room filtering and sorting
- ✅ Responsive mobile design
- ✅ Toast notifications
- ✅ Error handling

## 🎓 Learning Path

1. Understand the data flow (database → API → frontend)
2. Modify page layouts in `src/pages/`
3. Add new API endpoints in `Backend/routes/`
4. Update business logic in `Backend/controllers/`
5. Modify UI components in `src/components/`
6. Add new fields to database schema

## 📞 Support

For issues:
1. Check console logs (Ctrl+Shift+I)
2. Review troubleshooting section
3. Check API responses in Network tab
4. Verify .env files are correct
5. Restart backend and frontend servers

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🎉 You're All Set!

**Congratulations!** Your hotel booking platform is ready. Start the servers and begin exploring:

```bash
# Terminal 1
cd Backend && npm run server

# Terminal 2  
cd Frontend && npm run dev
```

Visit **http://localhost:5174** 🚀
