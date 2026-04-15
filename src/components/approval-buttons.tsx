"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import type { Approval } from "@/lib/types";

export function ApprovalButtons({ postId }: { postId: string }) {
  const { user } = useUser();
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

  const myApproval = approvals.find((a) => a.user_name === user);

  async function vote(approved: boolean) {
    if (!user) return;
    await supabase.from("approvals").upsert(
      { post_id: postId, user_name: user, approved },
      { onConflict: "post_id,user_name" }
    );

    const { data: allApprovals } = await supabase
      .from("approvals")
      .select("*")
      .eq("post_id", postId);

    if (allApprovals) {
      const allApproved =
        allApprovals.length >= 2 && allApprovals.every((a) => a.approved);
      const anyRejected = allApprovals.some((a) => !a.approved);
      const newStatus = allApproved
        ? "approved"
        : anyRejected
          ? "rejected"
          : "draft";
      await supabase
        .from("posts")
        .update({ status: newStatus })
        .eq("id", postId);
    }

    fetchApprovals();
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-[#9b9a97]/60">
        Approvals
      </h3>

      <div className="space-y-1">
        {approvals.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-2 rounded px-2.5 py-1.5 text-[13px] ${
              a.approved
                ? "bg-[#2b3d33] text-[#6c9b7d]"
                : "bg-[#3d2b2b] text-[#eb5757]"
            }`}
          >
            <span>{a.approved ? "\u2713" : "\u2717"}</span>
            <span className="font-medium">{a.user_name}</span>
          </div>
        ))}
        {approvals.length === 0 && (
          <p className="text-[13px] text-[#9b9a97]/60">No votes yet</p>
        )}
      </div>

      {user && (
        <div className="flex gap-1.5">
          <button
            className={`rounded px-3 py-1 text-[13px] font-medium transition-colors ${
              myApproval?.approved === true
                ? "bg-[#2b3d33] text-[#6c9b7d]"
                : "bg-white/[0.04] text-[#9b9a97] hover:bg-white/[0.06] hover:text-[#e8e8e8]"
            }`}
            onClick={() => vote(true)}
          >
            Approve
          </button>
          <button
            className={`rounded px-3 py-1 text-[13px] font-medium transition-colors ${
              myApproval?.approved === false
                ? "bg-[#3d2b2b] text-[#eb5757]"
                : "bg-white/[0.04] text-[#9b9a97] hover:bg-white/[0.06] hover:text-[#e8e8e8]"
            }`}
            onClick={() => vote(false)}
          >
            Reject
          </button>
        </div>
      )}

      {!user && (
        <p className="text-[12px] text-[#9b9a97]/50">
          Pick your name above to vote
        </p>
      )}
    </div>
  );
}
