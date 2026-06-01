"use client";

import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";
import { useState, useEffect } from "react";

const CategoryEvents = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const categoryName = location.state?.categoryName || "Events";

  const { fetchData, loading } = useAxios();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadCategoryEvents = async () => {
      const result = await fetchData({
        url: "/events",
        method: "get",
        params: { categoryId: Number(categoryId) },
      });
      if (Array.isArray(result)) {
        setEvents(result);
      }
    };

    if (categoryId) {
      loadCategoryEvents();
    }
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative bg-concert-blue text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-concert-blue to-concert-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 capitalize">
              {categoryName} Events
            </h1>
            <p className="text-xl text-white/90">
              Discover amazing {categoryName} events happening near you
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <p className="text-muted-foreground text-lg">
              No events found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover-lift">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=800&fit=crop"
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-2xl mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">
                      {event.organizer.organizationName}
                    </p>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin size={16} className="mr-2" />
                      <span>{event.address}</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar size={16} className="mr-2" />
                      <span>{event.eventDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        PKR {event.ticketPrice}
                      </span>
                      <Link
                        to={RoutePath.ATTENDEE_EVENT_DETAILS.replace(
                          ":id",
                          event.id
                        )}
                      >
                        <button className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-accent transition-colors font-medium">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryEvents;
