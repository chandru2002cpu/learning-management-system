import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Unauthorized from "../pages/Unauthorized.jsx";
import StudentDashboard from "../pages/student/Dashboard.jsx";
import StudentProfile from "../pages/student/Profile.jsx";
import Tutors from "../pages/student/Tutors.jsx";
import StudentLessons from "../pages/student/Lessons.jsx";
import TutorDetails from "../pages/tutors/TutorDetails.jsx";
import LessonDetails from "../pages/lessons/LessonDetails.jsx";
import TutorDashboard from "../pages/tutor/Dashboard.jsx";
import TutorProfile from "../pages/tutor/Profile.jsx";
import TutorAvailability from "../pages/tutor/Availability.jsx";
import TutorLessons from "../pages/tutor/Lessons.jsx";
import RecordingList from "../pages/recordings/List.jsx";
import RecordingDetails from "../pages/recordings/Details.jsx";
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import AdminResource from "../components/admin/AdminResource.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleBasedRoute from "./RoleBasedRoute.jsx";
import GuestRoute from "./GuestRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/lessons/:id" element={<LessonDetails />} />
          <Route path="/recordings/:id" element={<RecordingDetails />} />

          <Route element={<RoleBasedRoute roles={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/tutors" element={<Tutors />} />
            <Route path="/student/lessons" element={<StudentLessons />} />
            <Route path="/student/recordings" element={<RecordingList />} />
            <Route path="/tutors/:id" element={<TutorDetails />} />
          </Route>

          <Route element={<RoleBasedRoute roles={["tutor"]} />}>
            <Route path="/tutor/dashboard" element={<TutorDashboard />} />
            <Route path="/tutor/profile" element={<TutorProfile />} />
            <Route path="/tutor/availability" element={<TutorAvailability />} />
            <Route path="/tutor/lessons" element={<TutorLessons />} />
            <Route path="/tutor/recordings" element={<RecordingList />} />
          </Route>

          <Route element={<RoleBasedRoute roles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/users"
              element={<AdminResource type="users" />}
            />
            <Route
              path="/admin/students"
              element={<AdminResource type="students" />}
            />
            <Route
              path="/admin/tutors"
              element={<AdminResource type="tutors" />}
            />
            <Route
              path="/admin/lessons"
              element={<AdminResource type="lessons" />}
            />
            <Route
              path="/admin/payments"
              element={<AdminResource type="payments" />}
            />
            <Route
              path="/admin/reviews"
              element={<AdminResource type="reviews" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
