import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";
import { RoutePath } from "@/enum/routePath";
import { UserRole } from "@/enum/userRole";
import { normalizeStatus } from "@/utils/adminHelpers";

export default function AdminDashboard() {
  const { fetchData } = useAxios();
  const [stats, setStats] = useState({
    pendingOrganizers: 0,
    approvedOrganizers: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    users: 0,
    bookings: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [events, bookings, users, payments] = await Promise.all([
          fetchData({
            url: "/events",
            method: HttpMethod.GET,
            params: { limit: API_LIST_LIMIT },
          }),
          fetchData({
            url: "/bookings",
            method: HttpMethod.GET,
            params: { limit: API_LIST_LIMIT },
          }),
          fetchData({
            url: "/users",
            method: HttpMethod.GET,
            params: { limit: API_LIST_LIMIT },
          }),
          fetchData({
            url: "/payments",
            method: HttpMethod.GET,
            params: { limit: API_LIST_LIMIT },
          }),
        ]);

        const eventList = Array.isArray(events) ? events : [];
        const userList = Array.isArray(users) ? users : [];

        const eventCounts = { approved: 0, pending: 0 };
        eventList.forEach((e) => {
          const s = normalizeStatus(e?.status);
          if (eventCounts[s] !== undefined) eventCounts[s]++;
        });

        const organizerCounts = { approved: 0, pending: 0 };
        userList
          .filter((u) => String(u?.role ?? "").toLowerCase() === UserRole.ORGANIZER)
          .forEach((u) => {
            const s = normalizeStatus(u?.organizer?.verificationStatus);
            if (organizerCounts[s] !== undefined) organizerCounts[s]++;
          });

        setStats({
          pendingOrganizers: organizerCounts.pending,
          approvedOrganizers: organizerCounts.approved,
          pendingEvents: eventCounts.pending,
          approvedEvents: eventCounts.approved,
          users: userList.length,
          bookings: Array.isArray(bookings) ? bookings.length : 0,
          payments: Array.isArray(payments) ? payments.length : 0,
        });
      } catch (err) {
        setError(err?.message || "Failed to load platform overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchData]);

  if (loading) {
    return <div className="p-6">Loading platform overview…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Admin Overview</h2>
      <p className="text-sm text-gray-600 mb-6">
        Platform snapshot. Use the sidebar to moderate organizers and events.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Pending Organizers" value={stats.pendingOrganizers} />
        <StatCard label="Approved Organizers" value={stats.approvedOrganizers} />
        <StatCard label="Pending Events" value={stats.pendingEvents} />
        <StatCard label="Approved Events" value={stats.approvedEvents} />
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Bookings" value={stats.bookings} />
        <StatCard label="Payments" value={stats.payments} />
      </div>

      <div className="bg-white rounded shadow p-4 text-sm text-gray-600 space-y-2">
        <p>Quick links:</p>
        <div className="flex flex-wrap gap-3">
          <Link to={RoutePath.ADMIN_ORGANIZERS} className="text-sky-700 hover:underline">
            Review pending organizers
          </Link>
          <Link to={RoutePath.ADMIN_EVENTS} className="text-sky-700 hover:underline">
            Review pending events
          </Link>
          <Link to={RoutePath.ADMIN_BOOKINGS} className="text-sky-700 hover:underline">
            View bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
