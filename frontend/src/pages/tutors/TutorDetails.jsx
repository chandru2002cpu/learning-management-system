import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import Rating from "../../components/Rating.jsx";
import ReviewList from "../../components/reviews/ReviewList.jsx";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import TextInput from "../../components/forms/TextInput.jsx";
import TextArea from "../../components/forms/TextArea.jsx";
import SelectInput from "../../components/forms/SelectInput.jsx";

function TutorDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTutor = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/tutors/${id}`);
        setTutor(data.data.tutor);
        const availability = await api.get(`/tutors/${id}/availability`);
        setWeekly(availability.data.data.availability || []);
      } catch (err) {
        setTutor(null);
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadTutor();
  }, [id]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!date) return;
      setSlotsLoading(true);
      setSelected(null);
      try {
        const { data } = await api.get(`/tutors/${id}/availability`, {
          params: { date },
        });
        const nextSlots = data.data.slots || [];
        setSlots(nextSlots);
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        setSelected(
          nextSlots.find(
            (slot) => slot.startTime === start && slot.endTime === end,
          ) || null,
        );
      } catch (err) {
        setSlots([]);
        toast.error(getApiError(err));
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [date, id, searchParams]);

  const bookLesson = async (event) => {
    event.preventDefault();
    if (!selected) {
      toast.error("Select an available time");
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post("/student/lessons", {
        tutorId: id,
        subject,
        title,
        description,
        date,
        startTime: selected.startTime,
        endTime: selected.endTime,
      });
      toast.success("Lesson booked");
      navigate(`/lessons/${data.data.lesson.id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <p className="px-4 py-12 text-sm text-slate-500">Loading tutor...</p>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-sm text-rose-700">{error}</p>
        <Link
          to="/student/tutors"
          className="mt-4 inline-block text-sm font-medium text-indigo-600"
        >
          Back to tutors
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        to="/student/tutors"
        className="text-sm font-medium text-indigo-600"
      >
        Back to tutors
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{tutor.name}</h1>
          <p className="mt-2 text-slate-600">
            {tutor.bio || "No bio added yet."}
          </p>
        </div>
        <p className="flex items-center gap-1 text-sm font-medium text-amber-600">
          <Star className="h-4 w-4" aria-hidden="true" />
          {Number(tutor.rating || 0).toFixed(1)}
        </p>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">Hourly price</dt>
          <dd className="mt-1 text-slate-900">
            ${Number(tutor.hourlyRate || 0).toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Experience</dt>
          <dd className="mt-1 text-slate-900">{tutor.experience} years</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Qualifications</dt>
          <dd className="mt-1 text-slate-900">
            {tutor.qualifications?.length
              ? tutor.qualifications.join(", ")
              : "None listed"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Expertise</dt>
          <dd className="mt-1 text-slate-900">
            {tutor.expertise?.length
              ? tutor.expertise.join(", ")
              : "None listed"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-slate-500">Subjects</dt>
          <dd className="mt-1 text-slate-900">
            {tutor.subjects?.length ? tutor.subjects.join(", ") : "None listed"}
          </dd>
        </div>
      </dl>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">
        Availability
      </h2>
      {weekly.length ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {weekly.map((slot) => (
            <li key={slot.id} className="capitalize">
              {slot.dayOfWeek}: {slot.startTime} – {slot.endTime}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No availability listed.</p>
      )}

      <form onSubmit={bookLesson} className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Book a lesson</h2>
        <TextInput
          id="title"
          name="title"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextArea
          id="description"
          name="description"
          label="Description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectInput
          id="subject"
          name="subject"
          label="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        >
          <option value="">Select a subject</option>
          {(tutor.subjects || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectInput>
        <TextInput
          id="date"
          name="date"
          type="date"
          label="Date"
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
        {date && !slotsLoading && slots.length === 0 ? (
          <p className="text-sm text-slate-500">No open times on this date.</p>
        ) : null}
        <button
          type="submit"
          disabled={booking}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-indigo-400"
        >
          {booking ? "Booking..." : "Book lesson"}
        </button>
      </form>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
          <div className="flex items-center gap-2">
            <Rating value={tutor.rating} />
            <span className="text-sm text-slate-500">
              {tutor.totalReviews ?? tutor.reviews?.length ?? 0} reviews
            </span>
          </div>
        </div>

        <ReviewList tutorId={id} />

        {/* If student and lesson completed, show review form - lesson-level checks handled by backend */}
        {/* Provide lessonId via query param when navigating from lesson details; otherwise form can accept a lessonId prop when used there */}
        {/* For now, show ReviewForm only when user is on a lesson page (handled elsewhere). */}
      </div>
    </section>
  );
}

export default TutorDetails;
