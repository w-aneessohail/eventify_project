"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { RoutePath } from "@/enum/routePath";

const Events = () => {
  const allEvents = [
    {
      id: "beyonce-concert",
      name: "Beyoncé Live",
      artist: "Beyoncé",
      location: "London Arena",
      date: "Oct 14-18, 2024",
      price: "$399.99",
      image:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=800&fit=crop",
    },
    {
      id: "enrique-concert",
      name: "Enrique World Tour",
      artist: "Enrique Iglesias",
      location: "Manchester Stadium",
      date: "Oct 17-21, 2024",
      price: "$299.99",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
    },
    {
      id: "ariana-concert",
      name: "Ariana Grande Live",
      artist: "Ariana Grande",
      location: "London O2",
      date: "Oct 22-24, 2024",
      price: "$199.99",
      image:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=800&fit=crop",
    },
    {
      id: "justin-concert",
      name: "Justin Bieber Tour",
      artist: "Justin Bieber",
      location: "City Arena",
      date: "Oct 24-29, 2024",
      price: "$199.99",
      image:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=800&fit=crop",
    },
    {
      id: "celine-concert",
      name: "Celine Dion Live",
      artist: "Celine Dion",
      location: "Bristol Amphitheater",
      date: "Oct 28-30, 2024",
      price: "$499.99",
      image:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=800&fit=crop",
    },
    {
      id: "selena-concert",
      name: "Selena Gomez Show",
      artist: "Selena Gomez",
      location: "Bristol Arena",
      date: "Oct 28-30, 2024",
      price: "$399.99",
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=800&fit=crop",
    },
  ];

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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">All Events</h1>
            <p className="text-xl text-white/90">
              Explore all upcoming events from various categories
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover-lift">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-2xl mb-2">{event.name}</h3>
                  <p className="text-muted-foreground mb-4">{event.artist}</p>

                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar size={16} className="mr-2" />
                    <span>{event.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {event.price}
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
      </section>
    </div>
  );
};

export default Events;
