/* eslint-disable react/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getApiError } from "../../utils/auth.js";
import { payForLesson } from "../../utils/checkout.js";
import TextInput from "../../components/forms/TextInput.jsx";
import ReviewForm from "../../components/reviews/ReviewForm.jsx";

function LessonDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");

  const loadLesson = useCallback(async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/lessons/${id}`);
      setLesson(data.data.lesson);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLesson();
  }, [id, loadLesson]);

  useEffect(() => {
    const loadMeeting = async () => {
      if (!lesson || lesson.status !== "confirmed") {
        setMeetingLink("");
        return;
      }
      try {
        const { data } = await api.get(`/lessons/${id}/meeting`);
        setMeetingLink(data.data.meeting?.meetingLink || "");
      } catch {
        setMeetingLink("");
      }
    };

    loadMeeting();
  }, [id, lesson]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!date || !lesson?.tutor?.id) return;
      try {
        const { data } = await api.get(
          `/tutors/${lesson.tutor.id}/availability`,
          { params: { date } },
        );
        setSlots(data.data.slots || []);
        setSelected(null);
      } catch (err) {
        toast.error(getApiError(err));
      }
    };

    loadSlots();
  }, [date, lesson]);

  const pay = async () => {
    setBusy(true);
    try {
      await payForLesson(id);
      await loadLesson();
      toast.success("Payment verified");
    } catch (err) {
      toast.error(
        err.response
          ? getApiError(err)
          : err.message || "Payment was not completed",
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelLesson = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/lessons/${id}/cancel`);
      setLesson(data.data.lesson);
      toast.success("Lesson cancelled");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const reschedule = async (event) => {
    event.preventDefault();
    if (!selected) {
      toast.error("Select an available time");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/lessons/${id}/reschedule`, {
        date,
        startTime: selected.startTime,
        endTime: selected.endTime,
      });
      setLesson(data.data.lesson);
      setDate("");
      setSlots([]);
      setSelected(null);
      toast.success("Lesson rescheduled");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <p className="px-4 py-12 text-sm text-slate-500">Loading lesson...</p>
    );
  if (error) return <p className="px-4 py-12 text-sm text-rose-700">{error}</p>;

  const locked = lesson.status === "cancelled" || lesson.status === "completed";

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {lesson.description || "No description"}
      </p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Student</dt>
          <dd>{lesson.student?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Tutor</dt>
          <dd>{lesson.tutor?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Subject</dt>
          <dd>{lesson.subject}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="capitalize">{lesson.status}</dd>
        </div>
        <div>
          <dt className="text-slate-500">When</dt>
          <dd>
            {lesson.date} · {lesson.startTime}–{lesson.endTime}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Hourly price</dt>
          <dd>${Number(lesson.price).toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Amount due</dt>
          <dd>INR {Number(lesson.amount || 0).toFixed(2)}</dd>
        </div>
      </dl>

      {meetingLink ? (
        <a
          href={meetingLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Join Meeting
        </a>
      ) : null}

      {user?.role === "student" && !locked && !lesson.paid ? (
        <button
          type="button"
          disabled={busy}
          onClick={pay}
          className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-indigo-400"
        >
          {busy ? "Opening checkout..." : "Pay for lesson"}
        </button>
      ) : null}

      {!locked ? (
        <button
          type="button"
          disabled={busy}
          onClick={cancelLesson}
          className="mt-6 rounded-md border border-rose-300 px-4 py-2 text-sm text-rose-700"
        >
          Cancel lesson
        </button>
      ) : null}

      {!locked ? (
        <form onSubmit={reschedule} className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Reschedule</h2>
          <TextInput
            id="date"
            name="date"
            type="date"
            label="New date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelected(slot)}
                className={`rounded-md border px-3 py-2 text-sm ${selected?.id === slot.id ? "border-indigo-600 bg-indigo-50" : "border-slate-300"}`}
              >
                {slot.startTime}–{slot.endTime}
              </button>
            ))}
          </div>
          {date && slots.length === 0 ? (
            <p className="text-sm text-slate-500">
              No open times on this date.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            Reschedule
          </button>
        </form>
      ) : null}

      <Link
        to={user?.role === "tutor" ? "/tutor/lessons" : "/student/lessons"}
        className="mt-8 inline-block text-sm text-indigo-600"
      >
        Back to lessons
      </Link>
      {user?.role === "student" && lesson.status === "completed" ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Leave a review
          </h2>
          <ReviewForm lessonId={lesson.id || lesson._id} onCreated={() => {}} />
        </section>
      ) : null}
    </section>
  );
}

export default LessonDetails;
