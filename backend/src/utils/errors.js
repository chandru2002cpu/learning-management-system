export function getSafeErrorDetails(error) {
  const name = error?.name || "Error";
  const message = String(error?.message || "Unknown error")
    .replace(/mongodb(\+srv)?:\/\/\S+/gi, "[REDACTED]")
    .replace(
      /\b(password|secret|token|api[_ -]?key)\b\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]",
    );

  return `${name}: ${message}`;
}
