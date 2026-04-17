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

async function uploadFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
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

  return (
    <div className="bn-dark-theme [&_.bn-editor]:min-h-[300px] [&_.bn-container]:bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:text-[#e8e8e8] [&_.bn-block-content]:text-[15px] [&_.bn-block-content]:leading-relaxed [&_.bn-side-menu]:!left-0">
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
