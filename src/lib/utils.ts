import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Count the visible characters in a BlockNote document.
 * `content` is a JSON string of blocks; we walk it and sum the text of every
 * inline content node so the count reflects what a reader sees, not the JSON.
 */
export function countBlockNoteText(content: string): number {
  if (!content) return 0

  let doc: unknown
  try {
    doc = JSON.parse(content)
  } catch {
    // Legacy/plain content that isn't JSON — count it as-is.
    return content.length
  }

  let length = 0
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>
      if (typeof obj.text === "string") length += obj.text.length
      for (const key in obj) {
        if (key !== "text") walk(obj[key])
      }
    }
  }
  walk(doc)
  return length
}
