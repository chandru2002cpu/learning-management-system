import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleDollarSign, Star } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import PaymentHistory from "../../components/PaymentHistory.jsx";

function TutorDashboard() {
  const [payments, setPayments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [paymentsResponse, lessonsResponse] = await Promise.all([
          api.get("/payments/history"),
          api.get("/tutor/lessons"),
        ]);
        const data = paymentsResponse.data;
        const items = data.data.payments || [];
        setPayments(items);
        setTotalEarnings(data.data.totalEarnings || 0);
        setCurrency(items[0]?.currency || "INR");
        setLessons(lessonsResponse.data.data.lessons || []);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-indigo-600 px-6 py-8 text-white shadow-xl shadow-indigo-100 sm:px-9">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-100">
          Tutor workspace
        </p>
        <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Teach with clarity.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Keep your schedule, lessons, recordings, and verified earnings
              close at hand.
            </p>
          </div>
          <Link
            to="/tutor/availability"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Manage availability <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CircleDollarSign className="h-5 w-5 text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Total earnings</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {currency} {Number(totalEarnings).toFixed(2)}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Lesson requests</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {lessons.length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Star className="h-5 w-5 text-amber-500" />
          <p className="mt-4 text-sm text-slate-500">Payments received</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {payments.length}
          </p>
        </article>
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">
              Lesson requests
            </h2>
            <Link
              to="/tutor/lessons"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {lessons.length ? (
            <div className="mt-4 space-y-3">
              {lessons.slice(0, 4).map((lesson) => (
                <Link
                  key={lesson.id}
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
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                    {lesson.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No lessons yet"
              copy="New bookings and lesson requests will appear here."
            />
          )}
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950">Payment history</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading payments...</p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
          {!loading && !error ? (
            <PaymentHistory payments={payments} nameKey="studentName" />
          ) : null}
        </section>
      </div>
    </section>
  );
}

function Empty({ title, copy }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{copy}</p>
    </div>
  );
}

export default TutorDashboard;
