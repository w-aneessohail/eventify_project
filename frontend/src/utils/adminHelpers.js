export function statusBadgeClass(status) {
  const s = String(status ?? "").toLowerCase();
  if (s === "approved") return "bg-green-100 text-green-800";
  if (s === "pending") return "bg-yellow-100 text-yellow-800";
  if (s === "rejected") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
}

export function normalizeStatus(status) {
  return String(status ?? "unknown").toLowerCase();
}
