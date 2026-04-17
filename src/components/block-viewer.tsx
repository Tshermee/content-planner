"use client";

import { useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import "@blocknote/mantine/style.css";

interface BlockViewerProps {
  content: string; // JSON string of blocks
}

export function BlockViewer({ content }: BlockViewerProps) {
  const editor = useCreateBlockNote({ });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const blocks = JSON.parse(content) as Block[];
      editor.replaceBlocks(editor.document, blocks);
    } catch {
      // Legacy markdown content
      (async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(content);
        editor.replaceBlocks(editor.document, blocks);
      })();
    }
  }, [editor, content]);

  return (
    <div className="bn-dark-theme [&_.bn-container]:bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:text-[#e8e8e8] [&_.bn-block-content]:text-[15px] [&_.bn-block-content]:leading-relaxed [&_.bn-inline-content]:text-[15px] [&_.bn-side-menu]:hidden">
      <BlockNoteView
        editor={editor}
        editable={false}
        theme="dark"
      />
    </div>
  );
}
