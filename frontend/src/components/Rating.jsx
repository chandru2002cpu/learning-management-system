import { Star } from "lucide-react";

function Rating({ value = 0, size = 16 }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-${size} w-${size}`}
          aria-hidden="true"
          fill={i < full ? "currentColor" : "none"}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-amber-600">
        {Number(value || 0).toFixed(1)}
      </span>
    </div>
  );
}

export default Rating;
