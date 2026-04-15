"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface BlockEditorProps {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}

export function BlockEditor({ initialMarkdown, onChange }: BlockEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  const initialized = { current: false };
  if (!initialized.current && initialMarkdown && editor) {
    initialized.current = true;
    (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
      editor.replaceBlocks(editor.document, blocks);
    })();
  }

  return (
    <div className="[&_.bn-editor]:min-h-[300px] [&_.bn-editor]:px-0 [&_.bn-editor]:py-2 [&_.bn-container]:bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:text-[#e8e8e8] [&_.bn-block-content]:text-[15px] [&_.bn-block-content]:leading-relaxed">
      <BlockNoteView
        editor={editor}
        theme="dark"
        onChange={async () => {
          if (onChange) {
            const md = await editor.blocksToMarkdownLossy(editor.document);
            onChange(md);
          }
        }}
      />
    </div>
  );
}
