import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { getApiError } from "../../utils/auth.js";
import TextInput from "../../components/forms/TextInput.jsx";
import SelectInput from "../../components/forms/SelectInput.jsx";
import SubmitButton from "../../components/forms/SubmitButton.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!PASSWORD_REGEX.test(values.password)) {
    errors.password =
      "Password must be at least 8 characters and include a letter and a number";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords must match";
  }

  if (!["student", "tutor"].includes(values.role)) {
    errors.role = "Please select Student or Tutor";
  }

  return errors;
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
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
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });
      toast.success("Registration successful. Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-17rem)] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="hidden rounded-4xl bg-indigo-600 p-10 text-white lg:block">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="mt-16 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">
          Start your next chapter
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          A learning space shaped around your goals.
        </h1>
        <p className="mt-5 leading-7 text-indigo-100">
          Join students and tutors building a better rhythm for learning online.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
          Join LumaLearn
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose your path and make learning more intentional.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <TextInput
            id="name"
            name="name"
            type="text"
            label="Name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
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
            autoComplete="new-password"
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
          <TextInput
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="-mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}{" "}
            {showConfirmPassword ? "Hide confirmation" : "Show confirmation"}
          </button>
          <SelectInput
            id="role"
            name="role"
            label="Role"
            value={values.role}
            onChange={handleChange}
            error={errors.role}
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </SelectInput>
          <SubmitButton loading={loading}>Register</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
