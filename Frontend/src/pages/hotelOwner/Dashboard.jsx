import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {

  const { currency, user, getToken, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
    hotelName: ""
  });

  const fetchDashboardData = async () => {

    try {

      const { data } = await axios.get(
        "/api/bookings/hotel",
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );

      if (data.success) {

        setDashboardData({
          bookings: data.bookings || [],
          totalBookings: data.totalBookings || 0,
          totalRevenue: data.totalRevenue || 0,
          hotelName: data.hotelName || "Your Hotel"
        });

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }

  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div>

      <Title
        align="left"
        font="Outfit"
        title="Dashboard"
        subtitle="Monitor your room listings, track bookings and analyze revenue all in one place. Stay updated with real-time insights."
      />

      <div className="flex gap-4 my-8">

        {/* Total Bookings */}
        <div className="bg-primary/3 border border-primary/10 rounded flex p-4 pr-8">

          <img
            src={assets.totalBookingIcon}
            alt="booking-icon"
            className="max-sm:hidden h-10"
          />

          <div className="flex flex-col sm:ml-4 font-medium">

            <p className="text-blue-500 text-lg">Total Bookings</p>

            <p className="text-neutral-400 text-base">
              {dashboardData.totalBookings}
            </p>

          </div>

        </div>


        {/* Total Revenue */}
        <div className="bg-primary/3 border border-primary/10 rounded flex p-4 pr-8">

          <img
            src={assets.totalRevenueIcon}
            alt="revenue-icon"
            className="max-sm:hidden h-10"
          />

          <div className="flex flex-col sm:ml-4 font-medium">

            <p className="text-blue-500 text-lg">Total Revenue</p>

            <p className="text-neutral-400 text-base">
              {currency} {(dashboardData.totalRevenue || 0).toFixed(2)}
            </p>

          </div>

        </div>

      </div>


      {/* Recent Bookings */}
      <h2 className="text-xl text-blue-950/70 font-medium mb-5">
        Recent Bookings
      </h2>

      <div className="w-full max-w-3xl border border-gray-300 rounded-lg max-h-80 overflow-y-scroll">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="py-3 px-4 text-gray-800 font-medium">
                User Name
              </th>

              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Room Name
              </th>

              <th className="py-3 px-4 text-gray-800 font-medium">
                Total Amount
              </th>

              <th className="py-3 px-4 text-gray-800 font-medium">
                Payment Status
              </th>

            </tr>

          </thead>

          <tbody className="text-sm">

            {dashboardData.bookings && dashboardData.bookings.length > 0 ? (

              dashboardData.bookings.map((item, index) => (

                <tr key={item.id || index}>

                  <td className="py-3 px-4 border-t">
                    {item.username || item.user?.username || "Guest"}
                  </td>

                  <td className="py-3 px-4 border-t border-gray-300">
                    {item.room_type || item.roomType || "Room"}
                  </td>

                  <td className="py-3 px-4 border-t border-gray-300 text-center">
                    {currency}
                    {parseFloat(item.total_price || item.totalPrice || 0).toFixed(2)}
                  </td>

                  <td className="py-3 px-4 border-t border-gray-300">

                    <div className="flex justify-center">

                      <span
                        className={`py-1 px-3 text-xs rounded-full ${
                          item.is_paid
                            ? "bg-green-200 text-green-600"
                            : "bg-yellow-200 text-yellow-600"
                        }`}
                      >
                        {item.is_paid ? "Completed" : "Pending"}
                      </span>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="4"
                  className="py-8 text-center text-gray-500"
                >
                  No bookings yet
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Dashboard;