// src/pages/dashBoardPages/OrganizerStats.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";
import { HttpMethod } from "../../enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";
import { RoutePath } from "@/enum/routePath";

const PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 5;

export default function OrganizerStats() {
  const { user, loading: authLoading } = useAuth(); // logged-in user/profile
  const { fetchData } = useAxios();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state for tabs & pagination
  const [activeTab, setActiveTab] = useState("approved"); // 'approved' | 'pending' | 'rejected'
  const [page, setPage] = useState(1);

  // refs to prevent duplicate concurrent fetches and to support abort on unmount
  const isFetchingRef = useRef(false);
  const abortRef = useRef(false);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Fetch events for organizer
  useEffect(() => {
    // guard: only execute when auth finished and user exists
    if (authLoading || !user) return;

    // Require a real organizer profile — admins use AdminDashboard instead.
    const organizerId = user.organizer?.id;
    if (!organizerId) {
      setError("No organizer profile found for this account");
      setLoading(false);
      return;
    }

    // avoid starting another fetch if one is in progress
    if (isFetchingRef.current) return;

    abortRef.current = false;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    const loadEvents = async () => {
      try {
        // Note: don't include fetchData in deps of useEffect; assume fetchData may be unstable.
        const allEvents = await fetchData({
          url: "/events",
          method: HttpMethod.GET,
          params: { limit: API_LIST_LIMIT, organizerId },
        });

        if (abortRef.current) return; // component unmounted/cancelled

        if (!Array.isArray(allEvents)) {
          setEvents([]);
          setError("No events data found");
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }

        // Filter events owned by this organizer
        const organizerEvents = allEvents.filter((e) => {
          // support e.organizer being an object {id} or primitive id
          const ownerId =
            e.organizer && typeof e.organizer === "object" ? e.organizer.id : e.organizer;
          return String(ownerId) === String(organizerId);
        });

        // Sort by newest first (tries createdAt, then eventDate, then date, fallback to id)
        const sorted = [...organizerEvents].sort((a, b) => {
          const ta = new Date(a.createdAt || a.eventDate || a.date || 0).getTime() || 0;
          const tb = new Date(b.createdAt || b.eventDate || b.date || 0).getTime() || 0;
          if (tb !== ta) return tb - ta;
          // fallback numeric compare if possible
          const aid = Number(a.id ?? a._id ?? 0);
          const bid = Number(b.id ?? b._id ?? 0);
          return bid - aid;
        });

        setEvents(sorted);
        setError(null);
      } catch (err) {
        console.error("loadEvents error:", err);
        // Provide clearer network error message
        const message =
          err?.message?.includes("Network") || err?.code === "ERR_NETWORK"
            ? "Network error: unable to reach events API. Is the backend running?"
            : err?.response?.data?.message || err?.message || "Failed to fetch events";
        setError(message);
        setEvents([]);
      } finally {
        if (!abortRef.current) setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadEvents();

    // cleanup: signal abort on unmount
    return () => {
      abortRef.current = true;
    };
    // intentionally NOT including fetchData in deps because many custom hooks return unstable functions
    // only re-run when authLoading or user changes
  }, [authLoading, user]);

  // Derived totals
  const totalEvents = events.length;

  const totalBookings = events.reduce(
    (sum, e) => sum + (Array.isArray(e.bookings) ? e.bookings.length : 0),
    0
  );

  const totalRevenue = events.reduce(
    (sum, e) =>
      sum +
      (Array.isArray(e.bookings)
        ? e.bookings.reduce((s, b) => s + Number(b.totalAmount || 0), 0)
        : 0),
    0
  );

  // Tab filtered lists (memoized)
  const approvedEvents = useMemo(
    () => events.filter((e) => String((e.status || "").toLowerCase()) === "approved"),
    [events]
  );

  const pendingEvents = useMemo(
    () => events.filter((e) => String((e.status || "").toLowerCase()) === "pending"),
    [events]
  );

  const rejectedEvents = useMemo(
    () => events.filter((e) => String((e.status || "").toLowerCase()) === "rejected"),
    [events]
  );

  // current list and pagination
  const currentList =
    activeTab === "approved"
      ? approvedEvents
      : activeTab === "pending"
        ? pendingEvents
        : rejectedEvents;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedEvents = currentList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // helper: per-event revenue
  const eventRevenue = (e) =>
    Array.isArray(e.bookings) ? e.bookings.reduce((s, b) => s + Number(b.totalAmount || 0), 0) : 0;

  // page button numbers (centered window, up to MAX_PAGE_BUTTONS)
  const pageNumbers = useMemo(() => {
    const total = totalPages;
    const maxButtons = Math.min(MAX_PAGE_BUTTONS, total);
    const half = Math.floor(maxButtons / 2);

    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = Math.min(maxButtons, total);
    }

    if (end > total) {
      end = total;
      start = Math.max(1, total - maxButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  if (authLoading || loading) {
    return <div className="p-6">Loading organizer stats…</div>;
  }

  if (!user) {
    return <div className="p-6">No user logged in</div>;
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Organizer Stats</h2>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded mb-4">{error}</div>}

      {String(user.organizer?.verificationStatus || "").toLowerCase() === "pending" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-4">
          <div className="text-sm font-semibold text-yellow-900">Pending approval</div>
          <p className="text-sm text-yellow-800 mt-1">
            Your organizer account is under review. You can prepare events, but they will not go live until approved.
          </p>
        </div>
      )}

      {String(user.organizer?.verificationStatus || "").toLowerCase() === "rejected" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
          <div className="text-sm font-semibold text-red-900">Rejected</div>
          {user.organizer?.rejectionReason ? (
            <p className="text-sm text-red-800 mt-1">
              <span className="font-medium">Reason:</span> {user.organizer.rejectionReason}
            </p>
          ) : (
            <p className="text-sm text-red-800 mt-1">
              Your organizer account was not approved. Update your profile details and contact support if needed.
            </p>
          )}
          <Link
            to={RoutePath.ORGANIZER_PROFILE}
            className="inline-block mt-2 text-sm font-medium text-red-900 underline"
          >
            Update organizer profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Events</div>
          <div className="mt-2 text-2xl font-semibold">{totalEvents}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Bookings</div>
          <div className="mt-2 text-2xl font-semibold">{totalBookings}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Estimated Revenue</div>
          <div className="mt-2 text-2xl font-semibold">PKR {Number(totalRevenue).toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent events you posted</h3>
          <div className="text-sm text-gray-500">
            Showing {currentList.length} event{currentList.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setActiveTab("approved");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "approved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
            }`}
          >
            Approved{" "}
            <span className="ml-2 inline-block bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {approvedEvents.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("pending");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
            }`}
          >
            Pending{" "}
            <span className="ml-2 inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {pendingEvents.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("rejected");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"
            }`}
          >
            Rejected{" "}
            <span className="ml-2 inline-block bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {rejectedEvents.length}
            </span>
          </button>
        </div>

        {/* Event list with pagination */}
        <div className="space-y-3">
          {paginatedEvents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {activeTab === "approved"
                ? "No approved events yet. Create your first event to get started."
                : activeTab === "pending"
                  ? "No events awaiting approval."
                  : activeTab === "rejected"
                    ? "No rejected events."
                    : "No events found."}
              {activeTab === "approved" && totalEvents === 0 && (
                <div className="mt-3">
                  <Link
                    to={RoutePath.ORGANIZER_POST_EVENT}
                    className="text-sky-700 font-medium underline"
                  >
                    Post an event
                  </Link>
                </div>
              )}
            </div>
          ) : (
            paginatedEvents.map((e) => (
              <div key={e.id ?? e._id} className="p-4 border rounded flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold">{e.title}</div>
                  {e.rejectionReason && activeTab === "rejected" && (
                    <div className="text-xs text-red-700 mt-2 bg-red-50 rounded px-2 py-1">
                      <span className="font-medium">Rejected</span>
                      <br />
                      <span className="font-medium">Reason:</span> {e.rejectionReason}
                    </div>
                  )}
                  {activeTab === "rejected" && (
                    <Link
                      to={RoutePath.ORGANIZER_POST_EVENT}
                      className="inline-block mt-2 text-xs text-sky-700 underline"
                    >
                      Post an updated event
                    </Link>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    {Array.isArray(e.bookings) ? e.bookings.length : 0} bookings • PKR {eventRevenue(e).toLocaleString()}
                  </div>
                </div>

                <div className="ml-4 text-sm">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      String((e.status || "").toLowerCase()) === "approved"
                        ? "bg-green-100 text-green-800"
                        : String((e.status || "").toLowerCase()) === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {e.status ?? "pending"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>

            {/* numeric page buttons */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded ${pageNum === currentPage ? "bg-sky-600 text-white" : "bg-gray-100"}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
