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

// Extract all image URLs from HTML string
function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && !match[1].startsWith("data:image/svg")) {
      urls.push(match[1]);
    }
  }
  return urls;
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

  // Intercept paste to handle images copied from webpages
  useEffect(() => {
    const editorEl = document.querySelector(".bn-editor");
    if (!editorEl) return;

    function handlePaste(e: Event) {
      const ce = e as ClipboardEvent;
      if (!ce.clipboardData) return;

      // If clipboard has an image file, let BlockNote handle it natively
      const items = Array.from(ce.clipboardData.items);
      const hasImageFile = items.some(
        (item) => item.type.startsWith("image/") && item.kind === "file"
      );
      if (hasImageFile) return;

      // Check for HTML with <img> tags (copy image from web)
      const html = ce.clipboardData.getData("text/html");
      if (!html) return;

      const imageUrls = extractImageUrls(html);
      if (imageUrls.length === 0) return;

      // Prevent BlockNote from inserting the alt text / HTML as text
      e.preventDefault();
      e.stopPropagation();

      // Insert image blocks with the external URLs directly
      // (no re-upload — CORS blocks most external fetches)
      try {
        const cursor = editor.getTextCursorPosition().block;
        for (const url of imageUrls) {
          editor.insertBlocks(
            [{ type: "image", props: { url } }],
            cursor,
            "after"
          );
        }
        // Trigger onChange
        if (onChangeRef.current) {
          const md = editor.blocksToMarkdownLossy(editor.document);
          onChangeRef.current(md);
        }
      } catch (err) {
        console.error("Failed to insert pasted image:", err);
      }
    }

    // Use capture phase to intercept before BlockNote's handler
    editorEl.addEventListener("paste", handlePaste, true);
    return () => editorEl.removeEventListener("paste", handlePaste, true);
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
