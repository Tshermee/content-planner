"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PostDetail } from "@/components/post-detail";
import { PostForm } from "@/components/post-form";

function PostsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isNew = searchParams.get("new") !== null;

  if (isNew) {
    return <PostForm />;
  }

  if (id) {
    return <PostDetail id={id} />;
  }

  return <PostForm />;
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#9b9a97]/30 border-t-[#9b9a97]" />
        </div>
      }
    >
      <PostsContent />
    </Suspense>
  );
}
