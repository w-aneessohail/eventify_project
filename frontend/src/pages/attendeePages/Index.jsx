"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Star, Check, User, DollarSign, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";
import {
  formatEventDate,
  getEventImageUrl,
} from "@/utils/mediaUrl";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";

const benefits = [
  {
    icon: <DollarSign className="w-12 h-12 text-primary" />,
    title: "Installment Payment",
    description: "Pay for your tickets in easy installments with flexible payment plans.",
  },
  {
    icon: <RefreshCw className="w-12 h-12 text-primary" />,
    title: "Online Booking!",
    description: "Book your favorite events online from anywhere at any time with ease.",
  },
  {
    icon: <Check className="w-12 h-12 text-primary" />,
    title: "Refundable Ticket!",
    description: "Get full refund on your tickets if plans change. No questions asked.",
  },
  {
    icon: <Star className="w-12 h-12 text-primary" />,
    title: "Cheapest Ticket!",
    description: "We offer the best prices in the market for all your favorite events.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { fetchData } = useAxios();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [singerSearch, setSingerSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("Date");
  const [locationSearch, setLocationSearch] = useState("Location");

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const result = await fetchData({
        url: "/events",
        method: "get",
        params: { limit: API_LIST_LIMIT },
      });
      if (Array.isArray(result)) {
        setEvents(result);
      }
      setLoading(false);
    };
    loadEvents();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (singerSearch.trim()) params.set("search", singerSearch.trim());
    if (dateSearch && dateSearch !== "Date") params.set("date", dateSearch);
    if (locationSearch && locationSearch !== "Location") {
      params.set("location", locationSearch);
    }
    const qs = params.toString();
    navigate(`${RoutePath.ATTENDEE_ALL_EVENTS}${qs ? `?${qs}` : ""}`);
  };

  const featuredEvents = events.slice(0, 6);
  const highlightedEvents = events.slice(0, 5);
  const upcomingEvents = events.slice(0, 5);

  return (
    <>
      <section className="relative bg-concert-blue text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-concert-blue to-concert-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Book Tickets Of Your Favorite Events!
            </h1>
            <p className="text-xl mb-12 text-white/90">
              Discover concerts and shows happening near you
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by event name"
                  value={singerSearch}
                  onChange={(e) => setSingerSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={dateSearch}
                  onChange={(e) => setDateSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                >
                  <option>Date</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationSearch === "Location" ? "" : locationSearch}
                  onChange={(e) =>
                    setLocationSearch(e.target.value || "Location")
                  }
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-accent text-white py-4 px-8 rounded-xl font-semibold hover:bg-accent/90 transition-all hover-lift"
              >
                Find Ticket
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : featuredEvents.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No events available yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={RoutePath.ATTENDEE_EVENT_DETAILS.replace(":id", event.id)}>
                  <div className="relative rounded-2xl overflow-hidden mb-3 hover-lift">
                    <img
                      src={getEventImageUrl(event)}
                      alt={event.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{event.address}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatEventDate(event.eventDate)}
                  </p>
                  <p className="font-bold text-primary">
                    PKR {Number(event.ticketPrice).toFixed(2)}
                  </p>
                  <button className="mt-2 w-full bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                    Book Now
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Benefits</h2>
            <p className="text-muted-foreground">
              We make sure you will get best of our service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl text-center hover-lift concert-shadow"
              >
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="font-bold text-xl mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Time is Running Out!</h2>
        </div>
        {highlightedEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {highlightedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden mb-3 hover-lift">
                  <img
                    src={getEventImageUrl(event)}
                    alt={event.title}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatEventDate(event.eventDate)}
                </p>
                <p className="font-bold text-primary mb-2">
                  PKR {Number(event.ticketPrice).toFixed(2)}
                </p>
                <Link to={RoutePath.ATTENDEE_EVENT_DETAILS.replace(":id", event.id)}>
                  <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors">
                    Book Now
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground">
            We are here to listen from you deliver excellence
          </p>
        </div>
        {upcomingEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-2xl overflow-hidden h-64 cursor-pointer hover-lift"
              >
                <img
                  src={getEventImageUrl(event)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-lg mb-1">{event.title}</h3>
                  <p className="text-white/80 text-sm">
                    {formatEventDate(event.eventDate)}
                  </p>
                  <Link to={RoutePath.ATTENDEE_EVENT_DETAILS.replace(":id", event.id)}>
                    <button className="mt-3 bg-white text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Index;
