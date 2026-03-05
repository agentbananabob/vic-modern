"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ideaSchema, type IdeaInput } from "@/lib/validations";

export function IdeaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Partial<IdeaInput>>({ side: "LONG" });

  const set = (k: keyof IdeaInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
    setErrors(prev => { const next = { ...prev }; delete next[k]; return next; });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ideaSchema.safeParse({ ...form, targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined, entryPrice: form.entryPrice ? Number(form.entryPrice) : undefined });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""])));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      router.push(`/ideas/${json.data.id}`);
    } catch (err) {
      setErrors({ _form: String(err) });
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof IdeaInput, el: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {el}
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  const input = (key: keyof IdeaInput, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} onChange={set(key)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
  );

  const textarea = (key: keyof IdeaInput, props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} onChange={set(key)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y" />
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      {errors._form && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors._form}</div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {field("Ticker *",   "ticker",   input("ticker",   { placeholder: "AAPL", className: "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase" }))}
        {field("Exchange",   "exchange", input("exchange", { placeholder: "NASDAQ" }))}
        {field("Direction *", "side",
          <select onChange={set("side")} defaultValue="LONG" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        )}
      </div>

      {field("Title *", "title", input("title", { placeholder: "e.g. AAPL — Best-in-class consumer ecosystem at a discount" }))}

      <div className="grid sm:grid-cols-3 gap-4">
        {field("Entry Price",  "entryPrice",  input("entryPrice",  { type: "number", step: "0.01", placeholder: "150.00" }))}
        {field("Target Price", "targetPrice", input("targetPrice", { type: "number", step: "0.01", placeholder: "220.00" }))}
        {field("Timeframe",    "timeframe",   input("timeframe",   { placeholder: "12-18 months" }))}
      </div>

      {field("Investment Thesis *", "thesis", textarea("thesis", { rows: 6, placeholder: "Describe your investment thesis in detail (min 100 chars)…" }))}
      {field("Key Catalysts",       "catalysts", textarea("catalysts", { rows: 3, placeholder: "What events or factors could drive the stock toward your target?" }))}
      {field("Key Risks",           "risks",     textarea("risks",     { rows: 3, placeholder: "What are the main risks to this thesis?" }))}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
          {loading ? "Submitting…" : "Submit Idea"}
        </button>
      </div>
    </form>
  );
}
