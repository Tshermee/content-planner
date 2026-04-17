"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import type { Comment } from "@/lib/types";

interface InlineCommentsProps {
  postId: string;
  content: string;
}

interface Selection {
  start: number;
  end: number;
  text: string;
  rect: { top: number; left: number };
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
      rect: {
        top: rect.bottom - containerRect.top,
        left: rect.left - containerRect.left,
      },
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
    fetchComments();
  }

  function renderContent() {
    if (comments.length === 0) return content;

    const sorted = [...comments].sort(
      (a, b) => a.selection_start - b.selection_start
    );
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const comment of sorted) {
      if (comment.selection_start < lastIndex) continue;

      if (comment.selection_start > lastIndex) {
        parts.push(content.slice(lastIndex, comment.selection_start));
      }

      const isActive = activeCommentId === comment.id;
      parts.push(
        <mark
          key={comment.id}
          className={`cursor-pointer rounded-sm transition-all duration-150 ${
            isActive
              ? "bg-[#cc8f42]/30 underline decoration-[#cc8f42]/50 decoration-2 underline-offset-2"
              : "bg-[#cc8f42]/15 hover:bg-[#cc8f42]/25"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveCommentId(isActive ? null : comment.id);
          }}
        >
          {content.slice(comment.selection_start, comment.selection_end)}
        </mark>
      );
      lastIndex = comment.selection_end;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  }

  const activeComment = comments.find((c) => c.id === activeCommentId);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={contentRef}
          onMouseUp={handleMouseUp}
          className="min-h-[200px] whitespace-pre-wrap text-[15px] leading-[1.7] text-[#e8e8e8]/90 cursor-text select-text"
        >
          {renderContent()}
        </div>

        {/* New comment popover */}
        {selection && (
          <div
            className="absolute z-10 w-80 rounded-lg border border-white/[0.06] bg-[#252525] p-3 shadow-xl"
            style={{ top: selection.rect.top + 8, left: Math.min(selection.rect.left, 200) }}
          >
            <div className="mb-2.5 rounded bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#9b9a97] leading-relaxed">
              &ldquo;{selection.text.slice(0, 80)}
              {selection.text.length > 80 ? "..." : ""}&rdquo;
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
              rows={2}
              className="mb-2.5 w-full resize-none rounded border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-[#e8e8e8] placeholder:text-[#9b9a97]/40 outline-none focus:border-white/[0.12]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="rounded bg-[#2383e2] px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-[#1b6ec2] disabled:opacity-40"
              >
                Comment
              </button>
              <button
                onClick={() => {
                  setSelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="rounded px-3 py-1 text-[12px] text-[#9b9a97] transition-colors hover:bg-white/[0.04]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active comment detail */}
      {activeComment && (
        <div className="rounded-lg border-l-2 border-l-[#cc8f42]/50 bg-white/[0.02] px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#e8e8e8]">
              {activeComment.user_name}
            </span>
            <span className="text-[11px] text-[#9b9a97]/60">
              {new Date(activeComment.created_at).toLocaleString()}
            </span>
          </div>
          <div className="mb-2 text-[12px] italic text-[#9b9a97]/60">
            &ldquo;{activeComment.selected_text.slice(0, 100)}
            {activeComment.selected_text.length > 100 ? "..." : ""}&rdquo;
          </div>
          <p className="text-[14px] leading-relaxed text-[#e8e8e8]/80">
            {activeComment.body}
          </p>
          <button
            onClick={() => resolveComment(activeComment.id)}
            className="mt-3 rounded px-2 py-0.5 text-[12px] text-[#9b9a97] transition-colors hover:bg-white/[0.04] hover:text-[#e8e8e8]"
          >
            Resolve
          </button>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-1 pt-2">
          <h3 className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#9b9a97]/60">
            Comments ({comments.length})
          </h3>
          {comments.map((c) => (
            <div
              key={c.id}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-[13px] transition-all duration-150 ${
                activeCommentId === c.id
                  ? "bg-white/[0.04]"
                  : "hover:bg-white/[0.02]"
              }`}
              onClick={() =>
                setActiveCommentId(activeCommentId === c.id ? null : c.id)
              }
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-[#e8e8e8]">{c.user_name}</span>
                <span className="text-[11px] text-[#9b9a97]/50">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <div className="text-[12px] italic text-[#9b9a97]/50 truncate mb-0.5">
                &ldquo;{c.selected_text}&rdquo;
              </div>
              <p className="text-[#e8e8e8]/70">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {!displayName && (
        <p className="text-[12px] text-[#9b9a97]/50">
          Pick your name in the header to add comments
        </p>
      )}
    </div>
  );
}
