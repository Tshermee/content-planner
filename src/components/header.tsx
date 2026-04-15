"use client";

import Link from "next/link";
import { useUser } from "@/lib/user-context";
import { USERS } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Header() {
  const { user, setUser } = useUser();

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
              href="/posts/new"
              className="rounded px-2.5 py-1 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
            >
              New Post
            </Link>
          </nav>
        </div>
        <Select
          value={user ?? ""}
          onValueChange={(v) => setUser(v as (typeof USERS)[number])}
        >
          <SelectTrigger className="h-7 w-28 border-white/[0.06] bg-transparent text-[13px] text-[#9b9a97] hover:bg-white/[0.04]">
            <SelectValue placeholder="Who are you?" />
          </SelectTrigger>
          <SelectContent className="bg-[#252525] border-white/[0.06]">
            {USERS.map((u) => (
              <SelectItem key={u} value={u} className="text-[13px] text-[#e8e8e8] focus:bg-white/[0.04]">
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
