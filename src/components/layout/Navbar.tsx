"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { TrendingUp, PlusCircle, BookMarked, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-700 shrink-0">
          <TrendingUp className="w-5 h-5" />
          <span className="hidden sm:block">VIC Modern</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/ideas"       className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">Ideas</Link>
          <Link href="/ideas?side=LONG"  className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">Long</Link>
          <Link href="/ideas?side=SHORT" className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">Short</Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/ideas/new"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Idea
              </Link>
              <Link href="/portfolio" className="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Watchlist">
                <BookMarked className="w-5 h-5" />
              </Link>
              <Link href={`/members/${session.user.username ?? ""}`} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login"  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
              <Link href="/signup" className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                Sign up
              </Link>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-3 flex flex-col gap-1 text-sm font-medium">
          <Link href="/ideas"            className="py-2 text-gray-700" onClick={() => setMobileOpen(false)}>All Ideas</Link>
          <Link href="/ideas?side=LONG"  className="py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Long Ideas</Link>
          <Link href="/ideas?side=SHORT" className="py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Short Ideas</Link>
          {session && (
            <Link href="/ideas/new" className="py-2 text-emerald-600 font-semibold" onClick={() => setMobileOpen(false)}>
              + Submit Idea
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
