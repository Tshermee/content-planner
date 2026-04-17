"use client";

import { useState } from "react";
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
      router.push(`/posts?id=${post.id}`);
    } else {
      const { data } = await supabase
        .from("posts")
        .insert({ ...payload, status: "draft" })
        .select("id")
        .single();
      if (data) router.push(`/posts?id=${data.id}`);
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-6 py-10">
      {/* Properties bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 pl-[54px] text-[13px]">
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
      </div>

      {/* Title — aligned with editor content (54px left for BlockNote side menu) */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        required
        className="mb-1 w-full bg-transparent pl-[54px] text-[40px] font-bold leading-tight text-[#e8e8e8] placeholder:text-[#9b9a97]/30 outline-none"
      />

      {/* Editor */}
      <BlockEditor initialMarkdown={post?.content} onChange={setContent} />

      {/* Actions */}
      <div className="mt-8 flex items-center gap-3 pl-[54px]">
        <button
          type="submit"
          disabled={saving || !title.trim() || !tag}
          className="rounded bg-[#2383e2] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1b6ec2] disabled:opacity-40"
        >
          {saving ? "Saving..." : post ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded px-3.5 py-1.5 text-[13px] text-[#9b9a97] transition-colors hover:bg-white/[0.04] hover:text-[#e8e8e8]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
