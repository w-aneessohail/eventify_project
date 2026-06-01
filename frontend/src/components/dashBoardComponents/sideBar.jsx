// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, CalendarPlus, Calendar, Star, LogOut, X } from "lucide-react";
import { RoutePath } from "@/enum/routePath";

const ORGANIZER_NAV = [
  { to: RoutePath.ORGANIZER_DASHBOARD, label: "Dashboard", icon: Home },
  {
    to: RoutePath.ORGANIZER_POST_EVENT,
    label: "Post an Event",
    icon: CalendarPlus,
  },
  { to: RoutePath.ORGANIZER_BOOKINGS, label: "Bookings", icon: Calendar },
  { to: RoutePath.ORGANIZER_REVIEWS, label: "Reviews", icon: Star },
];

const ADMIN_NAV = [
  { to: RoutePath.ADMIN_DASHBOARD, label: "Dashboard", icon: Home },
  { to: RoutePath.ADMIN_BOOKINGS, label: "Bookings", icon: Calendar },
  { to: RoutePath.ADMIN_REVIEWS, label: "Reviews", icon: Star },
];

export default function Sidebar({ isOpen, onClose, panel = "organizer" }) {
  const isAdmin = panel === "admin";
  const nav = isAdmin ? ADMIN_NAV : ORGANIZER_NAV;
  const panelLabel = isAdmin ? "Admin Panel" : "Organizer Panel";
  const logoutPath = isAdmin ? RoutePath.ADMIN_LOGOUT : RoutePath.ORGANIZER_LOGOUT;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 transform transition-transform duration-200 ease-in-out
          bg-gradient-to-b from-sky-800 to-sky-700 text-white flex-shrink-0 md:relative md:translate-x-0
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:block`}
        role="navigation"
        aria-label="Main"
      >
        <div className="flex flex-col h-full min-h-full">
          {/* Mobile header with close */}
          <div className="px-4 py-3 md:hidden flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10">
                <svg
                  className="h-5 w-5 text-white/90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 2v6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 10c0-3.314 2.686-6 6-6s6 2.686 6 6c0 2.5-2 4.5-4 5v5h-4v-5c-2-.5-4.001-2.5-4.001-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">EVENTIFY</div>
                <div className="text-xs text-white/80">{panelLabel}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden md:flex px-6 py-6 items-center gap-3 border-b border-white/10">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10">
              <svg
                className="h-6 w-6 text-white/90"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M12 2v6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 10c0-3.314 2.686-6 6-6s6 2.686 6 6c0 2.5-2 4.5-4 5v5h-4v-5c-2-.5-4.001-2.5-4.001-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">EVENTIFY</div>
              <div className="text-xs text-white/80">{panelLabel}</div>
            </div>
          </div>

          <nav className="flex-1 px-2 py-6 space-y-2 overflow-auto">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 no-underline ` +
                  (isActive
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-white/90 hover:bg-white hover:text-sky-700")
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-white/5">
            <NavLink
              to={logoutPath}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 text-white/90 hover:bg-white hover:text-sky-700 no-underline"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Logout</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
