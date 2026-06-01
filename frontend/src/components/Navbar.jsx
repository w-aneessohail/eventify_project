"use client";

import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoutePath } from "@/enum/routePath";
import { AuthContext } from "@/context/AuthContext";

const Navbar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { user, isAuthenticated, logout } = useContext(AuthContext);

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
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={RoutePath.HOME} className="flex items-center space-x-2">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
            >
              <path d="M3 7H7V17H3V7Z" fill="currentColor" />
              <path d="M9 4H13V20H9V4Z" fill="currentColor" />
              <path d="M15 10H19V14H15V10Z" fill="currentColor" />
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-2xl font-bold text-foreground tracking-wider">
              EVENTIFY
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to={RoutePath.HOME}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to={RoutePath.ATTENDEE_ALL_EVENTS}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Events
            </Link>
            <Link
              to={RoutePath.ATTENDEE_CATEGORIES}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Categories
            </Link>
            <Link
              to={RoutePath.ATTENDEE_CONTACT}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Contact Us
            </Link>
            <Link
              to={RoutePath.ATTENDEE_ABOUT}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              About Us
            </Link>
            <Link
              to={RoutePath.ATTENDEE_REVIEWS}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Reviews
            </Link>
          </div>

          {/* Right Side Actions */}
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
                      to={RoutePath.ATTENDEE_PROFILE}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
