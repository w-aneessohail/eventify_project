// src/components/Topbar.jsx
import React from "react";
import { Bell, Menu } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { RoutePath } from "@/enum/routePath";







export default function Topbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showAccountMenu, setShowAccountMenu] = useState(false);




  const menuRef = useRef(null);
  const getInitial = () => {
    if (!user) return "U";
    const firstName = user.firstName || user.first_name || "";
    const lastName = user.lastName || user.last_name || "";
    const name = user.name || user.fullName || user.email || "";

    const displayName = firstName
      ? lastName
        ? `${firstName} ${lastName}`
        : firstName
      : name;

    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "U";
    const first = parts[0][0] ?? "U";
    const second = parts.length > 1 ? parts[1][0] ?? "" : "";
    return (first + second).toUpperCase();
  };


  
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("click", onClickOutside);

    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    setShowAccountMenu(false);
    logout();
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setShowAccountMenu((s) => !s);
      return;
    }
    navigate(RoutePath.LOGIN);
  };


  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white border-b shadow-sm">
      <div className="flex items-center gap-3">
        {/* mobile toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="text-lg font-semibold text-gray-800">
          Organzier Dashboard
        </h1>
      </div>
      {/* 
      <div className="hidden md:flex flex-1 justify-center">
        <input
          type="text"
          placeholder="Search anything"
          className="border border-gray-300 rounded-lg px-4 py-2 w-1/2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-600"
        />
      </div> */}

      <div className="flex items-center gap-5">
        <button className="relative text-gray-600 hover:text-sky-700">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={menuRef}>
            {/* If authenticated show avatar only, else show Login/Register */}
            {isAuthenticated && user ? (
              <button
                onClick={handleAccountClick}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150"
                aria-label="account"
                title="Account"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  {getInitial()}
                </div>
              </button>
            ) : (
              <button
                onClick={handleAccountClick}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium hover:bg-accent transition-all duration-200"
              >
                Login / Register
              </button>
            )}

            <AnimatePresence>
              {isAuthenticated && showAccountMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-border overflow-hidden"
                >
                  <Link
                    to={RoutePath.ORGANIZER_PROFILE}
                    className="block px-4 py-3 text-primary hover:bg-secondary transition-colors"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Profile
                  </Link>

                  <div className="border-t border-border" />

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* user */}
        {/* <div className="flex items-center gap-2">
          <div className="bg-sky-700 text-white rounded-full w-9 h-9 flex items-center justify-center font-medium">MW</div>
          <div className="hidden md:flex items-center gap-1 text-gray-800">
            <span className="text-sm font-semibold">Alanaoud</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
        </div> */}
      </div>
    </header>
  );
}
