const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";

export const getApiOrigin = () => API_BASE.replace(/\/api\/?$/, "");

/** Resolve a relative upload path or pass through absolute/blob URLs. */
export const getMediaUrl = (path, fallback = null) => {
  if (!path) return fallback;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const encoded = normalized
    .split("/")
    .map((segment) => (segment === "" ? "" : encodeURIComponent(segment)))
    .join("/");
  return `${getApiOrigin()}${encoded}`;
};

export const getEventImageUrl = (event, fallback = "/placeholder.svg") => {
  const path = event?.images?.[0]?.imageUrl;
  return getMediaUrl(path, fallback);
};

export const formatEventDate = (date) => {
  if (!date) return "Date TBA";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getOrganizerName = (event) =>
  event?.organizer?.organizationName ||
  event?.organizer?.organizerName ||
  "Event Organizer";

/** Client-side filters matching the home page search UI. */
export const filterEvents = (events, { search = "", location = "", date = "" } = {}) => {
  const term = search.trim().toLowerCase();

  return events.filter((event) => {
    if (term) {
      const haystack = `${event.title || ""} ${event.description || ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (location && location !== "Location") {
      const address = (event.address || "").toLowerCase();
      if (!address.includes(location.toLowerCase())) return false;
    }

    if (date && date !== "Date" && event.eventDate) {
      const eventDay = new Date(event.eventDate);
      if (Number.isNaN(eventDay.getTime())) return true;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      if (date === "Today") {
        if (eventDay < startOfToday || eventDay >= endOfToday) return false;
      } else if (date === "This Week") {
        const weekEnd = new Date(startOfToday);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (eventDay < startOfToday || eventDay >= weekEnd) return false;
      } else if (date === "This Month") {
        if (
          eventDay.getMonth() !== now.getMonth() ||
          eventDay.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }
    }

    return true;
  });
};
