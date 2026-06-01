"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      

      {/* Header */}
      <section className="text-center py-16 border-b border-border">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn more about TICKETER and our mission to bring you the best live experiences
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Ticketer is a global ticketing platform for live experiences that allows anyone to create, share, find and
            attend events that fuel their passions and enrich their lives. We connect millions of event organizers and
            attendees across various categories including concerts, sports, comedy shows, and more.
          </p>

          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Our mission is to bring the world together through live experiences. We believe that nothing compares to the
            feeling of attending a live event, and we're dedicated to making it easier for people to discover and attend
            the events they love.
          </p>

          <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-secondary/30 p-6 rounded-2xl">
              <h3 className="font-bold text-xl mb-3">Best Prices</h3>
              <p className="text-muted-foreground">
                We offer the most competitive prices in the market with no hidden fees
              </p>
            </div>
            <div className="bg-secondary/30 p-6 rounded-2xl">
              <h3 className="font-bold text-xl mb-3">Secure Booking</h3>
              <p className="text-muted-foreground">Your transactions are protected with bank-level security</p>
            </div>
            <div className="bg-secondary/30 p-6 rounded-2xl">
              <h3 className="font-bold text-xl mb-3">24/7 Support</h3>
              <p className="text-muted-foreground">Our customer support team is always ready to help you</p>
            </div>
            <div className="bg-secondary/30 p-6 rounded-2xl">
              <h3 className="font-bold text-xl mb-3">Wide Selection</h3>
              <p className="text-muted-foreground">Access to thousands of events across multiple categories</p>
            </div>
          </div>
        </motion.div>
      </section>

     
    </div>
  )
}

export default About
