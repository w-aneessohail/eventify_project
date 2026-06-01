// src/pages/dashBoardPages/OrganizerEventReviews.jsx
import React, { useEffect, useState, useRef } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { ChevronDown, ChevronRight } from "lucide-react";


const REVIEWS_PER_PAGE = 5;

/**
 * Helper: safe extract numeric id or string id
 */
function toId(x) {
  if (x === null || x === undefined) return null;
  if (typeof x === "number" || typeof x === "string") return String(x);
  if (x?.id) return String(x.id);
  if (x?._id) return String(x._id);
  return null;
}

/**
 * Render star SVGs — filled/unfilled — with a visible color.
 * filledColor and emptyColor chosen for strong contrast.
 */
function Stars({ rating = 0, size = 16 }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  const items = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= r;
    items.push(
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className={filled ? "text-amber-600" : "text-gray-300"}
        aria-hidden
      >
        <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.6 24 12 20.013 4.4 24l1.9-8.694L.6 9.75l7.732-1.732L12 .587z" />
      </svg>
    );
  }
  return <div className="flex items-center gap-1">{items}</div>;
}

export default function OrganizerEventReviews() {
  const { fetchData } = useAxios();
  const [eventsMap, setEventsMap] = useState({}); // eventId => { eventId, title, eventDate, reviews: [] }
  const [openEventId, setOpenEventId] = useState(null);
  const [reviewPages, setReviewPages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const usersCacheRef = useRef({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) fetch reviews (accept various shapes)
      const res = await fetchData({ url: "/event-reviews", method: HttpMethod.GET });
      const reviewsRaw = Array.isArray(res) ? res : res?.data ?? res?.reviews ?? res ?? [];
      if (!Array.isArray(reviewsRaw)) throw new Error("Unexpected response from /event-reviews");

      // 2) group reviews by event (the API returns review items each with eventId/userId)
      const map = {};
      const userIdSet = new Set();

      reviewsRaw.forEach((rRaw) => {
        // determine event id
        const eventId = rRaw.eventId ?? rRaw.event_id ?? rRaw.event?.id ?? rRaw.event;
        if (!eventId) return;

        const key = String(eventId);
        if (!map[key]) {
          map[key] = {
            eventId: key,
            title: rRaw.event?.title ?? rRaw.eventTitle ?? rRaw.event_name ?? `Event ${key}`,
            eventDate: rRaw.event?.eventDate ?? rRaw.event?.date ?? rRaw.event_date ?? null,
            reviews: [],
          };
        }

        // determine user/attendee id and name if present
        const userId = rRaw.userId ?? rRaw.attendeeId ?? rRaw.user_id ?? rRaw.attendee_id ?? rRaw.user?.id ?? rRaw.attendee?.id ?? null;
        const userIdStr = toId(userId);
        if (userIdStr) userIdSet.add(userIdStr);

        const reviewerName =
          rRaw.attendeeName ??
          rRaw.attendee_name ??
          rRaw.user?.name ??
          rRaw.user?.fullName ??
          rRaw.userName ??
          rRaw.reviewerName ??
          null;

        const rating = Number(rRaw.rating ?? rRaw.stars ?? 0);
        const comment = rRaw.comment ?? rRaw.text ?? "";
        const createdAt = rRaw.createdAt ?? rRaw.created_at ?? new Date().toISOString();

        map[key].reviews.push({
          id: rRaw.id ?? rRaw._id ?? null,
          userId: userIdStr,
          reviewerName, // may be null; we'll resolve from usersMap later
          rating,
          comment,
          createdAt,
          raw: rRaw,
        });
      });

      // 3) fetch missing users in batch (if any)
      const allUserIds = Array.from(userIdSet).filter((id) => !usersCacheRef.current[id]);
      if (allUserIds.length > 0) {
        // Try batch endpoint /users?ids=1,2,3
        try {
          const batchResp = await fetchData({
            url: "/users",
            method: HttpMethod.GET,
            params: { ids: allUserIds.join(",") },
          });
          const list = Array.isArray(batchResp) ? batchResp : batchResp?.data ?? batchResp?.users ?? null;
          if (Array.isArray(list) && list.length) {
            list.forEach((u) => {
              const uid = u.id ?? u._id ?? u.userId;
              if (uid) usersCacheRef.current[String(uid)] = u;
            });
          } else {
            // fallback individual fetch
            await Promise.all(
              allUserIds.map(async (id) => {
                try {
                  const uResp = await fetchData({ url: `/users/${id}`, method: HttpMethod.GET });
                  const u = uResp?.data ?? uResp;
                  if (u) usersCacheRef.current[String(id)] = u;
                } catch (e) {
                  // ignore per-user failure
                }
              })
            );
          }
        } catch (e) {
          // batch failed — fallback to individual
          await Promise.all(
            allUserIds.map(async (id) => {
              try {
                const uResp = await fetchData({ url: `/users/${id}`, method: HttpMethod.GET });
                const u = uResp?.data ?? uResp;
                if (u) usersCacheRef.current[String(id)] = u;
              } catch (err) {
                // ignore
              }
            })
          );
        }
      }

      // 4) fill missing reviewerName from usersCache
      Object.keys(map).forEach((evId) => {
        map[evId].reviews = map[evId].reviews.map((rv) => {
          if (!rv.reviewerName) {
            const u = rv.userId ? usersCacheRef.current[String(rv.userId)] : null;
            rv.reviewerName = u?.name ?? u?.fullName ?? (rv.userId ? `User ${rv.userId}` : "User");
          }
          return rv;
        });

        // sort reviews newest first (optional)
        map[evId].reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      if (!mountedRef.current) return;
      setEventsMap(map);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError(err?.message ?? "Failed to load reviews");
      setEventsMap({});
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAccordion = (eventId) => {
    setOpenEventId(openEventId === eventId ? null : eventId);
  };

  const handlePageChange = (eventId, newPage) => {
    setReviewPages((prev) => ({ ...prev, [eventId]: newPage }));
  };

  const eventsArray = Object.values(eventsMap);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-indigo-600">
        Organizer Event Reviews
      </h1>

      {loading ? (
        <div className="p-6 bg-white rounded shadow text-center text-slate-700">Loading reviews…</div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded shadow">{error}</div>
      ) : eventsArray.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center text-slate-500">
          No reviews found.
        </div>
      ) : (
        eventsArray.map((event) => {
          const currentPage = reviewPages[event.eventId] || 1;
          const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
          const endIdx = startIdx + REVIEWS_PER_PAGE;
          const paginatedReviews = event.reviews.slice(startIdx, endIdx);
          const totalPages = Math.ceil(event.reviews.length / REVIEWS_PER_PAGE);

          return (
            <div
              key={event.eventId}
              className="relative bg-white border-l-4 border-slate-300 rounded shadow-md"
            >
              {/* Total Reviews Badge */}
              <span className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
                {event.reviews.length} Review{event.reviews.length !== 1 ? "s" : ""}
              </span>

              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(event.eventId)}
                className="w-full flex justify-between items-center px-4 py-3 focus:outline-none hover:bg-slate-50 transition relative"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-indigo-600">{event.title}</h2>
                  <p className="text-sm text-slate-500">
                    {event.eventDate && new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="transform transition-transform duration-300 text-indigo-600 text-3xl">
                  {openEventId === event.eventId ? "⯆" : "⯈"}
                </div>
              </button>

              {/* Reviews List */}
              {openEventId === event.eventId && (
                <div className="px-4 py-4 border-t space-y-3">
                  {paginatedReviews.length === 0 ? (
                    <div className="text-slate-500 text-center">No reviews yet for this event.</div>
                  ) : (
                    paginatedReviews.map((review, idx) => {
                      const reviewerName = review.reviewerName ?? (review.userId ? `User ${review.userId}` : "User");
                      return (
                        <div
                          key={review.id ?? idx}
                          className="p-3 bg-white border rounded shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-800">{reviewerName}</span>
                            <Stars rating={review.rating} size={18} />
                          </div>
                          <p className="text-slate-700 mb-1">{review.comment}</p>
                          <div className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleString()}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Reviews Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(event.eventId, Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage <= 1}
                        className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="text-slate-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          handlePageChange(event.eventId, Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
