import { useEffect, useState } from "react";

import { performanceApi } from "../services/api";

const AISuggestionsPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await performanceApi.getAnalysis();
        setAnalysis(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Failed to load AI insights.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return <div className="glass rounded-3xl p-6">Generating suggestions...</div>;
  }

  if (error) {
    return <div className="glass rounded-3xl p-6 text-red-700">{error}</div>;
  }

  return (
    <section className="space-y-6">
      <header className="glass rounded-2xl p-8">
        <h1 className="text-4xl mb-2">AI Insights</h1>
        <p className="text-sm" style={{ color: 'var(--ink-700)' }}>
          Intelligent recommendations based on your study patterns and performance.
        </p>
      </header>

      <div className="glass rounded-3xl p-4 md:p-6">
        <h2 className="text-lg font-semibold">Smart Recommendations</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(analysis.suggestions || []).map((item) => (
            <li key={item} className="rounded-xl bg-white/70 p-3">
              {item}
            </li>
          ))}
          {analysis.suggestions?.length === 0 && <li>No suggestions available yet.</li>}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-3xl p-4 md:p-6">
          <h3 className="text-base font-semibold">Procrastination Risks</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(analysis.procrastinationRisks || []).map((risk) => (
              <li key={risk.taskId} className="rounded-lg bg-red-50 p-2 text-red-700">
                {risk.subject} - {risk.topic} (due {new Date(risk.deadline).toLocaleString()})
              </li>
            ))}
            {analysis.procrastinationRisks?.length === 0 && <li>No immediate risks detected.</li>}
          </ul>
        </div>

        <div className="glass rounded-3xl p-4 md:p-6">
          <h3 className="text-base font-semibold">Current Signals</h3>
          <p className="mt-3 text-sm">Weak subjects: {(analysis.subjects.weak || []).join(", ") || "None"}</p>
          <p className="mt-1 text-sm">Strong subjects: {(analysis.subjects.strong || []).join(", ") || "None"}</p>
          <p className="mt-3 text-sm font-medium text-emerald-900">
            Performance score: {analysis.metrics.performanceScore} / 10 ({analysis.metrics.performancePercentage}%)
          </p>
        </div>
      </div>
    </section>
  );
};

export default AISuggestionsPage;
