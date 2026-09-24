/* eslint-disable react/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  PlayCircle,
  Search,
} from "lucide-react";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import PaymentHistory from "../../components/PaymentHistory.jsx";

function StudentDashboard() {
  const [days, setDays] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError("");
    try {
      const [
        slotsResponse,
        paymentsResponse,
        lessonsResponse,
        recordingsResponse,
      ] = await Promise.all([
        api.get("/student/open-slots"),
        api.get("/payments/history"),
        api.get("/student/lessons"),
        api.get("/recordings"),
      ]);
      setDays(slotsResponse.data.data.days || []);
      setPayments(paymentsResponse.data.data.payments || []);
      setLessons(lessonsResponse.data.data.lessons || []);
      setRecordings(recordingsResponse.data.data.recordings || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const upcoming = lessons
    .filter((lesson) => !["completed", "cancelled"].includes(lesson.status))
    .slice(0, 3);
  const completed = lessons.filter(
    (lesson) => lesson.status === "completed",
  ).length;
  const recommended = days
    .flatMap((day) => day.tutors.map((tutor) => ({ ...tutor, date: day.date })))
    .slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-200 sm:px-9">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-300">
          Student workspace
        </p>
        <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Keep your learning moving.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Your upcoming lessons, open tutor times, payments, and recordings
              in one place.
            </p>
          </div>
          <Link
            to="/student/tutors"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Find a tutor <Search className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : null}
      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading your workspace...</p>
      ) : null}
      {!loading && !error ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat
              icon={CalendarDays}
              label="Upcoming lessons"
              value={upcoming.length}
              tone="indigo"
            />
            <Stat
              icon={CheckCircle2}
              label="Completed lessons"
              value={completed}
              tone="emerald"
            />
            <Stat
              icon={CreditCard}
              label="Payments recorded"
              value={payments.length}
              tone="amber"
            />
          </div>
          <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <DashboardSection
                title="Upcoming lessons"
                action="View all"
                to="/student/lessons"
              >
                {upcoming.length ? (
                  <div className="space-y-3">
                    {upcoming.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={CalendarDays}
                    title="No upcoming lessons"
                    copy="Your next lesson will appear here once you book a tutor."
                    action="Browse tutors"
                    to="/student/tutors"
                  />
                )}
              </DashboardSection>
              <DashboardSection
                title="Recent payments"
                action="View history"
                to="/student/dashboard"
              >
                {payments.length ? (
                  <PaymentHistory payments={payments.slice(0, 4)} />
                ) : (
                  <Empty
                    icon={CreditCard}
                    title="No payments yet"
                    copy="Completed purchases will appear in your payment history."
                  />
                )}
              </DashboardSection>
            </div>
            <div className="space-y-8">
              <DashboardSection
                title="Recommended tutor times"
                action="Explore tutors"
                to="/student/tutors"
              >
                {recommended.length ? (
                  <div className="space-y-3">
                    {recommended.map((tutor) => (
                      <div
                        key={`${tutor.date}-${tutor.id}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {tutor.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {tutor.subjects?.join(", ") || "Tutor"} ·{" "}
                              {tutor.date}
                            </p>
                          </div>
                          <Clock3 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tutor.slots?.slice(0, 2).map((slot) => (
                            <Link
                              key={slot.id}
                              to={`/tutors/${tutor.id}?date=${tutor.date}&start=${slot.startTime}&end=${slot.endTime}`}
                              className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              {slot.startTime}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={Search}
                    title="Discover your next tutor"
                    copy="Browse the live tutor directory and filter by your subject, price, or schedule."
                    action="Find a tutor"
                    to="/student/tutors"
                  />
                )}
              </DashboardSection>
              <DashboardSection
                title="Recent recordings"
                action="View recordings"
                to="/student/recordings"
              >
                {recordings.length ? (
                  <div className="space-y-3">
                    {recordings.slice(0, 3).map((recording) => (
                      <Link
                        key={recording.id}
                        to={`/recordings/${recording.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <PlayCircle className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-950">
                            {recording.title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {recording.lesson?.title || "Lesson recording"}
                          </span>
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={PlayCircle}
                    title="No recordings yet"
                    copy="Completed lesson recordings will be available here."
                  />
                )}
              </DashboardSection>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </article>
  );
}

function DashboardSection({ title, action, to, children }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {action ? (
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            {action}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function LessonRow({ lesson }) {
  return (
    <Link
      to={`/lessons/${lesson.id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <CalendarDays className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-slate-950">
          {lesson.title}
        </span>
        <span className="mt-1 block text-sm text-slate-500">
          {lesson.date} · {lesson.startTime}–{lesson.endTime}
        </span>
      </span>
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">
        {lesson.status}
      </span>
    </Link>
  );
}

function Empty({ icon: Icon, title, copy, action, to }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
      <Icon className="mx-auto h-6 w-6 text-slate-400" />
      <p className="mt-3 font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {copy}
      </p>
      {action ? (
        <Link
          to={to}
          className="mt-4 inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export default StudentDashboard;
