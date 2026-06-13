import { Star } from "lucide-react";

const ReviewStars = ({ rating = 0, size = 20 }) => {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating))));

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
};

export default ReviewStars;
