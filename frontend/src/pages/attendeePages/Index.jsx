"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Calendar, Star, Check, User, DollarSign, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const Index = () => {
  const [singerSearch, setSingerSearch] = useState("")
  const [dateSearch, setDateSearch] = useState("")
  const [locationSearch, setLocationSearch] = useState("")

  const featuredSingers = [
    {
      name: "Beyonce",
      location: "London",
      dates: "Oct 14-Oct 18",
      price: "$399.99",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop",
    },
    {
      name: "Enrique Iglesias",
      location: "Manchester",
      dates: "Oct 17 - Oct 21",
      price: "$299.99",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
    },
    {
      name: "Ariana Grande",
      location: "London",
      dates: "Oct 22 - Oct 24",
      price: "$199.99",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
    },
    {
      name: "Justin Bieber",
      location: "City",
      dates: "Oct 24 - Oct 29",
      price: "$199.99",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=600&fit=crop",
    },
    {
      name: "Celen Dion",
      location: "Bristol",
      dates: "Oct 28- Oct 30",
      price: "$499.99",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop",
    },
    {
      name: "Celena Gomez",
      location: "Bristol",
      dates: "Oct 28- Oct 30",
      price: "$399.99",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop",
    },
  ]

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
  ]

  const upcomingConcerts = [
    { title: "Coming soon", date: "20 Feb 2023" },
    { title: "Coming soon", date: "20 Feb 2023" },
    { title: "Coming soon", date: "20 Feb 2023" },
    { title: "Coming soon", date: "20 Feb 2023" },
    { title: "Coming soon", date: "20 Feb 2023" },
  ]

  return (
    
    
    <>
      {/* Hero Section */}
      <section className="relative bg-concert-blue text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-concert-blue to-concert-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Book Tickets Of Your Favorite Singers!</h1>
            <p className="text-xl mb-12 text-white/90">Make Sure Don't Miss These 5 Up Coming's Concerts!</p>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Type a singer name"
                  value={singerSearch}
                  onChange={(e) => setSingerSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                  <option>Date</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                  <option>Location</option>
                  <option>London</option>
                  <option>Manchester</option>
                  <option>Bristol</option>
                </select>
              </div>
              <button className="bg-accent text-white py-4 px-8 rounded-xl font-semibold hover:bg-accent/90 transition-all hover-lift">
                Find Ticket
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Singers */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {featuredSingers.map((singer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Link to={`/event/${singer.name.toLowerCase().replace(" ", "-")}`}>
                <div className="relative rounded-2xl overflow-hidden mb-3 hover-lift">
                  <img
                    src={singer.image || "/placeholder.svg"}
                    alt={singer.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <h3 className="font-bold text-lg mb-1">{singer.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{singer.location}</p>
                <p className="text-sm text-muted-foreground mb-2">{singer.dates}</p>
                <p className="font-bold text-primary">{singer.price}</p>
                <button className="mt-2 w-full bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                  Book Now
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Benefits</h2>
            <p className="text-muted-foreground">We make sure you will get best of our service</p>
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

      {/* Time is Running Out Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Time is Running Out!</h2>
          <div className="flex justify-center items-center space-x-4">
            <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
              ←
            </button>
            <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {featuredSingers.slice(0, 5).map((singer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden mb-3 hover-lift">
                <img
                  src={singer.image || "/placeholder.svg"}
                  alt={singer.name}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-destructive text-white px-4 py-1 rounded-full text-sm font-semibold">
                  20% OFF
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{singer.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{singer.dates}</p>
              <p className="font-bold text-primary mb-2">{singer.price}</p>
              <Link to={`/event/${singer.name.toLowerCase().replace(" ", "-")}`}>
                <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors">
                  Book Now
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Concerts */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Upcoming Concerts</h2>
          <p className="text-muted-foreground">We are here to listen from you deliver excellence</p>
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
              ←
            </button>
            <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {upcomingConcerts.map((concert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden h-64 cursor-pointer hover-lift"
            >
              <img
                src={`https://images.unsplash.com/photo-${1470000000000 + index * 10000000}?w=400&h=600&fit=crop`}
                alt={concert.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-lg mb-1">{concert.title}</h3>
                <p className="text-white/80 text-sm">{concert.date}</p>
                <button className="mt-3 bg-white text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      
  </>
  )
}

export default Index


// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { MapPin, Calendar, Star, Check, User, DollarSign, RefreshCw } from "lucide-react"
// import { Link } from "react-router-dom"
// import Navbar from "@/components/Navbar"
// import Footer from "@/components/Footer"

// const Index = () => {
//   const [singerSearch, setSingerSearch] = useState("")
//   const [dateSearch, setDateSearch] = useState("")
//   const [locationSearch, setLocationSearch] = useState("")

//   const featuredSingers = [
//     {
//       name: "Beyonce",
//       location: "London",
//       dates: "Oct 14-Oct 18",
//       price: "$399.99",
//       image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop",
//     },
//     {
//       name: "Enrique Iglesias",
//       location: "Manchester",
//       dates: "Oct 17 - Oct 21",
//       price: "$299.99",
//       image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
//     },
//     {
//       name: "Ariana Grande",
//       location: "London",
//       dates: "Oct 22 - Oct 24",
//       price: "$199.99",
//       image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop",
//     },
//     {
//       name: "Justin Bieber",
//       location: "City",
//       dates: "Oct 24 - Oct 29",
//       price: "$199.99",
//       image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=600&fit=crop",
//     },
//     {
//       name: "Celen Dion",
//       location: "Bristol",
//       dates: "Oct 28- Oct 30",
//       price: "$499.99",
//       image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop",
//     },
//     {
//       name: "Celena Gomez",
//       location: "Bristol",
//       dates: "Oct 28- Oct 30",
//       price: "$399.99",
//       image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop",
//     },
//   ]

//   const benefits = [
//     {
//       icon: <DollarSign className="w-12 h-12 text-primary" />,
//       title: "Installment Payment",
//       description: "Pay for your tickets in easy installments with flexible payment plans.",
//     },
//     {
//       icon: <RefreshCw className="w-12 h-12 text-primary" />,
//       title: "Online Booking!",
//       description: "Book your favorite events online from anywhere at any time with ease.",
//     },
//     {
//       icon: <Check className="w-12 h-12 text-primary" />,
//       title: "Refundable Ticket!",
//       description: "Get full refund on your tickets if plans change. No questions asked.",
//     },
//     {
//       icon: <Star className="w-12 h-12 text-primary" />,
//       title: "Cheapest Ticket!",
//       description: "We offer the best prices in the market for all your favorite events.",
//     },
//   ]

//   const upcomingConcerts = [
//     { title: "Coming soon", date: "20 Feb 2023" },
//     { title: "Coming soon", date: "20 Feb 2023" },
//     { title: "Coming soon", date: "20 Feb 2023" },
//     { title: "Coming soon", date: "20 Feb 2023" },
//     { title: "Coming soon", date: "20 Feb 2023" },
//   ]

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       {/* Hero Section */}
//       <section className="relative bg-concert-blue text-white py-20 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-concert-blue to-concert-blue/80"></div>
//         <div className="container mx-auto px-4 relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center max-w-4xl mx-auto"
//           >
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">Book Tickets Of Your Favorite Singers!</h1>
//             <p className="text-xl mb-12 text-white/90">Make Sure Don't Miss These 5 Up Coming's Concerts!</p>

//             {/* Search Filters */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
//               <div className="relative">
//                 <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Type a singer name"
//                   value={singerSearch}
//                   onChange={(e) => setSingerSearch(e.target.value)}
//                   className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent"
//                 />
//               </div>
//               <div className="relative">
//                 <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <select className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
//                   <option>Date</option>
//                   <option>Today</option>
//                   <option>This Week</option>
//                   <option>This Month</option>
//                 </select>
//               </div>
//               <div className="relative">
//                 <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <select className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
//                   <option>Location</option>
//                   <option>London</option>
//                   <option>Manchester</option>
//                   <option>Bristol</option>
//                 </select>
//               </div>
//               <button className="bg-accent text-white py-4 px-8 rounded-xl font-semibold hover:bg-accent/90 transition-all hover-lift">
//                 Find Ticket
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Featured Singers */}
//       <section className="py-16 container mx-auto px-4">
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//           {featuredSingers.map((singer, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               className="group cursor-pointer"
//             >
//               <Link to={`/event/${singer.name.toLowerCase().replace(" ", "-")}`}>
//                 <div className="relative rounded-2xl overflow-hidden mb-3 hover-lift">
//                   <img
//                     src={singer.image || "/placeholder.svg"}
//                     alt={singer.name}
//                     className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                 </div>
//                 <h3 className="font-bold text-lg mb-1">{singer.name}</h3>
//                 <p className="text-sm text-muted-foreground mb-1">{singer.location}</p>
//                 <p className="text-sm text-muted-foreground mb-2">{singer.dates}</p>
//                 <p className="font-bold text-primary">{singer.price}</p>
//                 <button className="mt-2 w-full bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
//                   Book Now
//                 </button>
//               </Link>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* Benefits Section */}
//       <section className="py-16 bg-secondary/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold mb-4">Our Benefits</h2>
//             <p className="text-muted-foreground">We make sure you will get best of our service</p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {benefits.map((benefit, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-white p-8 rounded-2xl text-center hover-lift concert-shadow"
//               >
//                 <div className="flex justify-center mb-4">{benefit.icon}</div>
//                 <h3 className="font-bold text-xl mb-3">{benefit.title}</h3>
//                 <p className="text-muted-foreground text-sm">{benefit.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Time is Running Out Section */}
//       <section className="py-16 container mx-auto px-4">
//         <div className="text-center mb-8">
//           <h2 className="text-4xl font-bold mb-4">Time is Running Out!</h2>
//           <div className="flex justify-center items-center space-x-4">
//             <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
//               ←
//             </button>
//             <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
//               →
//             </button>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//           {featuredSingers.slice(0, 5).map((singer, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               className="group cursor-pointer"
//             >
//               <div className="relative rounded-2xl overflow-hidden mb-3 hover-lift">
//                 <img
//                   src={singer.image || "/placeholder.svg"}
//                   alt={singer.name}
//                   className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//                 <div className="absolute top-4 right-4 bg-destructive text-white px-4 py-1 rounded-full text-sm font-semibold">
//                   20% OFF
//                 </div>
//               </div>
//               <h3 className="font-bold text-lg mb-1">{singer.name}</h3>
//               <p className="text-sm text-muted-foreground mb-2">{singer.dates}</p>
//               <p className="font-bold text-primary mb-2">{singer.price}</p>
//               <Link to={`/event/${singer.name.toLowerCase().replace(" ", "-")}`}>
//                 <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors">
//                   Book Now
//                 </button>
//               </Link>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* Upcoming Concerts */}
//       <section className="py-16 container mx-auto px-4">
//         <div className="text-center mb-8">
//           <h2 className="text-4xl font-bold mb-4">Upcoming Concerts</h2>
//           <p className="text-muted-foreground">We are here to listen from you deliver excellence</p>
//           <div className="flex justify-center items-center space-x-4 mt-6">
//             <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
//               ←
//             </button>
//             <button className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-secondary transition-colors">
//               →
//             </button>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//           {upcomingConcerts.map((concert, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               className="relative rounded-2xl overflow-hidden h-64 cursor-pointer hover-lift"
//             >
//               <img
//                 src={`https://images.unsplash.com/photo-${1470000000000 + index * 10000000}?w=400&h=600&fit=crop`}
//                 alt={concert.title}
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
//                 <h3 className="text-white font-bold text-lg mb-1">{concert.title}</h3>
//                 <p className="text-white/80 text-sm">{concert.date}</p>
//                 <button className="mt-3 bg-white text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
//                   View Details
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       <Footer />
//     </div>
//   )
// }

// export default Index
