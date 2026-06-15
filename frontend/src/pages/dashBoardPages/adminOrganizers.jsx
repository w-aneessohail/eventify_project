import { useCallback, useEffect, useMemo, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";
import { statusBadgeClass, normalizeStatus } from "@/utils/adminHelpers";
import { UserRole } from "@/enum/userRole";

const TABS = ["pending", "approved", "rejected", "all"];

export default function AdminOrganizers() {
  const { fetchData } = useAxios();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const loadOrganizers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await fetchData({
        url: "/users",
        method: HttpMethod.GET,
        params: { limit: API_LIST_LIMIT },
      });

      if (!Array.isArray(users)) {
        setOrganizers([]);
        setError("Could not load users");
        return;
      }

      const list = users
        .filter((u) => String(u?.role ?? "").toLowerCase() === UserRole.ORGANIZER)
        .filter((u) => u.organizer?.id)
        .map((u) => ({
          userId: u.id,
          name: u.name,
          email: u.email,
          organizerId: u.organizer.id,
          organizationName: u.organizer.organizationName,
          organizerName: u.organizer.organizerName,
          phone: u.organizer.phone,
          status: normalizeStatus(u.organizer.verificationStatus),
          rejectionReason: u.organizer.rejectionReason || null,
        }));

      setOrganizers(list);
    } catch (err) {
      setError(err?.message || "Failed to load organizers");
      setOrganizers([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadOrganizers();
  }, [loadOrganizers]);

  const filteredOrganizers = useMemo(() => {
    if (activeTab === "all") return organizers;
    return organizers.filter((o) => o.status === activeTab);
  }, [organizers, activeTab]);

  const handleAction = async (organizerId, action) => {
    const label = action === "approve" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} this organizer?`)) {
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

    setActingId(organizerId);
    setActionMessage(null);

    const result = await fetchData({
      url: `/organizers/${organizerId}/${action}`,
      method: HttpMethod.POST,
      data: reason ? { reason } : undefined,
    });

    setActingId(null);

    if (!result) {
      setActionMessage({
        type: "error",
        text: `Failed to ${label} organizer. Please try again.`,
      });
      return;
    }

    setActionMessage({
      type: "success",
      text: `Organizer ${label}d successfully.`,
    });
    await loadOrganizers();
  };

  if (loading) {
    return <div className="p-6">Loading organizers…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Organizer Moderation</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve organizer accounts awaiting verification.
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

      {filteredOrganizers.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-600">
          {activeTab === "pending"
            ? "No pending organizers. All organizer accounts are reviewed."
            : `No ${activeTab === "all" ? "" : activeTab + " "}organizers found.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrganizers.map((org) => (
            <div
              key={org.organizerId}
              className="bg-white rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <div className="font-medium">{org.organizationName}</div>
                <div className="text-sm text-gray-600">
                  {org.organizerName} · {org.email}
                </div>
                {org.phone && (
                  <div className="text-sm text-gray-500 mt-1">{org.phone}</div>
                )}
                <span
                  className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${statusBadgeClass(org.status)}`}
                >
                  {org.status}
                </span>
                {org.rejectionReason && org.status === "rejected" && (
                  <div className="mt-2 text-sm text-red-700 bg-red-50 rounded px-2 py-1">
                    <span className="font-medium">Reason:</span> {org.rejectionReason}
                  </div>
                )}
              </div>

              {org.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={actingId === org.organizerId}
                    onClick={() => handleAction(org.organizerId, "approve")}
                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={actingId === org.organizerId}
                    onClick={() => handleAction(org.organizerId, "reject")}
                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
