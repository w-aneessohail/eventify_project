import { useCallback, useEffect, useMemo, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";
import { statusBadgeClass, normalizeStatus } from "@/utils/adminHelpers";
import { formatEventDate } from "@/utils/mediaUrl";

const TABS = ["pending", "approved", "rejected", "all"];

export default function AdminEvents() {
  const { fetchData } = useAxios();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData({
        url: "/events",
        method: HttpMethod.GET,
        params: { limit: API_LIST_LIMIT },
      });

      if (!Array.isArray(data)) {
        setEvents([]);
        setError("Could not load events");
        return;
      }

      setEvents(data);
    } catch (err) {
      setError(err?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return events;
    return events.filter((e) => normalizeStatus(e.status) === activeTab);
  }, [events, activeTab]);

  const organizerLabel = (event) => {
    const org = event.organizer;
    if (!org) return "—";
    if (typeof org === "object") {
      return org.organizationName || org.organizerName || `Organizer #${org.id}`;
    }
    return `Organizer #${org}`;
  };

  const categoryLabel = (event) => {
    const cat = event.category;
    if (!cat) return "—";
    if (typeof cat === "object") return cat.name || cat.title || `Category #${cat.id}`;
    return String(cat);
  };

  const handleAction = async (eventId, action) => {
    const label = action === "approve" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} this event?`)) {
      return;
    }

    let reason;
    if (action === "reject") {
      const input = window.prompt(
        "Rejection reason (optional — shown to the organizer):",
        ""
      );
      if (input === null) return;
      reason = input.trim();
    }

    setActingId(eventId);
    setActionMessage(null);

    const result = await fetchData({
      url: `/events/${eventId}/${action}`,
      method: HttpMethod.POST,
      data: reason ? { reason } : undefined,
    });

    setActingId(null);

    if (!result) {
      setActionMessage({
        type: "error",
        text: `Failed to ${label} event. The organizer may not be approved yet.`,
      });
      return;
    }

    setActionMessage({
      type: "success",
      text: `Event ${label}d successfully.`,
    });
    await loadEvents();
  };

  const handleDelete = async (event) => {
    if (
      !window.confirm(
        `Delete event "${event.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setActingId(event.id);
    setActionMessage(null);

    try {
      await fetchData({
        url: `/events/${event.id}`,
        method: HttpMethod.DELETE,
      });
      setActionMessage({ type: "success", text: "Event deleted successfully." });
      await loadEvents();
    } catch {
      setActionMessage({
        type: "error",
        text: "Failed to delete event. Please try again.",
      });
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading events…</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Event Moderation</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review events submitted by organizers before they go live.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize ${
              activeTab === tab
                ? "bg-sky-100 text-sky-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}

      {actionMessage && (
        <div
          className={`p-3 rounded text-sm ${
            actionMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-600">
          {activeTab === "pending"
            ? "No pending events. All submitted events have been reviewed."
            : `No ${activeTab === "all" ? "" : activeTab + " "}events found.`}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Organizer</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEvents.map((event) => {
                const status = normalizeStatus(event.status);
                const isPending = status === "pending";

                return (
                  <tr key={event.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{event.title}</div>
                      {event.rejectionReason && status === "rejected" && (
                        <div className="text-xs text-red-700 mt-1">
                          Reason: {event.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{organizerLabel(event)}</td>
                    <td className="px-4 py-3">{categoryLabel(event)}</td>
                    <td className="px-4 py-3">{formatEventDate(event.eventDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadgeClass(event.status)}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              disabled={actingId === event.id}
                              onClick={() => handleAction(event.id, "approve")}
                              className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actingId === event.id}
                              onClick={() => handleAction(event.id, "reject")}
                              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          disabled={actingId === event.id}
                          onClick={() => handleDelete(event)}
                          className="px-3 py-1.5 rounded-md bg-gray-700 text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                          {actingId === event.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
