import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";
import { performanceApi } from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PerformancePage = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ subject: "", assessmentType: "quiz", score: "" });
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysisRes, historyRes] = await Promise.all([
        performanceApi.getAnalysis(),
        performanceApi.getQuizHistory()
      ]);
      setAnalysis(analysisRes.data);
      setHistory(historyRes.data || []);
      setError("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load analysis.");
      addToast("Failed to load analysis", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.subject.trim()) {
      setError("Subject is required");
      addToast("Subject is required", "error");
      return;
    }
    if (form.score === "" || Number(form.score) < 0 || Number(form.score) > 10) {
      setError("Marks must be between 0 and 10");
      addToast("Marks must be between 0 and 10", "error");
      return;
    }

    setSubmitting(true);
    try {
      await performanceApi.addQuiz({
        subject: form.subject,
        assessmentType: form.assessmentType,
        score: Number(form.score)
      });
      setForm({ subject: "", assessmentType: "quiz", score: "" });
      addToast("Score added!", "success");
      await loadData();
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Failed to add score";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteScore = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      await performanceApi.removeQuiz(id);
      addToast("Score deleted", "success");
      await loadData();
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Failed to delete score";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setDeletingId("");
    }
  };

  const scoreData = useMemo(() => {
    if (!analysis) {
      return null;
    }

    return {
      labels: ["Productivity %", "Performance %"],
      datasets: [
        {
          label: "Score",
          data: [analysis.metrics.productivityScore, analysis.metrics.performancePercentage || 0],
          backgroundColor: ["rgba(41, 95, 77, 0.85)", "rgba(244, 107, 69, 0.85)"]
        }
      ]
    };
  }, [analysis]);

  const subjectData = useMemo(() => {
    if (!analysis) {
      return null;
    }

    const uniqueSubjects = new Set(history.map((item) => item.subject.toLowerCase()));
    const strongCount = analysis.subjects.strong.length;
    const weakCount = analysis.subjects.weak.length;
    const averageCount = Math.max(uniqueSubjects.size - strongCount - weakCount, 0);

    return {
      labels: ["Strong Subjects", "Average Subjects", "Weak Subjects"],
      datasets: [
        {
          data: [strongCount, averageCount, weakCount],
          backgroundColor: ["#1a7f5a", "#0ea5e9", "#e5533d"]
        }
      ]
    };
  }, [analysis, history]);

  return (
    <section className="space-y-4">
      <header className="glass rounded-2xl p-8">
        <h1 className="text-4xl mb-2">Performance Tracking</h1>
        <p className="text-sm" style={{ color: 'var(--ink-700)' }}>
          Add quiz and assignment marks out of 10 to track progress and identify strong/weak subjects.
        </p>
      </header>

      <form onSubmit={onSubmit} className="glass grid gap-3 rounded-2xl p-6 md:grid-cols-4">
        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
          className="rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
          disabled={submitting}
          required
        />
        <select
          name="assessmentType"
          value={form.assessmentType}
          onChange={(e) => setForm((prev) => ({ ...prev, assessmentType: e.target.value }))}
          className="rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
          disabled={submitting}
        >
          <option value="quiz">Quiz</option>
          <option value="assignment">Assignment</option>
        </select>
        <input
          name="score"
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Marks (0-10)"
          value={form.score}
          onChange={(e) => setForm((prev) => ({ ...prev, score: e.target.value }))}
          className="rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
          disabled={submitting}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary rounded-lg px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Spinner size="sm" /> : null}
          {submitting ? "Adding..." : "Add Score"}
        </button>
        {error && <p className="text-sm text-red-600 md:col-span-4">{error}</p>}
      </form>

      {loading ? (
        <div className="glass rounded-2xl p-8 flex justify-center">
          <Spinner />
        </div>
      ) : analysis ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 style={{ color: 'var(--primary)' }} className="text-lg font-bold mb-6">📊 Score Overview</h2>
            <div className="mt-4 h-[260px]">
              {scoreData && <Bar data={scoreData} options={{ maintainAspectRatio: false, scales: { y: { max: 100 } } }} />}
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--ink-700)' }}>
              Average marks: <strong>{analysis.metrics.performanceScore.toFixed(2)} / 10</strong>
            </p>
          </div>

          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 style={{ color: 'var(--primary)' }} className="text-lg font-bold mb-6">🎯 Subject Classification</h2>
            <div className="mt-4 h-[260px]">
              {subjectData && subjectData.datasets[0].data.some((value) => value > 0) ? (
                <Doughnut data={subjectData} options={{ maintainAspectRatio: false }} />
              ) : (
                <p className="text-sm" style={{ color: 'var(--ink-700)' }}>Add scores to see classification chart.</p>
              )}
            </div>
            {analysis.subjects.strong.length > 0 && <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--success)' }}>✅ Strong: {analysis.subjects.strong.join(", ")}</p>}
            {analysis.subjects.weak.length > 0 && <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--accent-purple)' }}>⚠️ Weak: {analysis.subjects.weak.join(", ")}</p>}
            {analysis.subjects.strong.length === 0 && analysis.subjects.weak.length === 0 && history.length > 0 && (
              <p className="mt-4 text-sm" style={{ color: 'var(--ink-700)' }}>Subjects are currently in average range.</p>
            )}
            {analysis.subjects.strong.length === 0 && analysis.subjects.weak.length === 0 && history.length === 0 && (
              <p className="mt-4 text-sm" style={{ color: 'var(--ink-700)' }}>Add quiz scores to see classifications.</p>
            )}
          </div>

          <div className="glass rounded-2xl p-6 md:p-8 lg:col-span-2">
            <h2 style={{ color: 'var(--primary)' }} className="text-lg font-bold mb-4">🧾 Score History</h2>
            {history.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ink-700)' }}>No scores added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                      <th className="py-2">Date</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Subject</th>
                      <th className="py-2">Marks (/10)</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item._id} className="border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.08)' }}>
                        <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
                        <td className="py-2">{item.assessmentType || "quiz"}</td>
                        <td className="py-2">{item.subject}</td>
                        <td className="py-2 font-semibold">{Number(item.score).toFixed(1)}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => onDeleteScore(item._id)}
                            disabled={deletingId === item._id}
                            className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 disabled:opacity-60"
                          >
                            {deletingId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Performance Data"
          description="Start by adding your first quiz score above."
        />
      )}
    </section>
  );
};

export default PerformancePage;
