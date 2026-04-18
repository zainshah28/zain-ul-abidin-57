import { useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";
import { taskApi } from "../services/api";

const emptyTask = {
  subject: "",
  topic: "",
  studyHours: "",
  deadline: "",
  status: "pending"
};

const toDateInput = (value) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
};

const StudyPlannerPage = () => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ subject: "", status: "" });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await taskApi.getAll();
      setTasks(data);
      setError("");
    } catch (e) {
      setError("Failed to fetch tasks.");
      addToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.subject.trim() || !form.topic.trim()) {
      setError("Subject and topic are required");
      addToast("Subject and topic are required", "error");
      return;
    }
    if (!form.studyHours || Number(form.studyHours) <= 0) {
      setError("Study hours must be greater than 0");
      addToast("Study hours must be greater than 0", "error");
      return;
    }
    if (!form.deadline) {
      setError("Deadline is required");
      addToast("Deadline is required", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...form,
      studyHours: Number(form.studyHours)
    };

    try {
      if (editingId) {
        await taskApi.update(editingId, payload);
        addToast("Task updated!", "success");
      } else {
        await taskApi.create(payload);
        addToast("Task added!", "success");
      }
      setForm(emptyTask);
      setEditingId("");
      await loadTasks();
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Failed to save task.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (task) => {
    setEditingId(task._id);
    setForm({
      subject: task.subject,
      topic: task.topic,
      studyHours: task.studyHours,
      deadline: toDateInput(task.deadline),
      status: task.status
    });
    setError("");
  };

  const onCancelEdit = () => {
    setEditingId("");
    setForm(emptyTask);
    setError("");
  };

  const onDelete = async (id) => {
    setError("");
    setSubmitting(true);
    try {
      await taskApi.remove(id);
      addToast("Task deleted", "success");
      await loadTasks();
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Failed to delete task.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleStatus = async (task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    setError("");
    setSubmitting(true);
    try {
      await taskApi.update(task._id, { status: nextStatus });
      addToast(`Task marked ${nextStatus}`, "success");
      await loadTasks();
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Failed to update status.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchSubject = !filters.subject || task.subject.toLowerCase().includes(filters.subject.toLowerCase());
    const matchStatus = !filters.status || task.status === filters.status;
    return matchSubject && matchStatus;
  });

  return (
    <section className="space-y-4">
      <header className="glass rounded-3xl p-6">
        <h1 className="serif text-5xl">Study Planner</h1>
        <p className="mt-2 text-sm text-emerald-900/70">Capture tasks quickly and keep deadlines visible.</p>
      </header>

      <form onSubmit={onSubmit} className="glass grid gap-3 rounded-3xl p-4 md:grid-cols-5 md:p-6">
        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={onChange}
          className="rounded-xl border border-emerald-900/20 bg-white/70 px-3 py-2 outline-none disabled:opacity-70"
          disabled={submitting}
          required
        />
        <input
          name="topic"
          placeholder="Topic"
          value={form.topic}
          onChange={onChange}
          className="rounded-xl border border-emerald-900/20 bg-white/70 px-3 py-2 outline-none disabled:opacity-70"
          disabled={submitting}
          required
        />
        <input
          name="studyHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="Hours"
          value={form.studyHours}
          onChange={onChange}
          className="rounded-xl border border-emerald-900/20 bg-white/70 px-3 py-2 outline-none disabled:opacity-70"
          disabled={submitting}
          required
        />
        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={onChange}
          className="rounded-xl border border-emerald-900/20 bg-white/70 px-3 py-2 outline-none disabled:opacity-70"
          disabled={submitting}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-800 px-3 py-2 font-semibold text-white disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {submitting ? <Spinner size="sm" /> : null}
          {submitting ? "Saving..." : editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={submitting}
            className="rounded-xl bg-slate-300 px-3 py-2 font-semibold text-slate-800 disabled:opacity-70"
          >
            Cancel Edit
          </button>
        )}

        {editingId && !error && <p className="text-sm text-emerald-700 md:col-span-5">Editing selected task. Update and save.</p>}
        {error && <p className="text-sm text-red-600 md:col-span-5">{error}</p>}
      </form>

      {!loading && tasks.length > 0 && (
        <div className="glass grid gap-3 rounded-3xl p-4 md:grid-cols-2 md:p-6">
          <input
            type="text"
            placeholder="🔍 Filter by subject..."
            value={filters.subject}
            onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}
            className="rounded-xl border border-emerald-900/20 bg-white/70 px-3 py-2 outline-none dark:bg-slate-700 dark:text-white"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-xl border border-emerald-900/20 bg-white/70 px-3 py-2 outline-none dark:bg-slate-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="glass rounded-3xl p-8 flex justify-center">
          <Spinner />
        </div>
      ) : filteredTasks.length === 0 && tasks.length === 0 ? (
        <EmptyState
          title="No Tasks Yet"
          description="Add your first study task above to get started."
        />
      ) : filteredTasks.length === 0 ? (
        <div className="glass rounded-3xl p-6 text-center text-emerald-900/70">
          No tasks match your filters.
        </div>
      ) : (
        <div className="glass overflow-x-auto rounded-3xl p-4 md:p-6">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/20">
                <th className="py-2">Subject</th>
                <th className="py-2">Topic</th>
                <th className="py-2">Hours</th>
                <th className="py-2">Deadline</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id} className="border-b border-emerald-900/10">
                  <td className="py-2">{task.subject}</td>
                  <td className="py-2">{task.topic}</td>
                  <td className="py-2">{task.studyHours}</td>
                  <td className="py-2">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${task.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="space-x-2 py-2">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      disabled={submitting}
                      className="rounded-lg bg-amber-200 px-2 py-1 text-xs font-semibold disabled:opacity-70"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(task)}
                      disabled={submitting}
                      className="rounded-lg bg-emerald-200 px-2 py-1 text-xs font-semibold disabled:opacity-70"
                    >
                      {task.status === "completed" ? "Mark Pending" : "Mark Complete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task._id)}
                      disabled={submitting}
                      className="rounded-lg bg-red-200 px-2 py-1 text-xs font-semibold disabled:opacity-70"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default StudyPlannerPage;
