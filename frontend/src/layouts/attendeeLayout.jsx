import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from "react";


import { Outlet } from "react-router-dom";

export default function AttendeeLayout() {
 

  // optional: close sidebar on route change (if you use react-router hooks)


  return (
    // don't force a fixed viewport height here – allow page to grow
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet/>
      <Footer />
      </div>
  );
}

