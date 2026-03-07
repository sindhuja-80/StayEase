import React from 'react'
import Navbar from './components/Navbar.jsx'
import { useLocation,Route,Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Footer from './components/Footer.jsx'
import AllRooms from './pages/AllRooms.jsx'
import RoomDetails from './pages/RoomDetails.jsx'
import MyBookings from './pages/MyBookings.jsx'
import HotelReg from './components/HotelReg.jsx'
import Layout from './pages/hotelOwner/Layout.jsx'
import Dashboard from './pages/hotelOwner/Dashboard.jsx'
import AddRoom from './pages/hotelOwner/AddRoom.jsx'
import ListRoom from './pages/hotelOwner/ListRoom.jsx'
import {Toaster} from "react-hot-toast"
import { useAppContext } from './context/AppContext.jsx'
const App = () => {
  const isOwnerPath=useLocation().pathname.includes("owner")
  const {showHotelReg}=useAppContext()
  return (
    <div>
      <Toaster></Toaster>
      {!isOwnerPath && <Navbar></Navbar>}
      {showHotelReg && <HotelReg></HotelReg>}
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home></Home>} />
           <Route path='/rooms' element={<AllRooms></AllRooms>} />
           <Route path='/rooms/:id' element={<RoomDetails/>}></Route>
            <Route path='/my-bookings' element={<MyBookings/>}></Route>
              <Route path='/owner' element={<Layout/>}>
              <Route index element={<Dashboard />}></Route>
              <Route path='add-room' element={<AddRoom></AddRoom>}></Route>
              <Route path='list-room' element={<ListRoom></ListRoom>}></Route>
              </Route>
        </Routes>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default App
