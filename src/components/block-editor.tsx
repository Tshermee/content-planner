"use client";

import { useRef, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { supabase } from "@/lib/supabase";
import "@blocknote/mantine/style.css";

interface BlockEditorProps {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
};

async function uploadFile(file: File): Promise<string> {
  // Determine extension from MIME type first (more reliable for clipboard pastes),
  // fall back to file name extension
  let ext = MIME_TO_EXT[file.type];
  if (!ext) {
    const parts = file.name.split(".");
    ext = parts.length > 1 ? parts.pop()! : "png";
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Upload failed:", error);
    throw error;
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

// Re-upload an external image URL to Supabase storage
async function reuploadExternalImage(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return url; // can't fetch, return original
    const blob = await res.blob();
    const file = new File([blob], "pasted-image", { type: blob.type });
    return await uploadFile(file);
  } catch {
    return url; // on any error, keep the original URL
  }
}

export function BlockEditor({ initialMarkdown, onChange }: BlockEditorProps) {
  const editor = useCreateBlockNote({
    uploadFile,
  });
  const initialized = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (initialized.current || !initialMarkdown) return;
    initialized.current = true;
    (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [editor, initialMarkdown]);

  // Intercept paste to handle images that come as HTML img references
  useEffect(() => {
    const editorEl = document.querySelector(".bn-editor");
    if (!editorEl) return;

    async function handlePaste(e: Event) {
      const ce = e as ClipboardEvent;
      const items = ce.clipboardData?.items;
      if (!items) return;

      // Check if clipboard has image files — BlockNote handles these natively via uploadFile
      for (const item of items) {
        if (item.type.startsWith("image/") && item.kind === "file") {
          return; // Let BlockNote handle it
        }
      }

      // Check if clipboard has HTML with images (copy image from web)
      const html = ce.clipboardData?.getData("text/html");
      if (html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) {
          e.preventDefault();
          const publicUrl = await reuploadExternalImage(match[1]);
          editor.insertBlocks(
            [{ type: "image", props: { url: publicUrl } }],
            editor.getTextCursorPosition().block,
            "after"
          );
          // Trigger onChange
          if (onChangeRef.current) {
            const md = await editor.blocksToMarkdownLossy(editor.document);
            onChangeRef.current(md);
          }
        }
      }
    }

    editorEl.addEventListener("paste", handlePaste);
    return () => editorEl.removeEventListener("paste", handlePaste);
  }, [editor]);

  return (
    <div className="bn-dark-theme [&_.bn-editor]:min-h-[300px] [&_.bn-container]:bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:text-[#e8e8e8] [&_.bn-block-content]:text-[15px] [&_.bn-block-content]:leading-relaxed [&_.bn-inline-content]:text-[15px]">
      <BlockNoteView
        editor={editor}
        theme="dark"
        onChange={async () => {
          if (onChangeRef.current) {
            const md = await editor.blocksToMarkdownLossy(editor.document);
            onChangeRef.current(md);
          }
        }}
      />
    </div>
  );
}
