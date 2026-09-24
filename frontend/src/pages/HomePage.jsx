import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import TutorCard from "../components/TutorCard.jsx";

const features = [
  {
    icon: UsersRound,
    title: "Expert tutors",
    copy: "Find the right specialist for the subject and pace you need.",
  },
  {
    icon: CalendarClock,
    title: "Flexible scheduling",
    copy: "Book lessons around your life with availability that works for you.",
  },
  {
    icon: MonitorPlay,
    title: "Online learning",
    copy: "Meet, learn, and revisit your progress from one focused workspace.",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    copy: "Simple, protected checkout with clear payment history.",
  },
];

const steps = [
  [
    "01",
    "Find a tutor",
    "Browse real tutor profiles by subject, rating, price, and availability.",
  ],
  [
    "02",
    "Book a lesson",
    "Choose an open time slot and confirm your lesson in a few clicks.",
  ],
  [
    "03",
    "Learn online",
    "Join your lesson, keep your recordings, and make steady progress.",
  ],
  [
    "04",
    "Review your tutor",
    "Share useful feedback after a completed lesson.",
  ],
];

function HomePage() {
  const { user } = useAuth();
  const [apiOk, setApiOk] = useState(null);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        await api.get("/health");
        setApiOk(true);
      } catch {
        setApiOk(false);
      }
      if (user?.role === "student") {
        try {
          const { data } = await api.get("/tutors");
          setTutors((data.data.tutors || []).slice(0, 3));
        } catch {
          setTutors([]);
        }
      }
    };
    load();
  }, [user?.role]);

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-indigo-100 bg-[radial-gradient(circle_at_top_right,#e0e7ff,transparent_42%),linear-gradient(135deg,#f8faff_0%,#eef2ff_55%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" /> Learn with momentum
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.05]">
              Learn from expert tutors, anywhere.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Personalised lessons, flexible schedules, and a learning space
              that helps you turn curiosity into confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={user ? "/student/tutors" : "/register"}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                Find a tutor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={user ? "/student/dashboard" : "/register"}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
              >
                Get started
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <span
                className={`h-2 w-2 rounded-full ${apiOk === false ? "bg-rose-400" : apiOk === true ? "bg-emerald-500" : "bg-slate-300"}`}
              />{" "}
              {apiOk === true
                ? "LumaLearn is ready when you are"
                : apiOk === false
                  ? "Service is temporarily unavailable"
                  : "Checking learning space..."}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-4 -top-8 h-28 w-28 rounded-full bg-indigo-200/70 blur-2xl" />
            <div className="relative rounded-4xl border border-white bg-white/80 p-4 shadow-2xl shadow-indigo-200/50 backdrop-blur sm:p-6">
              <div className="rounded-3xl bg-slate-950 p-5 text-white sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                      Your learning path
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Small steps. Real progress.
                    </h2>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-indigo-300" />
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    "Choose your subject",
                    "Meet your tutor",
                    "Build your rhythm",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-300"}`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-200">{item}</span>
                      {index === 0 ? (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-indigo-300" />
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
                  <span className="text-slate-400">
                    Progress starts with one lesson
                  </span>
                  <ArrowRight className="h-4 w-4 text-indigo-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Built around you
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Everything you need to make learning stick.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="how-it-works" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                A simple rhythm for better learning.
              </h2>
            </div>
            <Link
              to={user ? "/student/tutors" : "/register"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Start exploring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map(([number, title, copy]) => (
              <div key={number}>
                <p className="text-sm font-bold text-indigo-600">{number}</p>
                <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Tutor community
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Find your next great teacher.
            </h2>
          </div>
          <Link
            to={user ? "/student/tutors" : "/login"}
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View all tutors <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
        {tutors.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-slate-900">
              {user
                ? "No tutor profiles are available yet."
                : "Sign in to browse real tutor profiles."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Your tutor directory is connected to the live LMS data.
            </p>
          </div>
        )}
      </section>

      <section className="mx-4 mb-16 rounded-4xl bg-indigo-600 px-6 py-12 text-center text-white shadow-xl shadow-indigo-200 sm:mx-6 lg:mx-auto lg:max-w-7xl lg:px-12">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          Create your learning space and take the first step with a tutor who
          fits your goals.
        </p>
        <Link
          to={user ? "/student/tutors" : "/register"}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
