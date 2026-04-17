"use client";

import Link from "next/link";
import { useUser } from "@/lib/user-context";

export function Header() {
  const { user, displayName, signOut } = useUser();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#202020]/80 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[#e8e8e8]/80 hover:text-[#e8e8e8] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="opacity-70">
              <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="10" y="10" width="6" height="6" rx="1" fill="currentColor" opacity="0.3" />
            </svg>
            Content Planner
          </Link>
          <span className="text-white/[0.08]">/</span>
          <nav className="flex items-center gap-0.5">
            <Link
              href="/"
              className="rounded px-2.5 py-1 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
            >
              Calendar
            </Link>
            <Link
              href="/backlog"
              className="rounded px-2.5 py-1 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
            >
              Backlog
            </Link>
            <Link
              href="/posts?new"
              className="rounded px-2.5 py-1 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
            >
              New Post
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#9b9a97]">{displayName}</span>
          <button
            onClick={signOut}
            className="rounded px-2 py-0.5 text-[12px] text-[#9b9a97]/60 hover:bg-white/[0.04] hover:text-[#9b9a97] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
