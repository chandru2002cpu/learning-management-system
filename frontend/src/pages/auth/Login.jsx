import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { getApiError, getDashboardPath } from "../../utils/auth.js";
import TextInput from "../../components/forms/TextInput.jsx";
import SubmitButton from "../../components/forms/SubmitButton.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
      });
      toast.success("Login successful");
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-17rem)] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="hidden lg:block rounded-4xl bg-slate-950 p-10 text-white">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500">
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="mt-16 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
          Welcome back
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Pick up where your learning left off.
        </h1>
        <p className="mt-5 leading-7 text-slate-300">
          Your lessons, tutors, payments, and progress are waiting in one calm
          workspace.
        </p>
        <div className="mt-12 flex items-center gap-3 text-sm text-slate-300">
          <ShieldCheck className="h-5 w-5 text-indigo-300" /> Secure account
          access
        </div>
      </div>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
          LumaLearn account
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to continue your learning journey.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <TextInput
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <TextInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="-mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}{" "}
            {showPassword ? "Hide password" : "Show password"}
          </button>
          <SubmitButton loading={loading}>Login</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Do not have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
