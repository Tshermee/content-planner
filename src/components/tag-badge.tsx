import type { Tag } from "@/lib/types";

const TAG_STYLES: Record<Tag, { bg: string; text: string }> = {
  "Chrigu Linkedin": { bg: "bg-[#2e3c51]", text: "text-[#529cca]" },
  "Marco Linkedin": { bg: "bg-[#2b3d33]", text: "text-[#6c9b7d]" },
  "BossInfo Linkedin": { bg: "bg-[#352c49]", text: "text-[#9a6dd7]" },
  "Interner Post": { bg: "bg-[#3e3428]", text: "text-[#cc8f42]" },
};

export function TagBadge({ tag }: { tag: Tag }) {
  const style = TAG_STYLES[tag];
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
    >
      {tag}
    </span>
  );
}
