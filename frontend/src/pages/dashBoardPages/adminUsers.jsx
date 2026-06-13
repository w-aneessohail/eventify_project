import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";

export default function AdminUsers() {
  const { fetchData } = useAxios();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [fetchData]);

  if (loading) {
    return <div className="p-6">Loading users…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-gray-600 mt-1">Platform accounts overview.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-600">
          No users found.
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
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">{user.isVerified ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
