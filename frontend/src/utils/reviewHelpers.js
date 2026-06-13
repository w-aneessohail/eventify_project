export const formatReviewDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getReviewerName = (review) =>
  review?.attendee?.name || review?.attendeeName || "Anonymous";

export const getAverageRating = (reviews) => {
  if (!reviews?.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};
