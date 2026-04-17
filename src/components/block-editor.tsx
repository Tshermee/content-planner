"use client";

import { useRef, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface BlockEditorProps {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}

export function BlockEditor({ initialMarkdown, onChange }: BlockEditorProps) {
  const editor = useCreateBlockNote();
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
    <div className="[&_.bn-editor]:min-h-[300px] [&_.bn-editor]:px-0 [&_.bn-editor]:py-2 [&_.bn-container]:bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:text-[#e8e8e8] [&_.bn-block-content]:text-[15px] [&_.bn-block-content]:leading-relaxed">
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
