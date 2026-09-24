import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";

function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setCounts(data.data?.counts || {});
      } catch (err) {
        setError(getApiError(err));
      }
    };
    loadDashboard();
  }, []);

  const cards = [
    ["Users", counts?.users],
    ["Students", counts?.students],
    ["Tutors", counts?.tutors],
    ["Lessons", counts?.lessons],
    ["Payments", counts?.payments],
    ["Reviews", counts?.reviews],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
          Administration
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          A live view of the learning platform.
        </p>
      </div>
      {error ? (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {!counts && !error ? (
        <p className="mt-8 text-sm text-slate-500">Loading dashboard...</p>
      ) : null}
      {counts ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <article
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {value ?? 0}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default AdminDashboard;
