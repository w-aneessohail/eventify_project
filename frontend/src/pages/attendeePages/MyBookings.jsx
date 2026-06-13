import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { RoutePath } from "@/enum/routePath";
import { HttpMethod } from "@/enum/httpMethod";
import useAxios from "@/hooks/useAxios";
import { formatEventDate } from "@/utils/mediaUrl";

const statusBadgeClass = (status) => {
  const value = (status || "pending").toLowerCase();
  if (value === "success" || value === "confirmed") return "bg-green-100 text-green-800";
  if (value === "failed" || value === "cancelled") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
};

const MyBookings = () => {
  const { fetchData, loading } = useAxios();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      setError(null);
      const result = await fetchData({
        url: "/bookings/me",
        method: HttpMethod.GET,
        params: { limit: 50 },
      });

      if (Array.isArray(result)) {
        setBookings(result);
      } else {
        setError("Failed to load bookings");
      }
    };

    loadBookings();
  }, []);

  const getPaymentStatus = (booking) => {
    return booking.payment?.status ?? booking.status ?? "pending";
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-concert-blue text-white py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-concert-blue to-concert-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Bookings</h1>
          <p className="text-white/90">View your event bookings and payment status</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-4xl">
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">
              Browse events and book your first ticket.
            </p>
            <Link
              to={RoutePath.ATTENDEE_ALL_EVENTS}
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => {
              const paymentStatus = getPaymentStatus(booking);
              const bookingStatus = booking.status || "pending";

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {booking.event?.title || `Event #${booking.event?.id}`}
                      </h3>

                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <MapPin size={14} className="mr-2" />
                        <span>{booking.event?.address || "—"}</span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar size={14} className="mr-2" />
                        <span>
                          Event: {formatEventDate(booking.event?.eventDate)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seats: </span>
                          <span className="font-medium">{booking.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium">
                            PKR {Number(booking.totalAmount).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Booked: </span>
                          <span className="font-medium">
                            {formatEventDate(booking.bookingDate || booking.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadgeClass(bookingStatus)}`}
                      >
                        Booking: {bookingStatus}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadgeClass(paymentStatus)}`}
                      >
                        Payment: {paymentStatus}
                      </span>

                      <div className="flex gap-2 mt-2">
                        {booking.event?.id && (
                          <Link
                            to={RoutePath.ATTENDEE_EVENT_DETAILS.replace(
                              ":id",
                              booking.event.id
                            )}
                            className="text-sm text-primary hover:underline"
                          >
                            View Event
                          </Link>
                        )}
                        {booking.status === "confirmed" ? null : (
                          <Link
                            to={RoutePath.ATTENDEE_PAYMENT.replace(
                              ":bookingId",
                              booking.id
                            )}
                            className="text-sm text-primary hover:underline"
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyBookings;
