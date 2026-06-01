"use client"

import { motion } from "framer-motion"
import { Phone, Mail, Instagram, Facebook, Send } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Swal from "sweetalert2"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const Contact = () => {
  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    message: Yup.string().required("Message is required"),
  })

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "We will get back to you soon",
        confirmButtonColor: "#2b4c91",
      })
      resetForm()
    },
  })

  return (
    <div className="min-h-screen bg-background">
  

      {/* Header */}
      <section className="text-center py-16 border-b border-border">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground">We'd love to hear from you. contact us here.</p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Side - Contact Info with Background Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden h-[600px]"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop"
                alt="Concert"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-concert-blue via-concert-blue/90 to-concert-blue/80"></div>
            </div>

            <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
              <div>
                <h2 className="text-3xl font-bold mb-8">Contact Info:</h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Phone className="w-6 h-6" />
                    <div>
                      <p className="text-sm text-white/80">Call directly at:</p>
                      <p className="font-semibold">+1-235678354</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Mail className="w-6 h-6" />
                    <div>
                      <p className="text-sm text-white/80">Email:</p>
                      <p className="font-semibold">Ticketer@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Send size={24} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/50 p-12 rounded-3xl"
          >
            <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
            <p className="text-muted-foreground mb-8">Feel free to drop us a line below.</p>

            <form onSubmit={formik.handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{formik.errors.fullName}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-destructive text-sm mt-1">{formik.errors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-destructive text-sm mt-1">{formik.errors.phone}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
                />
                {formik.touched.message && formik.errors.message && (
                  <p className="text-destructive text-sm mt-1">{formik.errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-accent transition-all hover-lift"
              >
                Send
              </button>
            </form>
          </motion.div>
        </div>
      </section>

     
    </div>
  )
}

export default Contact
