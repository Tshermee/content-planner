"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TAGS, type Tag, type Post } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BlockEditor = dynamic(
  () => import("./block-editor").then((m) => m.BlockEditor),
  { ssr: false }
);

interface PostFormProps {
  post?: Post;
}

function AutoResizeTextarea({
  value,
  onChange,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      {...props}
    />
  );
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tag, setTag] = useState<Tag | "">(post?.tag ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduled_at ? post.scheduled_at.slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !tag) return;
    setSaving(true);

    const payload = {
      title: title.trim(),
      content,
      tag,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (post) {
      await supabase.from("posts").update(payload).eq("id", post.id);
    } else {
      const { data } = await supabase
        .from("posts")
        .insert({ ...payload, status: "draft" })
        .select("id")
        .single();
      if (data) {
        // Full navigation to avoid stale searchParams on same-route push
        const base = window.location.pathname;
        window.location.href = `${base}?id=${data.id}`;
        return;
      }
    }

    // For updates, also do full navigation to get fresh data
    window.location.href = `${window.location.pathname}?id=${post!.id}`;
    return;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl px-6 py-10">
      {/* Sticky top bar with properties + save */}
      <div className="sticky top-11 z-40 -mx-6 mb-6 border-b border-white/[0.04] bg-[#191919]/90 backdrop-blur-md px-6 py-2">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 pl-[54px] text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-[#9b9a97]">Channel</span>
            <Select value={tag} onValueChange={(v) => setTag(v as Tag)}>
              <SelectTrigger className="h-7 w-44 border-white/[0.06] bg-white/[0.03] text-[13px] text-[#e8e8e8]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-white/[0.06]">
                {TAGS.map((t) => (
                  <SelectItem key={t} value={t} className="text-[13px] text-[#e8e8e8] focus:bg-white/[0.04]">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#9b9a97]">Schedule</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-7 rounded border border-white/[0.06] bg-white/[0.03] px-2 text-[13px] text-[#e8e8e8] outline-none focus:border-white/[0.12]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded px-3 py-1 text-[13px] text-[#9b9a97] transition-colors hover:bg-white/[0.04] hover:text-[#e8e8e8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !tag}
              className="rounded bg-[#2383e2] px-3.5 py-1 text-[13px] font-medium text-white transition-colors hover:bg-[#1b6ec2] disabled:opacity-40"
            >
              {saving ? "Saving..." : post ? "Save changes" : "Create post"}
            </button>
          </div>
        </div>
      </div>

      {/* Title — auto-resizing textarea so long titles wrap */}
      <AutoResizeTextarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        required
        className="mb-1 w-full resize-none overflow-hidden bg-transparent pl-[54px] text-[40px] font-bold leading-tight text-[#e8e8e8] placeholder:text-[#9b9a97]/30 outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      />

      {/* Editor */}
      <BlockEditor initialContent={post?.content} onChange={setContent} />

    </form>
  );
}
