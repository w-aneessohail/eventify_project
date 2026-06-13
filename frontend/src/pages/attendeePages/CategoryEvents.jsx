"use client";

import { motion } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import useAxios from "@/hooks/useAxios";
import { useState, useEffect } from "react";
import EventCard from "@/components/EventCard";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";

const CategoryEvents = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const { fetchData, loading } = useAxios();
  const [events, setEvents] = useState([]);
  const [categoryName, setCategoryName] = useState(
    location.state?.categoryName || "Events"
  );

  useEffect(() => {
    const loadCategory = async () => {
      if (location.state?.categoryName || !categoryId) return;
      const result = await fetchData({
        url: `/categories/${categoryId}`,
        method: "get",
      });
      if (result?.name) {
        setCategoryName(result.name);
      }
    };
    loadCategory();
  }, [categoryId, location.state?.categoryName]);

  useEffect(() => {
    const loadCategoryEvents = async () => {
      const result = await fetchData({
        url: "/events",
        method: "get",
        params: { categoryId: Number(categoryId), limit: API_LIST_LIMIT },
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
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryEvents;
