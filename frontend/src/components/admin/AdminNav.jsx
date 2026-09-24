import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/tutors", label: "Tutors" },
  { to: "/admin/lessons", label: "Lessons" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/reviews", label: "Reviews" },
];

function AdminNav() {
  return (
    <nav
      aria-label="Admin navigation"
      className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminNav;
