import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { RoutePath } from "@/enum/routePath";
import { HttpMethod } from "@/enum/httpMethod";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";
import { getMediaUrl } from "@/utils/mediaUrl";
import ReviewStars from "@/components/ReviewStars";
import {
  formatReviewDate,
  getReviewerName,
  getAverageRating,
} from "@/utils/reviewHelpers";

const Reviews = () => {
  const { fetchData, loading } = useAxios();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState(
    searchParams.get("eventId") || ""
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadReviews = async () => {
    setError(null);
    const result = await fetchData({
      url: "/event-reviews",
      method: HttpMethod.GET,
      params: { limit: 50 },
    });

    if (Array.isArray(result)) {
      setReviews(result);
    } else {
      setError("Failed to load reviews");
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    const preselected = searchParams.get("eventId");
    if (preselected) setSelectedEventId(preselected);
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadBookedEvents = async () => {
      const result = await fetchData({
        url: "/bookings/me",
        method: HttpMethod.GET,
        params: { limit: 50 },
      });

      if (!Array.isArray(result)) return;

      const seen = new Set();
      const events = [];
      result.forEach((booking) => {
        const event = booking.event;
        if (event?.id && !seen.has(event.id)) {
          seen.add(event.id);
          events.push(event);
        }
      });
      setBookedEvents(events);
    };

    loadBookedEvents();
  }, [isAuthenticated, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to submit a review.",
        icon: "warning",
      });
      return;
    }

    if (!selectedEventId) {
      Swal.fire({
        title: "Select an event",
        text: "Choose an event you have booked.",
        icon: "warning",
      });
      return;
    }

    if (comment.trim().length < 5) {
      Swal.fire({
        title: "Comment too short",
        text: "Please write at least 5 characters.",
        icon: "warning",
      });
      return;
    }

    setSubmitting(true);
    const result = await fetchData({
      url: "/event-reviews",
      method: HttpMethod.POST,
      data: {
        eventId: Number(selectedEventId),
        userId: user.id,
        rating,
        comment: comment.trim(),
      },
    });
    setSubmitting(false);

    if (result) {
      Swal.fire({
        title: "Thank you!",
        text: "Your review has been submitted.",
        icon: "success",
      });
      setComment("");
      loadReviews();
    } else {
      Swal.fire({
        title: "Error",
        text: "Could not submit review. Please try again.",
        icon: "error",
      });
    }
  };

  const averageRating = getAverageRating(reviews);

  return (
    <>
      <section className="text-center py-16 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-muted-foreground">
            See what attendees are saying about events
          </p>
          {!loading && reviews.length > 0 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <ReviewStars rating={Math.round(averageRating)} size={24} />
              <span className="font-bold text-xl">{averageRating} out of 5</span>
              <span className="text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </motion.div>
      </section>

      {isAuthenticated && bookedEvents.length > 0 && (
        <section className="container mx-auto px-4 pt-12 max-w-2xl">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select an event</option>
                  {bookedEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="Share your experience (5–200 characters)"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </section>
      )}

      {isAuthenticated && bookedEvents.length === 0 && !loading && (
        <section className="container mx-auto px-4 pt-12 max-w-2xl">
          <div className="bg-white p-6 rounded-2xl shadow text-center text-muted-foreground">
            <p>Book an event to leave a review.</p>
            <Link
              to={RoutePath.ATTENDEE_ALL_EVENTS}
              className="inline-block mt-3 text-primary hover:underline"
            >
              Browse Events
            </Link>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={loadReviews}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">No reviews yet.</p>
            <p className="text-sm mt-2">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover-lift"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {review.attendee?.profileImage ? (
                    <img
                      src={getMediaUrl(review.attendee.profileImage)}
                      alt={getReviewerName(review)}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                      {getReviewerName(review).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{getReviewerName(review)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatReviewDate(review.createdAt)}
                    </p>
                    {review.event?.title && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {review.event.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <ReviewStars rating={review.rating} />
                </div>

                <p className="text-muted-foreground">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Reviews;
