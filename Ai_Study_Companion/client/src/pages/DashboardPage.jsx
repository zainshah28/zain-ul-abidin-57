import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

import EmptyState from "../components/EmptyState";
import PomodoroTimer from "../components/PomodoroTimer";
import Spinner from "../components/Spinner";
import StatCard from "../components/StatCard";
import { useToast } from "../context/ToastContext";
import { goalApi, intelligenceApi, performanceApi } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const DashboardPage = () => {
  const { addToast } = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [focusInsights, setFocusInsights] = useState(null);
  const [dueReviews, setDueReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [goalLoading, setGoalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analysisRes, goalRes] = await Promise.all([
          performanceApi.getAnalysis(),
          goalApi.getWeeklyGoal()
        ]);

        const [scheduleRes, predictionsRes, focusInsightsRes, dueReviewsRes] = await Promise.all([
          intelligenceApi.getSchedule(7),
          intelligenceApi.getPredictions(),
          intelligenceApi.getFocusInsights(),
          intelligenceApi.getDueReviews()
        ]);

        setAnalysis(analysisRes.data);
        setGoal(goalRes.data);
        setSchedule(scheduleRes.data);
        setPredictions(predictionsRes.data);
        setFocusInsights(focusInsightsRes.data);
        setDueReviews(dueReviewsRes.data?.dueCount || 0);
      } catch (apiError) {
        const msg = apiError.response?.data?.message || "Failed to load dashboard.";
        setError(msg);
        addToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  const setGoalHandler = async (e) => {
    e.preventDefault();
    if (!goalInput || Number(goalInput) <= 0) {
      addToast("Goal must be greater than 0", "error");
      return;
    }

    setGoalLoading(true);
    try {
      const res = await goalApi.setWeeklyGoal({ targetHours: Number(goalInput) });
      setGoal(res.data);
      setGoalInput("");
      addToast("Weekly goal set!", "success");
    } catch (e) {
      addToast("Failed to set goal", "error");
    } finally {
      setGoalLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const points = analysis?.studyHoursByDay || [];
    return {
      labels: points.map((point) => point.date.slice(5)),
      datasets: [
        {
          label: "Study Hours",
          data: points.map((point) => point.hours),
          borderColor: "#f46b45",
          backgroundColor: "rgba(244, 107, 69, 0.22)",
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [analysis]);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Dashboard"
        description={error}
      />
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        title="Dashboard Empty"
        description="Start by adding tasks and quiz scores to see insights."
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="glass rounded-2xl p-8">
        <h1 className="text-4xl mb-2">Performance Dashboard</h1>
        <p className="text-sm" style={{ color: "var(--ink-700)" }}>
          Track progress, analyze patterns, and level up your learning strategy.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Study Hours"
          value={analysis.metrics.totalStudyHours}
          hint="Accumulated study time"
        />
        <StatCard
          label="Weak Subjects"
          value={analysis?.weakSubjects?.length || 0}
          hint="Areas needing practice"
        />
        <StatCard
          label="Pending Tasks"
          value={analysis?.procrastinationRisks?.length || 0}
          hint="Focus points"
        />
        <StatCard
          label="Productivity Score"
          value={`${analysis.metrics.productivityScore}%`}
          hint="Overall performance"
        />
        <StatCard
          label="Due Reviews"
          value={dueReviews}
          hint="Spaced repetition today"
        />
        <StatCard
          label="Focus Quality"
          value={`${focusInsights?.metrics?.averageQuality || 0}`}
          hint="Recent session quality"
        />
        <StatCard
          label="At-Risk Subjects"
          value={predictions?.warnings?.atRiskSubjects?.length || 0}
          hint="Predicted exam risk"
        />
      </div>

      <div className="glass rounded-2xl p-6 md:p-8">
        <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-6">
          Focus Session
        </h2>
        <PomodoroTimer onSessionComplete={(sessions) => addToast(`${sessions} session(s) completed!`, "success")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-6">
            Weekly Goal
          </h2>
          <form onSubmit={setGoalHandler} className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2" style={{ color: "var(--primary)" }}>
                Target Study Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Enter target hours"
                className="w-full rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={goalLoading}
              className="btn-primary w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {goalLoading ? "Setting..." : "Set Goal"}
            </button>
          </form>
          {goal && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(168, 85, 247, 0.15)" }}>
              <p className="text-xs uppercase font-bold tracking-wider mb-3" style={{ color: "var(--primary)" }}>
                Progress
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "var(--ink-700)" }}>Target: {goal.targetHours}h</span>
                  <span className="font-semibold" style={{ color: "var(--accent-cyan)" }}>
                    {analysis?.metrics.totalStudyHours}h
                  </span>
                </div>
                <div className="w-full bg-gradient-to-r from-[rgba(168,85,247,0.1)] to-[rgba(6,182,212,0.1)] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((analysis?.metrics.totalStudyHours / goal.targetHours) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-6">
            Quick Insights
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.1))" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                Performance Score
              </p>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--accent-purple)" }}>
                {analysis.metrics.performanceScore.toFixed(1)} / 10
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(224, 215, 241, 0.1))" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-cyan)" }}>
                Consistency Index
              </p>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--accent-cyan)" }}>
                {analysis.metrics.consistencyScore?.toFixed(1) || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-6">
            Study Progress (Last 7 Days)
          </h2>
          <div className="h-[300px]">
            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-6">
            AI Suggestions
          </h2>
          <ul className="space-y-3">
            {(analysis.suggestions || []).slice(0, 4).map((item, idx) => (
              <li
                key={idx}
                className="rounded-lg p-3 text-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.05))",
                  borderLeft: "3px solid var(--accent-purple)",
                  color: "var(--ink-700)"
                }}
              >
                {item}
              </li>
            ))}
            {analysis.suggestions?.length === 0 && (
              <li className="text-sm text-center py-4" style={{ color: "var(--ink-700)" }}>
                Keep up the momentum.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-4">
            Intelligent Schedule (Next 7 Days)
          </h2>
          <ul className="space-y-3 text-sm">
            {(schedule?.plan || []).slice(0, 4).map((day) => (
              <li
                key={day.date}
                className="rounded-lg p-3"
                style={{
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(168, 85, 247, 0.08))"
                }}
              >
                <p className="font-semibold" style={{ color: "var(--primary)" }}>
                  {day.date} • {day.targetHours}h target
                </p>
                <p style={{ color: "var(--ink-700)" }}>
                  {(day.blocks || []).slice(0, 2).map((block) => `${block.subject} (${block.topic})`).join(" • ") || "No scheduled blocks"}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 style={{ color: "var(--primary)" }} className="text-lg font-bold mb-4">
            Predictive Alerts
          </h2>
          <ul className="space-y-3 text-sm">
            {(predictions?.deadlineRisks || []).slice(0, 4).map((risk) => (
              <li
                key={risk.taskId}
                className="rounded-lg p-3"
                style={{
                  background: "linear-gradient(135deg, rgba(244, 107, 69, 0.12), rgba(168, 85, 247, 0.05))"
                }}
              >
                <p className="font-semibold" style={{ color: "var(--primary)" }}>
                  {risk.subject} - {risk.topic}
                </p>
                <p style={{ color: "var(--ink-700)" }}>
                  Deadline miss risk: {risk.missDeadlineRisk}% (conf: {Math.round((risk.confidence || 0) * 100)}%)
                </p>
              </li>
            ))}
            {(!predictions?.deadlineRisks || predictions.deadlineRisks.length === 0) && (
              <li className="rounded-lg p-3 text-sm" style={{ color: "var(--ink-700)", background: "rgba(6, 182, 212, 0.08)" }}>
                No high-risk deadlines detected.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
