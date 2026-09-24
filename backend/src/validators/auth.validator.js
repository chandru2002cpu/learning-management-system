const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const REGISTER_ROLES = ["student", "tutor"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRegister(req, res, next) {
  const errors = [];
  const { name, email, password, role } = req.body ?? {};

  if (!isNonEmptyString(name)) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!isNonEmptyString(email)) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  if (!isNonEmptyString(password)) {
    errors.push("Password is required");
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      "Password must be at least 8 characters and include a letter and a number",
    );
  }

  if (role !== undefined && role !== "") {
    if (!REGISTER_ROLES.includes(role)) {
      errors.push("Role must be student or tutor");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
}

export function validateLogin(req, res, next) {
  const errors = [];
  const { email, password } = req.body ?? {};

  if (!isNonEmptyString(email)) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  if (!isNonEmptyString(password)) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
}
