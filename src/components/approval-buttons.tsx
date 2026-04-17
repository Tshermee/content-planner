"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import type { Approval } from "@/lib/types";

export function ApprovalButtons({ postId, onStatusChange }: { postId: string; onStatusChange?: () => void }) {
  const { displayName } = useUser();
  const [approvals, setApprovals] = useState<Approval[]>([]);

  const fetchApprovals = useCallback(async () => {
    const { data } = await supabase
      .from("approvals")
      .select("*")
      .eq("post_id", postId);
    if (data) setApprovals(data);
  }, [postId]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const myApproval = approvals.find((a) => a.user_name === displayName);

  async function vote(approved: boolean) {
    if (!displayName) return;
    await supabase.from("approvals").upsert(
      { post_id: postId, user_name: displayName, approved },
      { onConflict: "post_id,user_name" }
    );

    const { data: allApprovals } = await supabase
      .from("approvals")
      .select("*")
      .eq("post_id", postId);

    if (allApprovals) {
      const anyApproved = allApprovals.some((a) => a.approved);
      const anyRejected = allApprovals.some((a) => !a.approved);
      const newStatus = anyRejected
        ? "rejected"
        : anyApproved
          ? "ready"
          : "draft";
      await supabase
        .from("posts")
        .update({ status: newStatus })
        .eq("id", postId);
    }

    fetchApprovals();
    onStatusChange?.();
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Other users' votes */}
      {approvals
        .filter((a) => a.user_name !== displayName)
        .map((a) => (
          <span
            key={a.id}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[12px] ${
              a.approved
                ? "bg-[#2b3d33] text-[#6c9b7d]"
                : "bg-[#3d2b2b] text-[#eb5757]"
            }`}
          >
            {a.approved ? "\u2713" : "\u2717"} {a.user_name}
          </span>
        ))}

      {/* My vote buttons */}
      <button
        className={`rounded px-2 py-1 text-[12px] font-medium transition-colors ${
          myApproval?.approved === true
            ? "bg-[#2b3d33] text-[#6c9b7d]"
            : "bg-white/[0.04] text-[#9b9a97] hover:bg-white/[0.06] hover:text-[#e8e8e8]"
        }`}
        onClick={() => vote(true)}
      >
        {myApproval?.approved === true ? "\u2713 " : ""}Approve
      </button>
      <button
        className={`rounded px-2 py-1 text-[12px] font-medium transition-colors ${
          myApproval?.approved === false
            ? "bg-[#3d2b2b] text-[#eb5757]"
            : "bg-white/[0.04] text-[#9b9a97] hover:bg-white/[0.06] hover:text-[#e8e8e8]"
        }`}
        onClick={() => vote(false)}
      >
        {myApproval?.approved === false ? "\u2717 " : ""}Reject
      </button>
    </div>
  );
}
