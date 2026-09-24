import { NavLink } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  Clapperboard,
  CreditCard,
  LayoutDashboard,
  Search,
  Settings2,
  Star,
  UserRound,
  Users,
} from "lucide-react";

const navigation = {
  student: [
    { to: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/student/tutors", label: "Find tutors", icon: Search },
    { to: "/student/lessons", label: "My lessons", icon: CalendarDays },
    { to: "/student/recordings", label: "Recordings", icon: Clapperboard },
    { to: "/student/profile", label: "Profile", icon: UserRound },
  ],
  tutor: [
    { to: "/tutor/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/tutor/lessons", label: "Lessons", icon: CalendarDays },
    { to: "/tutor/availability", label: "Availability", icon: Settings2 },
    { to: "/tutor/recordings", label: "Recordings", icon: Clapperboard },
    { to: "/tutor/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/students", label: "Students", icon: UserRound },
    { to: "/admin/tutors", label: "Tutors", icon: BookOpen },
    { to: "/admin/lessons", label: "Lessons", icon: CalendarDays },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/reviews", label: "Reviews", icon: Star },
  ],
};

function Sidebar({ role, open = false, onClose }) {
  const items = navigation[role] || [];

  return (
    <aside
      className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 lg:static lg:translate-x-0`}
    >
      <div className="flex items-center justify-between px-3 lg:hidden">
        <span className="text-sm font-semibold text-slate-900">Workspace</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close menu"
        >
          ×
        </button>
      </div>
      <div className="mt-6 rounded-2xl bg-indigo-50 px-4 py-4 lg:mt-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Your workspace
        </p>
        <p className="mt-2 text-sm leading-6 text-indigo-950">
          Stay on top of your learning goals and next steps.
        </p>
      </div>
      <nav className="mt-6 space-y-1" aria-label="Workspace navigation">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
