"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Plus, Minus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";

const MySwal = withReactContent(Swal);

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { fetchData, loading } = useAxios();
  const [seats, setSeats] = useState(1);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const result = await fetchData({
          url: `/events/${id}`,
          method: "get",
        });
        if (result) {
          setEvent(result);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError("Failed to load event details");
        console.log("[v0] Error loading event:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      seats,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      Swal.fire({
        icon: "success",
        title: "Booking Confirmed!",
        html: `
          <p>Your tickets have been booked successfully!</p>
          <p><strong>Total Amount:</strong> PKR ${(
            Number(event.ticketPrice) * seats
          ).toFixed(2)}</p>
          <p><strong>Seats:</strong> ${seats}</p>
        `,
        confirmButtonColor: "#2b4c91",
      });
    },
  });

  const handleSeatsChange = (increment) => {
    const newSeats = increment ? seats + 1 : Math.max(1, seats - 1);
    setSeats(newSeats);
    formik.setFieldValue("seats", newSeats);
  };

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      const result = await MySwal.fire({
        title: "Login Required",
        text: "You need to log in to proceed with the booking.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        navigate(RoutePath.LOGIN, {
          state: { returnTo: `${RoutePath.ATTENDEE}/event/${id}` },
        });
      }
      return;
    }

    if (!formik.isValid) {
      MySwal.fire({
        title: "Validation Error",
        text: "Please fill in all required fields",
        icon: "error",
      });
      return;
    }

    try {
      const bookingData = {
        eventId: parseInt(id),
        attendeeId: user?.id,
        quantity: Number(seats),
        totalAmount: Number(event.ticketPrice) * seats,
        status: "pending",
      };

      const result = await fetchData({
        url: "/bookings",
        method: "post",
        data: bookingData,
      });

      console.log("[v0] Booking result:", result);

      if (result && result.id) {
        console.log("[v0] Navigating to payment with booking:", result);
        navigate(`${RoutePath.ATTENDEE}/payment/${result.id}`, {
          state: { booking: result },
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        MySwal.fire({
          title: "Error",
          text: "Failed to create booking",
          icon: "error",
        });
      }
    } catch (err) {
      setIsLoading(false);
      console.log("[v0] Booking error:", err);
      MySwal.fire({
        title: "Error",
        text: "Failed to process booking",
        icon: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            {error || "Event not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-96">
        <img
          src={event.image || "/placeholder.svg?height=400&width=1200"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {event.description?.substring(0, 100)}...
              </p>

              <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                <h3 className="text-2xl font-bold mb-6">Event Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-muted-foreground">{event.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Calendar className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Date</p>
                      <p className="text-muted-foreground">{event.eventDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Time</p>
                      <p className="text-muted-foreground">
                        {event.eventTime || "6:00 PM"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">About This Event</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description ||
                    "Join us for an amazing event experience."}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-xl sticky top-24"
            >
              <h3 className="text-2xl font-bold mb-6">Book Now</h3>

              <form onSubmit={formik.handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.fullName}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.phone}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Number of Seats
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleSeatsChange(false)}
                      className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">
                      {seats}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSeatsChange(true)}
                      className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">
                      Price per seat
                    </span>
                    <span className="font-semibold">
                      PKR {Number(event.ticketPrice)?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-semibold">{seats}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      PKR {(Number(event.ticketPrice) * seats).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-accent transition-all hover-lift text-lg"
                >
                  Book Now
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetails;
