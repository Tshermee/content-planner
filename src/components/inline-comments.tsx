"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import type { Comment } from "@/lib/types";

const BlockViewer = dynamic(
  () => import("./block-viewer").then((m) => m.BlockViewer),
  { ssr: false }
);

interface InlineCommentsProps {
  postId: string;
  content: string;
}

interface Selection {
  start: number;
  end: number;
  text: string;
  top: number;
}

export function InlineComments({ postId, content }: InlineCommentsProps) {
  const { displayName } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("resolved", false)
      .order("selection_start", { ascending: true });
    if (data) setComments(data);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function handleMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !contentRef.current) return;

    const range = sel.getRangeAt(0);
    const container = contentRef.current;
    if (!container.contains(range.startContainer)) return;

    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const text = sel.toString();
    const end = start + text.length;

    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setSelection({
      start,
      end,
      text,
      top: rect.top - containerRect.top,
    });
  }

  async function addComment() {
    if (!selection || !newComment.trim() || !displayName) return;
    await supabase.from("comments").insert({
      post_id: postId,
      user_name: displayName,
      body: newComment.trim(),
      selection_start: selection.start,
      selection_end: selection.end,
      selected_text: selection.text,
    });
    setNewComment("");
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    fetchComments();
  }

  async function resolveComment(commentId: string) {
    await supabase
      .from("comments")
      .update({ resolved: true })
      .eq("id", commentId);
    if (activeCommentId === commentId) setActiveCommentId(null);
    fetchComments();
  }

  // Stack comments so they don't overlap
  const sortedComments = [...comments].sort(
    (a, b) => a.selection_start - b.selection_start
  );
  const commentTops: Record<string, number> = {};
  let lastBottom = 0;
  for (const c of sortedComments) {
    const top = Math.max(c.selection_start * 0.5, lastBottom); // approximate Y from offset
    commentTops[c.id] = top;
    lastBottom = top + 80;
  }

  return (
    <div className="relative flex gap-6">
      {/* Content column */}
      <div className="min-w-0 flex-1">
        <div
          ref={contentRef}
          onMouseUp={handleMouseUp}
          className="cursor-text select-text"
        >
          <BlockViewer content={content} />
        </div>
      </div>

      {/* Right sidebar for comments */}
      <div className="relative hidden w-[280px] shrink-0 lg:block">
        {sortedComments.map((c) => (
          <div
            key={c.id}
            className={`absolute left-0 right-0 rounded-lg border px-3 py-2 text-[12px] transition-all duration-150 cursor-pointer ${
              activeCommentId === c.id
                ? "border-[#cc8f42]/30 bg-[#cc8f42]/5"
                : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]"
            }`}
            style={{ top: commentTops[c.id] ?? 0 }}
            onClick={() =>
              setActiveCommentId(activeCommentId === c.id ? null : c.id)
            }
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[#e8e8e8]">{c.user_name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resolveComment(c.id);
                }}
                className="text-[11px] text-[#9b9a97]/40 hover:text-[#9b9a97] transition-colors"
              >
                Resolve
              </button>
            </div>
            <div className="text-[11px] italic text-[#9b9a97]/50 truncate mb-1">
              &ldquo;{c.selected_text}&rdquo;
            </div>
            <p className="text-[#e8e8e8]/70 leading-relaxed">{c.body}</p>
          </div>
        ))}

        {/* New comment input */}
        {selection && (
          <div
            className="absolute left-0 right-0 rounded-lg border border-[#2383e2]/30 bg-[#252525] p-3 shadow-xl z-10"
            style={{ top: selection.top }}
          >
            <div className="mb-2 rounded bg-white/[0.03] px-2 py-1 text-[11px] text-[#9b9a97] leading-relaxed truncate">
              &ldquo;{selection.text.slice(0, 60)}
              {selection.text.length > 60 ? "..." : ""}&rdquo;
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
              rows={2}
              className="mb-2 w-full resize-none rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-[12px] text-[#e8e8e8] placeholder:text-[#9b9a97]/40 outline-none focus:border-white/[0.12]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="rounded bg-[#2383e2] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#1b6ec2] disabled:opacity-40"
              >
                Comment
              </button>
              <button
                onClick={() => {
                  setSelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="rounded px-2.5 py-1 text-[11px] text-[#9b9a97] transition-colors hover:bg-white/[0.04]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
