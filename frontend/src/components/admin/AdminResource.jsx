import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";

const configs = {
  users: {
    title: "Users",
    endpoint: "/admin/users",
    empty: "No users found.",
    filters: "users",
    columns: [
      { label: "Name", render: (item) => item.name },
      { label: "Email", render: (item) => item.email },
      { label: "Role", render: (item) => item.role },
      {
        label: "Status",
        render: (item) => (item.isActive ? "Active" : "Inactive"),
      },
    ],
  },
  students: {
    title: "Students",
    endpoint: "/admin/students",
    empty: "No students found.",
    filters: "status",
    columns: [
      { label: "Name", render: (item) => item.name },
      { label: "Email", render: (item) => item.email },
      {
        label: "Status",
        render: (item) => (item.isActive ? "Active" : "Inactive"),
      },
      { label: "Joined", render: (item) => formatDate(item.createdAt) },
    ],
  },
  tutors: {
    title: "Tutors",
    endpoint: "/admin/tutors",
    empty: "No tutors found.",
    filters: "status",
    columns: [
      { label: "Name", render: (item) => item.name },
      { label: "Email", render: (item) => item.email },
      {
        label: "Status",
        render: (item) => (item.isActive ? "Active" : "Inactive"),
      },
      { label: "Joined", render: (item) => formatDate(item.createdAt) },
    ],
  },
  lessons: {
    title: "Lessons",
    endpoint: "/admin/lessons",
    empty: "No lessons found.",
    filters: "lesson-status",
    columns: [
      { label: "Lesson", render: (item) => item.title },
      { label: "Subject", render: (item) => item.subject },
      { label: "Student", render: (item) => item.student?.name || "Unknown" },
      { label: "Tutor", render: (item) => item.tutor?.name || "Unknown" },
      { label: "Status", render: (item) => item.status },
      { label: "Date", render: (item) => item.date },
    ],
  },
  payments: {
    title: "Payments",
    endpoint: "/admin/payments",
    empty: "No payments found.",
    filters: "payment-status",
    columns: [
      { label: "Order", render: (item) => item.orderId },
      { label: "Student", render: (item) => item.student?.name || "Unknown" },
      { label: "Tutor", render: (item) => item.tutor?.name || "Unknown" },
      { label: "Amount", render: (item) => `${item.currency} ${item.amount}` },
      { label: "Status", render: (item) => item.status },
      { label: "Created", render: (item) => formatDate(item.createdAt) },
    ],
  },
  reviews: {
    title: "Reviews",
    endpoint: "/admin/reviews",
    empty: "No reviews found.",
    filters: "rating",
    columns: [
      { label: "Student", render: (item) => item.student?.name || "Unknown" },
      { label: "Tutor", render: (item) => item.tutor?.name || "Unknown" },
      { label: "Lesson", render: (item) => item.lesson?.title || "Unknown" },
      { label: "Rating", render: (item) => `${item.rating}/5` },
      { label: "Comment", render: (item) => item.comment || "No comment" },
      { label: "Created", render: (item) => formatDate(item.createdAt) },
    ],
  },
};

const lessonStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
];
const paymentStatuses = ["created", "paid", "failed"];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function AdminResource({ type }) {
  const config = configs[type];
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (search.trim()) params.search = search.trim();
        if (type === "users" && filter) params.role = filter;
        if ((type === "students" || type === "tutors") && filter)
          params.active = filter;
        if (type === "lessons" && filter) params.status = filter;
        if (type === "payments" && filter) params.status = filter;
        if (type === "reviews" && filter) params.rating = filter;
        const { data } = await api.get(config.endpoint, { params });
        if (!active) return;
        setItems(data.data?.[type] || data.data?.users || []);
        setPagination(data.data?.pagination || { page: 1, pages: 1, total: 0 });
        setError("");
      } catch (err) {
        if (active) setError(getApiError(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [config.endpoint, filter, page, search, type]);

  const updateUser = async (id, changes) => {
    setUpdatingId(id);
    try {
      const endpoint = changes.role
        ? `/admin/users/${id}/role`
        : `/admin/users/${id}/status`;
      const { data } = await api.patch(endpoint, changes);
      setItems((current) =>
        current.map((item) => (item._id === id ? data.data.user : item)),
      );
      setError("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setUpdatingId("");
    }
  };

  const resetPageAndSet = (setter, value) => {
    setPage(1);
    setter(value);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            {config.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} records
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="admin-search">
            Search {config.title.toLowerCase()}
          </label>
          <input
            id="admin-search"
            value={search}
            onChange={(event) => resetPageAndSet(setSearch, event.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}`}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          {config.filters === "users" ? (
            <select
              value={filter}
              onChange={(event) =>
                resetPageAndSet(setFilter, event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="tutor">Tutors</option>
              <option value="admin">Admins</option>
            </select>
          ) : null}
          {config.filters === "status" ? (
            <select
              value={filter}
              onChange={(event) =>
                resetPageAndSet(setFilter, event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          ) : null}
          {config.filters === "lesson-status" ? (
            <select
              value={filter}
              onChange={(event) =>
                resetPageAndSet(setFilter, event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {lessonStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : null}
          {config.filters === "payment-status" ? (
            <select
              value={filter}
              onChange={(event) =>
                resetPageAndSet(setFilter, event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : null}
          {config.filters === "rating" ? (
            <select
              value={filter}
              onChange={(event) =>
                resetPageAndSet(setFilter, event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="mt-6 text-sm text-slate-500">
          Loading {config.title.toLowerCase()}...
        </p>
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
          {config.empty}
        </p>
      ) : null}
      {!loading && items.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {config.columns.map((column) => (
                  <th
                    key={column.label}
                    className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600"
                  >
                    {column.label}
                  </th>
                ))}
                {type === "users" ? (
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item._id} className="align-top hover:bg-slate-50">
                  {config.columns.map((column) => (
                    <td
                      key={column.label}
                      className="max-w-xs px-4 py-3 text-slate-700"
                    >
                      {column.label === "Status" &&
                      (type === "users" ||
                        type === "students" ||
                        type === "tutors") ? (
                        <StatusBadge active={item.isActive} />
                      ) : (
                        column.render(item)
                      )}
                    </td>
                  ))}
                  {type === "users" ? (
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={updatingId === item._id}
                          onClick={() =>
                            updateUser(item._id, { isActive: !item.isActive })
                          }
                          className="text-left text-indigo-600 hover:text-indigo-800 disabled:text-slate-400"
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <select
                          disabled={updatingId === item._id}
                          value={item.role}
                          onChange={(event) =>
                            updateUser(item._id, { role: event.target.value })
                          }
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!loading && pagination.pages > 1 ? (
        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default AdminResource;
