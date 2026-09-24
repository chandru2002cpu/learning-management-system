import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import toast from "react-hot-toast";

function ReviewItem({ review }) {
  return (
    <li className="rounded-lg border border-slate-200 px-4 py-3">
      <p className="text-sm font-medium text-slate-900">
        {review.student?.name || review.authorName} · {review.rating}/5
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {review.comment || "No comment"}
      </p>
    </li>
  );
}

function ReviewList({ tutorId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/reviews/tutor/${tutorId}`);
        setReviews(data.data.reviews || []);
      } catch (err) {
        toast.error(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (tutorId) load();
  }, [tutorId]);

  if (loading)
    return <p className="text-sm text-slate-500">Loading reviews...</p>;
  if (!reviews.length)
    return <p className="text-sm text-slate-500">No reviews yet.</p>;

  return (
    <ul className="mt-3 space-y-3">
      {reviews.map((r) => (
        <ReviewItem key={r._id || r.id} review={r} />
      ))}
    </ul>
  );
}

export default ReviewList;
