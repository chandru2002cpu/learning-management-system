import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Star } from "lucide-react";

function TutorCard({ tutor }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
            {tutor.name?.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-950">
              {tutor.name}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500">
              {tutor.subjects?.length
                ? tutor.subjects.join(", ")
                : "No subjects listed"}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1 text-sm font-semibold text-amber-600">
          <Star className="h-4 w-4" fill="currentColor" />
          {Number(tutor.rating || 0).toFixed(1)}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-xs text-slate-500">Experience</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {tutor.experience || 0} years
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Rate</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            ${Number(tutor.hourlyRate || 0).toFixed(2)} / hr
          </p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <BookOpen className="h-3.5 w-3.5" />
        {tutor.totalReviews ?? tutor.reviews?.length ?? 0} review
        {(tutor.totalReviews ?? tutor.reviews?.length ?? 0) === 1 ? "" : "s"}
      </p>
      <Link
        to={`/tutors/${tutor.id}`}
        className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        View profile <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default TutorCard;
