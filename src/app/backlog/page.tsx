"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Post, Tag } from "@/lib/types";
import { TagBadge } from "@/components/tag-badge";

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-[#454b4e]", text: "text-[#9b9a97]" },
  rejected: { bg: "bg-[#3d2b2b]", text: "text-[#eb5757]" },
  ready: { bg: "bg-[#2b3d33]", text: "text-[#6c9b7d]" },
  posted: { bg: "bg-[#2e3c51]", text: "text-[#529cca]" },
};

export default function BacklogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .in("status", ["draft", "rejected"])
        .order("scheduled_at", { ascending: true, nullsFirst: false });
      if (data) {
        // Sort: scheduled first (by date), then unscheduled (by created_at)
        const scheduled = data.filter((p) => p.scheduled_at).sort(
          (a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
        );
        const unscheduled = data.filter((p) => !p.scheduled_at).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setPosts([...scheduled, ...unscheduled]);
      }
      setLoading(false);
    }
    fetch();

    const channel = supabase
      .channel("backlog-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Backlog</h1>
      <p className="text-[13px] text-[#9b9a97]/60 mb-8">
        All open posts in chronological order
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#9b9a97]/30 border-t-[#9b9a97]" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-[#9b9a97]/50">
          No open posts
        </p>
      ) : (
        <div className="flex flex-col">
          {posts.map((post, i) => {
            const status = STATUS_STYLE[post.status];
            return (
              <Link
                key={post.id}
                href={`/posts?id=${post.id}`}
                className={`group flex items-center gap-4 px-3 py-3 transition-colors hover:bg-white/[0.03] ${
                  i > 0 ? "border-t border-white/[0.04]" : ""
                }`}
              >
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${status.bg} ${status.text}`}>
                  {post.status}
                </span>
                <span className="flex-1 truncate text-[14px] text-[#e8e8e8]/80 group-hover:text-[#e8e8e8]">
                  {post.title}
                </span>
                <TagBadge tag={post.tag as Tag} />
                <span className="shrink-0 text-[12px] text-[#9b9a97]/50">
                  {post.scheduled_at
                    ? new Date(post.scheduled_at).toLocaleDateString("de-CH", {
                        day: "numeric",
                        month: "short",
                      })
                    : "unscheduled"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
