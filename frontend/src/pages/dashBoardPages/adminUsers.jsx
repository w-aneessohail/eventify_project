import { useEffect, useMemo, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";
import { getFriendlyErrorMessage } from "@/utils/apiError";

export default function AdminUsers() {
  const { fetchData } = useAxios();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData({
        url: "/users",
        method: HttpMethod.GET,
        params: { limit: API_LIST_LIMIT },
      });

      if (!Array.isArray(data)) {
        setUsers([]);
        setError("Could not load users");
        return;
      }

      setUsers(data);
    } catch (err) {
      setError(err?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.name || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleDelete = async (user) => {
    if (currentUser?.id === user.id) {
      setActionMessage({
        type: "error",
        text: "You cannot delete your own account.",
      });
      return;
    }

    if (
      !window.confirm(
        `Delete user "${user.name}" (${user.email})? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(user.id);
    setActionMessage(null);

    try {
      await fetchData({
        url: `/users/${user.id}`,
        method: HttpMethod.DELETE,
      });
      setActionMessage({ type: "success", text: "User deleted successfully." });
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: getFriendlyErrorMessage(
          err?.message || "Could not delete user",
          "default"
        ),
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading users…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-gray-600 mt-1">Platform accounts overview.</p>
      </div>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-3 py-2 border rounded-md text-sm"
      />

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

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-600">
          {search ? "No users match your search." : "No users found."}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">{user.isVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 rounded bg-gray-100 text-xs font-medium hover:bg-gray-200"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === user.id || currentUser?.id === user.id}
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === user.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-3">
            <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
            <p className="text-sm text-gray-600">{selectedUser.email}</p>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Role</dt>
                <dd className="capitalize font-medium">{selectedUser.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email verified</dt>
                <dd>{selectedUser.isVerified ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Bookings</dt>
                <dd>
                  {selectedUser.bookingCount ??
                    (Array.isArray(selectedUser.bookings)
                      ? selectedUser.bookings.length
                      : 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Reviews</dt>
                <dd>
                  {selectedUser.reviewCount ??
                    (Array.isArray(selectedUser.reviews)
                      ? selectedUser.reviews.length
                      : 0)}
                </dd>
              </div>
              {selectedUser.organizer && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Organization</dt>
                    <dd className="text-right">{selectedUser.organizer.organizationName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Organizer status</dt>
                    <dd className="capitalize">
                      {selectedUser.organizer.verificationStatus ?? "—"}
                    </dd>
                  </div>
                  {selectedUser.organizer.rejectionReason && (
                    <div>
                      <dt className="text-gray-500 mb-1">Rejection reason</dt>
                      <dd className="text-red-700 bg-red-50 rounded p-2 text-xs">
                        {selectedUser.organizer.rejectionReason}
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="w-full mt-4 py-2 rounded-md bg-gray-100 text-sm font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
