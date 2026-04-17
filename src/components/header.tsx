"use client";

import Image from "next/image";
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
            className="flex items-center gap-2.5 text-sm font-medium text-[#e8e8e8]/80 hover:text-[#e8e8e8] transition-colors"
          >
            <Image
              src="/content-planner/bossinfo-logo.svg"
              alt="Boss Info"
              width={80}
              height={18}
              className="brightness-0 invert opacity-70"
            />
            <span className="text-white/[0.15]">|</span>
            <span className="text-[13px]">AI Content Planner</span>
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
