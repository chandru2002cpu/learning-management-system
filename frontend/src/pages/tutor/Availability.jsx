/* eslint-disable react/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import { getApiError } from "../../utils/auth.js";
import SelectInput from "../../components/forms/SelectInput.jsx";
import TextInput from "../../components/forms/TextInput.jsx";
import SubmitButton from "../../components/forms/SubmitButton.jsx";

const emptyForm = { dayOfWeek: "monday", startTime: "09:00", endTime: "10:00" };

function Availability() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSlots = useCallback(async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const { data } = await api.get("/tutor/availability");
      setSlots(data.data.availability || []);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/tutor/availability/${editingId}`, form);
        toast.success("Availability updated");
      } else {
        await api.post("/tutor/availability", form);
        toast.success("Availability created");
      }
      setForm(emptyForm);
      setEditingId("");
      await loadSlots();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tutor/availability/${id}`);
      toast.success("Availability deleted");
      await loadSlots();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
      <p className="mt-2 text-sm text-slate-600">
        These weekly times are the only slots students can book.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-4">
        <SelectInput
          id="dayOfWeek"
          name="dayOfWeek"
          label="Day"
          value={form.dayOfWeek}
          onChange={handleChange}
        >
          {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </SelectInput>
        <TextInput
          id="startTime"
          name="startTime"
          type="time"
          label="Start"
          value={form.startTime}
          onChange={handleChange}
        />
        <TextInput
          id="endTime"
          name="endTime"
          type="time"
          label="End"
          value={form.endTime}
          onChange={handleChange}
        />
        <div className="flex items-end">
          <SubmitButton loading={saving}>
            {editingId ? "Update" : "Add slot"}
          </SubmitButton>
        </div>
      </form>

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading availability...</p>
      ) : null}
      {!loading && slots.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">No availability yet.</p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
          >
            <span className="capitalize text-sm text-slate-800">
              {slot.dayOfWeek}: {slot.startTime} – {slot.endTime}
            </span>
            <span className="flex gap-3 text-sm">
              <button
                type="button"
                className="text-indigo-600"
                onClick={() => {
                  setEditingId(slot.id);
                  setForm({
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                  });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-rose-600"
                onClick={() => handleDelete(slot.id)}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Availability;
