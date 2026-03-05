import Link from "next/link";
import { TrendingUp, TrendingDown, Search, Users, Zap } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, title: "Long Ideas",   desc: "Discover undervalued companies with compelling upside." },
    { icon: <TrendingDown className="w-5 h-5 text-red-500" />,   title: "Short Ideas",  desc: "Find overvalued situations and potential shorts." },
    { icon: <Search className="w-5 h-5 text-blue-500" />,        title: "Deep Research", desc: "Read detailed theses with catalysts, risks, and price targets." },
    { icon: <Users className="w-5 h-5 text-purple-500" />,       title: "Community",    desc: "Vote on ideas and discuss with serious investors." },
    { icon: <Zap className="w-5 h-5 text-amber-500" />,          title: "Score System", desc: "Community scoring surfaces the highest-quality ideas." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6">
          <TrendingUp className="w-3.5 h-3.5" />
          App-first • Community-driven • Value investing
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
          Investment ideas from<br className="hidden sm:block" /> serious investors
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          A modern home for value investors to share, debate, and discover long and short equity ideas with real rigor.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/ideas" className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm">
            Browse Ideas
          </Link>
          <Link href="/signup" className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold transition-colors">
            Join Free
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
