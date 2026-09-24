/* eslint-disable react/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import TextInput from "../../components/forms/TextInput.jsx";
import SelectInput from "../../components/forms/SelectInput.jsx";

function RecordingList() {
  const { user } = useAuth();
  const isTutor = user?.role === "tutor";
  const [recordings, setRecordings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError("");
    try {
      const requests = [api.get("/recordings")];
      if (isTutor) requests.push(api.get("/tutor/lessons"));
      const [recordingsResponse, lessonsResponse] = await Promise.all(requests);
      setRecordings(recordingsResponse.data.data.recordings || []);
      if (lessonsResponse) {
        setLessons(
          (lessonsResponse.data.data.lessons || []).filter((lesson) =>
            ["confirmed", "completed"].includes(lesson.status),
          ),
        );
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [isTutor]);

  useEffect(() => {
    load();
  }, [isTutor, load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Choose a video file");
      return;
    }
    const form = new FormData();
    form.append("lessonId", lessonId);
    form.append("title", title);
    form.append("duration", duration);
    form.append("video", file);
    setBusy(true);
    try {
      await api.post("/recordings", form);
      toast.success("Recording uploaded");
      setTitle("");
      setDuration("");
      setFile(null);
      event.target.reset();
      await load();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await api.delete(`/recordings/${id}`);
      toast.success("Recording deleted");
      await load();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (recording) => {
    setBusy(true);
    try {
      await api.patch(`/recordings/${recording.id}`, {
        isAvailable: !recording.isAvailable,
      });
      await load();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isTutor
          ? "Upload and manage recordings for your lessons."
          : "Recordings from your completed lessons."}
      </p>

      {isTutor ? (
        <form
          onSubmit={upload}
          className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Upload recording
          </h2>
          <SelectInput
            id="lessonId"
            name="lessonId"
            label="Lesson"
            value={lessonId}
            onChange={(event) => setLessonId(event.target.value)}
          >
            <option value="">Select a lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} · {lesson.date}
              </option>
            ))}
          </SelectInput>
          <TextInput
            id="title"
            name="title"
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextInput
            id="duration"
            name="duration"
            type="number"
            label="Duration (seconds)"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="video"
          >
            Video
            <input
              id="video"
              name="video"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
              className="mt-1 block w-full text-sm"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-indigo-400"
          >
            {busy ? "Uploading..." : "Upload"}
          </button>
        </form>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading recordings...</p>
      ) : null}
      {error ? <p className="mt-8 text-sm text-rose-700">{error}</p> : null}
      {!loading && !error && recordings.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">No recordings yet.</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {recordings.map((recording) => (
          <li
            key={recording.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  to={`/recordings/${recording.id}`}
                  className="font-medium text-indigo-700"
                >
                  {recording.title}
                </Link>
                <p className="mt-1 text-sm text-slate-600">
                  {recording.lesson?.title} · {recording.duration}s ·{" "}
                  {recording.isAvailable ? "Available" : "Hidden"}
                </p>
              </div>
              {isTutor ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggle(recording)}
                    className="text-sm text-slate-600"
                  >
                    {recording.isAvailable ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(recording.id)}
                    className="text-sm text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecordingList;
