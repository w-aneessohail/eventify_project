"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import useAxios from "@/hooks/useAxios";
import EventCard from "@/components/EventCard";
import { filterEvents } from "@/utils/mediaUrl";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";

const Events = () => {
  const { fetchData, loading } = useAxios();
  const [events, setEvents] = useState([]);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const date = searchParams.get("date") || "";
  const location = searchParams.get("location") || "";

  useEffect(() => {
    const loadEvents = async () => {
      const result = await fetchData({
        url: "/events",
        method: "get",
        params: { limit: API_LIST_LIMIT },
      });
      if (Array.isArray(result)) {
        setEvents(result);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = filterEvents(events, { search, location, date });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-concert-blue text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-concert-blue to-concert-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">All Events</h1>
            <p className="text-xl text-white/90">
              Explore all upcoming events from various categories
            </p>
            {(search || location || date) && (
              <p className="text-sm text-white/80 mt-4">
                Showing results
                {search ? ` for "${search}"` : ""}
                {location ? ` in ${location}` : ""}
                {date ? ` (${date})` : ""}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <p className="text-muted-foreground text-lg">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
