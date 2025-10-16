"use client";

import { useMemo, useState } from "react";
import type { Email, Rule, SortRequest, SortResponse } from "@/types/email";
import sampleEmailsJson from "../data/sampleEmails.json";
import sampleRulesJson from "../data/sampleRules.json";

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

type EditorProps<T> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
};

function JsonEditor<T>({ label, value, onChange }: EditorProps<T>) {
  const [raw, setRaw] = useState(() => pretty(value));
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string) {
    setRaw(next);
    try {
      const parsed = JSON.parse(next);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError("Invalid JSON");
    }
  }

  return (
    <div className="section">
      <div className="button-row" style={{ justifyContent: "space-between" }}>
        <h2>{label}</h2>
        <div className="button-row">
          <button className="ghost" onClick={() => setRaw(pretty(value))}>Format</button>
        </div>
      </div>
      <textarea value={raw} onChange={(e) => handleChange(e.target.value)} spellCheck={false} />
      {error && <div className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>{error}</div>}
    </div>
  );
}

export default function HomePage() {
  const [emails, setEmails] = useState<Email[]>(sampleEmailsJson as Email[]);
  const [rules, setRules] = useState<Rule[]>(sampleRulesJson as Rule[]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SortResponse | null>(null);

  const foldersCount = useMemo(() => {
    if (!result) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    for (const r of result.results) {
      for (const f of r.folders) {
        counts[f] = (counts[f] || 0) + 1;
      }
    }
    return counts;
  }, [result]);

  async function runSort() {
    setLoading(true);
    try {
      const payload: SortRequest = { emails, rules };
      const response = await fetch("/api/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await response.json()) as SortResponse;
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  function loadSamples() {
    setEmails(sampleEmailsJson as Email[]);
    setRules(sampleRulesJson as Rule[]);
    setResult(null);
  }

  return (
    <div className="stack">
      <div className="section">
        <div className="button-row" style={{ justifyContent: "space-between" }}>
          <h2>Controls</h2>
          <div className="button-row">
            <button className="ghost" onClick={loadSamples}>Load samples</button>
            <button onClick={runSort} disabled={loading}>{loading ? "Sorting..." : "Run sorting"}</button>
          </div>
        </div>
        <div className="button-row" style={{ gap: 16 }}>
          <div className="folder">Folders: {Object.keys(foldersCount).length}</div>
          <div className="badge">Results: {result?.results.length ?? 0}</div>
        </div>
      </div>

      <div className="grid">
        <JsonEditor label="Emails JSON" value={emails} onChange={setEmails} />
        <JsonEditor label="Rules JSON" value={rules} onChange={setRules} />
      </div>

      <div className="section">
        <h2>Results</h2>
        {!result && <div className="badge">No results yet</div>}
        {result && (
          <div className="cards">
            {result.results.map((r) => {
              const email = emails.find(e => e.id === r.emailId);
              return (
                <div className="card" key={r.emailId}>
                  <h4>{email?.subject ?? r.emailId}</h4>
                  <div className="meta">
                    <span>From: {email?.from}</span>
                    <span>Date: {email?.date}</span>
                  </div>
                  <div className="labels">
                    {r.folders.map(f => <span className="folder" key={f}>{f}</span>)}
                    {r.labels.map(l => <span className="badge" key={l}>{l}</span>)}
                    {r.important && <span className="badge" style={{ background: "#dcfce7", color: "#166534" }}>Important</span>}
                    {r.spam && <span className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>Spam</span>}
                  </div>
                  <div className="excerpt">{email?.body.slice(0, 160)}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Matched rules: <span className="code-inline">{r.matchedRules.join(", ") || "-"}</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="section">
        <h2>API Preview</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{pretty({ emails: "[...]", rules: "[...]" })}</pre>
      </div>
    </div>
  );
}
