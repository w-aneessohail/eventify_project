import { useCallback, useEffect, useMemo, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";
import { statusBadgeClass, normalizeStatus } from "@/utils/adminHelpers";
import { formatEventDate } from "@/utils/mediaUrl";

export default function AdminEvents() {
  const { fetchData } = useAxios();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actingId, setActingId] = useState(null);

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

  const pendingEvents = useMemo(
    () => events.filter((e) => normalizeStatus(e.status) === "pending"),
    [events]
  );

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

    setActingId(eventId);
    setActionMessage(null);

    const result = await fetchData({
      url: `/events/${eventId}/${action}`,
      method: HttpMethod.POST,
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

      {pendingEvents.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-600">
          No pending events. All submitted events have been reviewed.
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
              {pendingEvents.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3">{organizerLabel(event)}</td>
                  <td className="px-4 py-3">{categoryLabel(event)}</td>
                  <td className="px-4 py-3">{formatEventDate(event.eventDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadgeClass(event.status)}`}
                    >
                      {normalizeStatus(event.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
