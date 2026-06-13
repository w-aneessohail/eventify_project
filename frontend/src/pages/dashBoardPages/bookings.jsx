// src/pages/dashBoardPages/OrganizerEventBookings.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";

const EVENTS_PER_PAGE = 8;
const BOOKINGS_PER_PAGE = 6;

function normalizeEvent(ev, bookingsByEvent = {}, usersMap = {}) {
  const id = ev.id ?? ev.eventId ?? ev._id ?? null;
  const title = ev.title ?? ev.name ?? "Untitled event";
  const price = Number(ev.price ?? ev.ticketPrice ?? ev.ticket_price ?? 0);
  const totalTickets = Number(
    ev.totalTickets ?? ev.total_tickets ?? ev.total ?? 0
  );
  const category =
    (ev.category && (ev.category.name ?? ev.category.title)) ??
    ev.category ??
    "uncategorized";
  const eventDate = ev.eventDate ?? ev.event_date ?? ev.date ?? null;

  // Use bookings passed in (bookingsByEvent[eventId]) OR ev.bookings
  const bookingsRaw = Array.isArray(bookingsByEvent[id])
    ? bookingsByEvent[id]
    : Array.isArray(ev.bookings)
    ? ev.bookings
    : Array.isArray(ev.tickets)
    ? ev.tickets
    : [];

  // Map bookings and fill attendeeName/email from usersMap if available
  const mappedBookings = (bookingsRaw || []).map((b) => {
    const attendeeId =
      b.attendeeId ??
      b.attendee_id ??
      b.userId ??
      b.user_id ??
      b.user?.id ??
      b.attendee?.id ??
      null;

    // prefer explicit booking fields, otherwise use usersMap lookup
    const user = attendeeId ? usersMap[String(attendeeId)] : null;
    const attendeeName =
      b.attendeeName ??
      b.attendee_name ??
      b.user?.name ??
      b.user?.fullName ??
      user?.name ??
      user?.fullName ??
      "Attendee";
    const attendeeEmail =
      b.attendeeEmail ?? b.attendee_email ?? b.user?.email ?? user?.email ?? null;
    const ticketCount = Number(b.ticketCount ?? b.ticket_count ?? b.quantity ?? 1);
    const amount = Number(
      b.totalAmount ??
        b.total_amount ??
        b.amount ??
        (ticketCount ? ticketCount * price : price) ??
        0
    );

    return {
      bookingId: b.id ?? b.bookingId ?? b._id ?? null,
      attendeeId,
      attendeeName,
      attendeeEmail,
      ticketCount,
      amount,
      createdAt: b.createdAt ?? b.created_at ?? new Date().toISOString(),
      status: b.status ?? "confirmed",
      raw: b,
    };
  });

  return {
    id,
    title,
    category,
    eventDate,
    totalTickets,
    price,
    bookings: mappedBookings,
    raw: ev,
    status: (ev.status ?? "pending").toString().toLowerCase(),
  };
}

export default function OrganizerEventBookings() {
  const { fetchData } = useAxios();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [eventsPage, setEventsPage] = useState(1);
  const [openEventId, setOpenEventId] = useState(null);
  const [eventSearch, setEventSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // per-event state
  const [bookingsPages, setBookingsPages] = useState({});
  const [attendeeFilters, setAttendeeFilters] = useState({});

  // internal refs to avoid multiple fetches/loops
  const isFetchingRef = useRef(false);
  const abortRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    abortRef.current = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1) fetch events
        const evResp = await fetchData({
          url: "/events",
          method: HttpMethod.GET,
          params: { limit: API_LIST_LIMIT },
        });
        const evList = Array.isArray(evResp)
          ? evResp
          : Array.isArray(evResp?.data)
          ? evResp.data
          : Array.isArray(evResp?.events)
          ? evResp.events
          : [];

        // 2) fetch bookings (this endpoint requires auth in your backend)
        //    We'll fetch all bookings and then group them by eventId for fast lookup.
        const bookingsResp = await fetchData({
          url: "/bookings",
          method: HttpMethod.GET,
          params: { limit: API_LIST_LIMIT },
        });
        const bookingsList = Array.isArray(bookingsResp)
          ? bookingsResp
          : Array.isArray(bookingsResp?.data)
          ? bookingsResp.data
          : Array.isArray(bookingsResp?.bookings)
          ? bookingsResp.bookings
          : [];

        // 3) group bookings by event id
        const bookingsByEvent = {};
        const attendeeIdSet = new Set();
        bookingsList.forEach((b) => {
          // try multiple possible fields for event id
          const eventId =
            b.eventId ?? b.event_id ?? b.event?.id ?? b.event ?? b.eventId;
          if (!eventId) return;
          const key = String(eventId);
          bookingsByEvent[key] = bookingsByEvent[key] || [];
          bookingsByEvent[key].push(b);

          // collect attendee/user id for later user lookup
          const attendeeId =
            b.attendeeId ?? b.attendee_id ?? b.userId ?? b.user_id ?? b.user?.id ?? b.attendee?.id;
          if (attendeeId) attendeeIdSet.add(String(attendeeId));
        });

        // 4) fetch user info for each attendeeId (backend may have better batch endpoint)
        //    IMPORTANT: this issues one request per attendee id. If you have 100s, replace with /users?ids=...
        const usersMap = {};
        if (attendeeIdSet.size > 0) {
          // turn set into array and fetch each user
          const ids = Array.from(attendeeIdSet);
          // try batch fetch first (if your backend supports it)
          // try /users?ids=1,2,3 (you can remove this fallback if not supported)
          try {
            const batchResp = await fetchData({
              url: `/users?ids=${ids.join(",")}`,
              method: HttpMethod.GET,
            });
            const batchList = Array.isArray(batchResp)
              ? batchResp
              : Array.isArray(batchResp?.data)
              ? batchResp.data
              : Array.isArray(batchResp?.users)
              ? batchResp.users
              : null;

            if (Array.isArray(batchList) && batchList.length) {
              batchList.forEach((u) => {
                usersMap[String(u.id ?? u._id ?? u.userId)] = u;
              });
            } else {
              // fallback: fetch individually
              await Promise.all(
                ids.map(async (id) => {
                  try {
                    const userResp = await fetchData({ url: `/users/${id}`, method: HttpMethod.GET });
                    const u = userResp?.data ?? userResp;
                    if (u) usersMap[String(id)] = u;
                  } catch (e) {
                    // ignore individual failures
                  }
                })
              );
            }
          } catch (e) {
            // If batch fails, fallback to individual calls
            await Promise.all(
              ids.map(async (id) => {
                try {
                  const userResp = await fetchData({ url: `/users/${id}`, method: HttpMethod.GET });
                  const u = userResp?.data ?? userResp;
                  if (u) usersMap[String(id)] = u;
                } catch (err) {
                  // ignore
                }
              })
            );
          }
        }

        // 5) fetch categories
        const catResp = await fetchData({ url: "/categories", method: HttpMethod.GET });
        const catList = Array.isArray(catResp)
          ? catResp
          : Array.isArray(catResp?.data)
          ? catResp.data
          : Array.isArray(catResp?.categories)
          ? catResp.categories
          : [];

        if (abortRef.current) return;

        // 6) normalize events merging bookings/users info
        const normalized = evList.map((ev) => normalizeEvent(ev, bookingsByEvent, usersMap));

        // build category set
        const set = new Set(["all"]);
        catList.forEach((c) => {
          const name = c.name ?? c.title ?? String(c);
          if (name) set.add(name);
        });
        normalized.forEach((e) => set.add(e.category ?? "uncategorized"));

        setEvents(normalized);
        setCategories(Array.from(set));
        setError(null);
      } catch (err) {
        console.error("load events/categories error:", err);
        const message =
          err?.message?.includes("Network") || err?.code === "ERR_NETWORK"
            ? "Network error: unable to reach API. Is backend running?"
            : err?.response?.data?.message || err?.message || "Failed to load events";
        setError(message);
        setEvents([]);
        setCategories(["all"]);
      } finally {
        if (!abortRef.current) setLoading(false);
        isFetchingRef.current = false;
      }
    })();

    return () => {
      abortRef.current = true;
    };
    // run on mount only
  }, []); // intentionally empty deps

  // derived filtered and paginated events
  const filteredEvents = useMemo(() => {
    const q = (eventSearch || "").trim().toLowerCase();
    return events.filter((e) => {
      if (categoryFilter && categoryFilter !== "all" && (e.category || "").toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (q && !((e.title || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [events, eventSearch, categoryFilter]);

  const totalEvents = filteredEvents.length;
  const eventsTotalPages = Math.max(1, Math.ceil(totalEvents / EVENTS_PER_PAGE));
  const eventsStart = (eventsPage - 1) * EVENTS_PER_PAGE;
  const pageEvents = filteredEvents.slice(eventsStart, eventsStart + EVENTS_PER_PAGE);

  // helpers for accordion & bookings pagination
  const toggleAccordion = (eventId) => {
    setOpenEventId((prev) => (prev === eventId ? null : eventId));
    if (openEventId !== eventId) {
      setAttendeeFilters((p) => ({ ...p, [eventId]: "" }));
      setBookingsPages((p) => ({ ...p, [eventId]: 1 }));
    }
  };

  const handleEventPage = (newPage) => {
    setEventsPage(newPage);
    setOpenEventId(null);
  };

  const handleBookingsPage = (eventId, newPage) => {
    setBookingsPages((prev) => ({ ...prev, [eventId]: newPage }));
  };

  const handleAttendeeFilter = (eventId, text) => {
    setAttendeeFilters((prev) => ({ ...prev, [eventId]: text }));
    setBookingsPages((prev) => ({ ...prev, [eventId]: 1 }));
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-500">Bookings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage events and attendees.</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="bg-white p-3 rounded shadow text-center w-36">
            <div className="text-xs text-gray-500">Showing events</div>
            <div className="text-xl font-bold text-indigo-500">{pageEvents.length}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search event by title..."
            value={eventSearch}
            onChange={(e) => { setEventSearch(e.target.value); setEventsPage(1); }}
            className="px-3 py-2 rounded border w-full md:w-80"
          />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setEventsPage(1); }}
            className="px-3 py-2 rounded border"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">Showing {pageEvents.length} of {totalEvents} events</div>
      </div>

      {loading ? (
        <div className="p-6 bg-white rounded shadow text-center">Loading events…</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded shadow">{error}</div>
      ) : (
        <>
          <div className="space-y-4">
            {pageEvents.map((event) => {
              const { id, title, category, eventDate, totalTickets, price, bookings } = event;

              const totalBookings = Array.isArray(bookings) ? bookings.length : 0;
              const totalBookedSeats = Array.isArray(bookings) ? bookings.reduce((s, b) => s + (b.ticketCount || 0), 0) : 0;
              const totalRevenue = Array.isArray(bookings) ? bookings.reduce((s, b) => s + (b.amount || 0), 0) : 0;
              const seatsLeft = Math.max((totalTickets || 0) - totalBookedSeats, 0);

              const attendeeQuery = (attendeeFilters[id] || "").trim().toLowerCase();
              const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter((b) => {
                if (!attendeeQuery) return true;
                const name = String(b.attendeeName ?? "").toLowerCase();
                const email = String(b.attendeeEmail ?? "").toLowerCase();
                const idStr = String(b.attendeeId ?? "");
                return name.includes(attendeeQuery) || email.includes(attendeeQuery) || idStr.includes(attendeeQuery);
              });

              const bp = bookingsPages[id] || 1;
              const bookingsTotalPages = Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE));
              const bookStart = (bp - 1) * BOOKINGS_PER_PAGE;
              const pageBookings = filteredBookings.slice(bookStart, bookStart + BOOKINGS_PER_PAGE);

              return (
                <div key={id} className="relative bg-white rounded shadow-md border-l-4 border-slate-400 overflow-hidden">
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <div className="bg-emerald-700 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">{totalBookings} Bookings</div>
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">PKR {Math.round(totalRevenue).toLocaleString()}</div>
                    <div className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">{seatsLeft} Seats Left</div>
                  </div>

                  <button
                    onClick={() => toggleAccordion(id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition"
                  >
                    <div>
                      <div className="text-lg font-semibold text-slate-800">{title}</div>
                      <div className="text-sm text-gray-500">{eventDate ? new Date(eventDate).toLocaleString() : "-"}</div>
                      <div className="text-xs mt-1 inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-xs">{category}</span>
                        <span className="text-gray-500"> • Price: PKR {Number(price || 0).toFixed(2)}</span>
                        <span className="text-gray-500"> • Tickets: {totalTickets}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">PKR {Math.round(totalRevenue).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{totalBookings} bookings</div>
                      <div className={`transform transition-transform duration-300 ${openEventId === id ? "rotate-90" : "rotate-0"}`}>
                        <svg className="w-6 h-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M7 5l6 5-6 5V5z" /></svg>
                      </div>
                    </div>
                  </button>

                  {openEventId === id && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white rounded p-3 shadow">
                          <div className="text-xs text-gray-500">Total Tickets</div>
                          <div className="font-bold">{totalTickets}</div>
                        </div>
                        <div className="bg-white rounded p-3 shadow">
                          <div className="text-xs text-gray-500">Sold Seats</div>
                          <div className="font-bold text-green-600">{totalBookedSeats}</div>
                        </div>
                        <div className="bg-white rounded p-3 shadow">
                          <div className="text-xs text-gray-500">Event Revenue</div>
                          <div className="font-bold text-amber-600">PKR {Math.round(totalRevenue).toLocaleString()}</div>
                        </div>
                        <div className="bg-white rounded p-3 shadow">
                          <div className="text-xs text-gray-500">Seats Left</div>
                          <div className="font-bold">{seatsLeft}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="text"
                          placeholder="Filter attendees by name, email or id..."
                          value={attendeeFilters[id] || ""}
                          onChange={(e) => handleAttendeeFilter(id, e.target.value)}
                          className="px-3 py-2 rounded border w-full md:w-1/2"
                        />
                        <div className="text-sm text-gray-600">{filteredBookings.length} matching bookings</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pageBookings.length === 0 ? (
                          <div className="col-span-full text-center text-gray-500 p-6 bg-white rounded shadow">No bookings found.</div>
                        ) : (
                          pageBookings.map((b) => (
                            <div key={b.bookingId ?? `${id}-${b.attendeeId}`} className="bg-white p-3 rounded shadow hover:shadow-lg transition">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold">{b.attendeeName ?? "Attendee"}</div>
                                  <div className="text-xs text-gray-500">ID: {b.attendeeId ?? "-"}</div>
                                  {b.attendeeEmail && <div className="text-xs text-gray-500">Email: {b.attendeeEmail}</div>}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold">PKR {(b.amount || 0).toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">{b.ticketCount} ticket(s)</div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-700 mt-2 uppercase">{b.status}</div>
                              <div className="text-xs text-gray-400 mt-2">{new Date(b.createdAt).toLocaleString()}</div>
                            </div>
                          ))
                        )}
                      </div>

                      {bookingsTotalPages > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleBookingsPage(id, Math.max(1, bp - 1))}
                            disabled={bp <= 1}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:bg-gray-300"
                          >
                            Prev
                          </button>
                          <div className="text-sm text-gray-700">Page {bp} of {bookingsTotalPages}</div>
                          <button
                            onClick={() => handleBookingsPage(id, Math.min(bookingsTotalPages, bp + 1))}
                            disabled={bp >= bookingsTotalPages}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:bg-gray-300"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Events pagination */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => handleEventPage(Math.max(1, eventsPage - 1))}
              disabled={eventsPage <= 1}
              className="px-3 py-1 bg-slate-700 text-white rounded disabled:bg-gray-300"
            >
              Prev
            </button>
            <div className="text-sm text-gray-700">Page {eventsPage} of {eventsTotalPages}</div>
            <button
              onClick={() => handleEventPage(Math.min(eventsTotalPages, eventsPage + 1))}
              disabled={eventsPage >= eventsTotalPages}
              className="px-3 py-1 bg-slate-700 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
