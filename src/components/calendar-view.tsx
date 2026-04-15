"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Post, Tag } from "@/lib/types";
import { TagBadge } from "./tag-badge";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_DOT: Record<string, string> = {
  draft: "bg-[#9b9a97]",
  approved: "bg-[#6c9b7d]",
  rejected: "bg-[#eb5757]",
};

export function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = useCallback(async () => {
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .gte("scheduled_at", start)
      .lte("scheduled_at", end)
      .order("scheduled_at", { ascending: true });
    if (data) setPosts(data);
  }, [year, month]);

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const postsByDay: Record<number, Post[]> = {};
  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const day = new Date(post.scheduled_at).getDate();
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(post);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = today.getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Month navigation */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded p-1.5 text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h2 className="text-lg font-medium text-[#e8e8e8]">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded p-1.5 text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border border-white/[0.04] overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.04]">
          {DAY_NAMES.map((d) => (
            <div key={d} className="px-3 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-[#9b9a97]/60">
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = isCurrentMonth && day === todayDate;
            const dayPosts = day ? postsByDay[day] || [] : [];
            const isWeekend = i % 7 >= 5;
            return (
              <div
                key={i}
                className={`relative min-h-[120px] border-b border-r border-white/[0.04] p-2 transition-colors ${
                  day === null
                    ? "bg-white/[0.01]"
                    : isWeekend
                      ? "bg-white/[0.01]"
                      : ""
                }`}
              >
                {day !== null && (
                  <>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded text-[12px] ${
                        isToday
                          ? "bg-[#eb5757] text-white font-medium"
                          : "text-[#9b9a97]/70"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/posts?id=${post.id}`}
                          className="group flex items-start gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-white/[0.04]"
                        >
                          <span className={`mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full ${STATUS_DOT[post.status]}`} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] text-[#e8e8e8]/80 group-hover:text-[#e8e8e8]">
                              {post.title}
                            </div>
                            <TagBadge tag={post.tag as Tag} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <UnscheduledPosts />
    </div>
  );
}

function UnscheduledPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .is("scheduled_at", null)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    }
    fetch();
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#9b9a97]/60">
        Unscheduled
      </h3>
      <div className="flex flex-col gap-px">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts?id=${post.id}`}
            className="flex items-center justify-between rounded px-3 py-2 transition-colors hover:bg-white/[0.03]"
          >
            <span className="text-[14px] text-[#e8e8e8]/80">{post.title}</span>
            <TagBadge tag={post.tag as Tag} />
          </Link>
        ))}
      </div>
    </div>
  );
}
