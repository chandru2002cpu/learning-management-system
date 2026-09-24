import mongoose from "mongoose";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const reviewSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true },
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: DAYS,
      lowercase: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

function stringList() {
  return {
    type: [String],
    default: () => [],
    validate: {
      validator(values) {
        return values.every(
          (value) => value.trim().length > 0 && value.length <= 80,
        );
      },
      message: "Each list item must be 1 to 80 characters",
    },
  };
}

const tutorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    qualifications: stringList(),
    expertise: stringList(),
    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
      max: [80, "Experience cannot exceed 80 years"],
    },
    subjects: stringList(),
    hourlyRate: {
      type: Number,
      default: 0,
      min: [0, "Hourly rate cannot be negative"],
      max: [10000, "Hourly rate cannot exceed 10000"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: {
      type: [reviewSchema],
      default: () => [],
    },
    availability: {
      type: [availabilitySchema],
      default: () => [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

const TutorProfile = mongoose.model("TutorProfile", tutorProfileSchema);

export default TutorProfile;
export { DAYS };
