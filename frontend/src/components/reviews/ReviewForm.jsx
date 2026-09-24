import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import SubmitButton from "../forms/SubmitButton.jsx";

function ReviewForm({ lessonId, onCreated }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/reviews", {
        lessonId,
        rating,
        comment,
      });
      toast.success("Review submitted");
      setRating(5);
      setComment("");
      if (onCreated) onCreated(data.data.review);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-slate-700">Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="mt-1 block w-28 rounded-md border-gray-300 shadow-sm"
      >
        {[5, 4, 3, 2, 1].map((v) => (
          <option key={v} value={v}>
            {v} star{v > 1 ? "s" : ""}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium text-slate-700">
        Comment
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />

      <SubmitButton loading={busy}>Submit review</SubmitButton>
    </form>
  );
}

export default ReviewForm;
