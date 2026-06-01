"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";
import { useState, useEffect } from "react";

const Categories = () => {
  const { fetchData, loading } = useAxios();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const result = await fetchData({ url: "/categories", method: "get" });
      if (Array.isArray(result)) {
        setCategories(result);
      }
    };
    loadCategories();
  }, []);

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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Event Categories
            </h1>
            <p className="text-xl text-white/90">
              Explore various types of events and find what interests you most
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={RoutePath.ATTENDEE_CATEGORY_EVENTS.replace(
                    ":categoryId",
                    category.id
                  )}
                  state={{ categoryName: category.name }}
                >
                  <div className="group cursor-pointer">
                    <div className="relative rounded-2xl overflow-hidden mb-4 h-64 hover-lift">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-2xl mb-1">
                          {category.name}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {category.eventCount || "Events"}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {category.description}
                    </p>
                    <button className="mt-3 w-full bg-primary/10 text-primary py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                      View Events
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Categories;
