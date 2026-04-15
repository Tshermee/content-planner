"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Post, Tag } from "@/lib/types";
import { TagBadge } from "@/components/tag-badge";
import { ApprovalButtons } from "@/components/approval-buttons";
import { InlineComments } from "@/components/inline-comments";
import { PostForm } from "@/components/post-form";

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-[#454b4e]", text: "text-[#9b9a97]" },
  approved: { bg: "bg-[#2b3d33]", text: "text-[#6c9b7d]" },
  rejected: { bg: "bg-[#3d2b2b]", text: "text-[#eb5757]" },
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single();
    if (data) setPost(data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#9b9a97]/30 border-t-[#9b9a97]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20">
        <p className="text-[15px] text-[#9b9a97]">Post not found</p>
        <button
          onClick={() => router.push("/")}
          className="rounded px-3 py-1 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
        >
          &larr; Back to Calendar
        </button>
      </div>
    );
  }

  if (editing) {
    return <PostForm post={post} />;
  }

  const status = STATUS_STYLE[post.status];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/")}
        className="mb-8 flex items-center gap-1 rounded px-1.5 py-0.5 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors -ml-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Calendar
      </button>

      <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
        {/* Main content */}
        <div>
          {/* Title */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-[40px] font-bold leading-tight text-[#e8e8e8]">
              {post.title}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="mt-2 shrink-0 rounded px-2.5 py-1 text-[13px] text-[#9b9a97] hover:bg-white/[0.04] hover:text-[#e8e8e8] transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Properties */}
          <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px]">
            <TagBadge tag={post.tag as Tag} />
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${status.bg} ${status.text}`}>
              {post.status}
            </span>
            {post.scheduled_at && (
              <span className="text-[#9b9a97]">
                {new Date(post.scheduled_at).toLocaleDateString("de-CH", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-white/[0.04]" />

          {/* Hint */}
          <p className="mb-4 text-[12px] text-[#9b9a97]/50">
            Select text to leave a comment
          </p>

          {/* Content with inline comments */}
          <InlineComments postId={post.id} content={post.content} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:pt-16">
          <ApprovalButtons postId={post.id} />

          <div className="space-y-2 text-[12px] text-[#9b9a97]/50">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span>{new Date(post.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={async () => {
              if (confirm("Delete this post?")) {
                await supabase.from("posts").delete().eq("id", post.id);
                router.push("/");
              }
            }}
            className="w-full rounded px-3 py-1.5 text-[13px] text-[#eb5757]/70 transition-colors hover:bg-[#3d2b2b] hover:text-[#eb5757]"
          >
            Delete post
          </button>
        </aside>
      </div>
    </div>
  );
}
