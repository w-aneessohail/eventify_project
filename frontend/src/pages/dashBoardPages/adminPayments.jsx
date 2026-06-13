import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { API_LIST_LIMIT } from "@/utils/eventHelpers";

export default function AdminPayments() {
  const { fetchData } = useAxios();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchData({
          url: "/payments",
          method: HttpMethod.GET,
          params: { limit: API_LIST_LIMIT },
        });

        if (!Array.isArray(data)) {
          setPayments([]);
          setError("Could not load payments");
          return;
        }

        setPayments(data);
      } catch (err) {
        setError(err?.message || "Failed to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchData]);

  if (loading) {
    return <div className="p-6">Loading payments…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Payments</h2>
        <p className="text-sm text-gray-600 mt-1">Recorded payment transactions.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-600">
          No payments recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3">#{payment.id}</td>
                  <td className="px-4 py-3">PKR {Number(payment.amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{payment.method ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{payment.status ?? "—"}</td>
                  <td className="px-4 py-3">
                    {payment.booking?.id ? `#${payment.booking.id}` : "—"}
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
