"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Send, Edit, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { formatRelative, getInitials } from "@/lib/utils";
import {
  reviewBudgetAction,
  submitBudgetAction,
  addApprovalCommentAction,
} from "../actions";

type Comment = {
  id: string;
  approvalId: string;
  authorId: string;
  body: string;
  createdAt: Date;
};

interface Props {
  budgetId: string;
  status: string;
  canApprove: boolean;
  canSubmit: boolean;
  approvalType: "finance" | "chairperson";
  commentsMode?: boolean;
  comments?: Comment[];
  currentUserInitials?: string;
  approvalId?: string;
  currentUserId?: string;
}

export function BudgetActions({
  budgetId,
  status,
  canApprove,
  canSubmit,
  approvalType,
  commentsMode,
  comments = [],
  currentUserInitials = "?",
  approvalId,
  currentUserId,
}: Readonly<Props>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [error, setError] = useState("");

  const [confirmDecision, setConfirmDecision] = useState<"approved" | "rejected" | null>(null);
  const [confirmComment, setConfirmComment] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setConfirmDecision(null);
        setConfirmComment("");
      }
    };
    if (confirmDecision) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [confirmDecision]);

  const [optimisticComments, setOptimisticComments] = useState<Comment[] | null>(null);
  const displayComments = optimisticComments ?? comments;

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await submitBudgetAction(budgetId);
      if ("error" in res) setError(String(res.error));
      else router.refresh();
    });
  };

  const handleReview = (decision: "approved" | "rejected" | "needs_changes", resolvedComment?: string) => {
    startTransition(async () => {
      const res = await reviewBudgetAction({
        budgetId,
        decision,
        comment: resolvedComment,
        approvalType,
      });
      if ("error" in res) setError(JSON.stringify(res.error));
      else { setShowRejectForm(false); setConfirmDecision(null); setConfirmComment(""); router.refresh(); }
    });
  };

  const handleComment = () => {
    if (!comment.trim() || !approvalId) return;
    const body = comment.trim();
    setComment("");
    setOptimisticComments((prev) => [
      ...(prev ?? comments),
      {
        id: `optimistic-${Date.now()}`,
        approvalId,
        authorId: currentUserId ?? "",
        body,
        createdAt: new Date(),
      },
    ]);
    startTransition(async () => {
      const res = await addApprovalCommentAction(approvalId, body);
      if ("error" in res) {
        setError(res.error as string);
        setOptimisticComments(null);
        router.refresh();
      } else {
        setOptimisticComments(null);
        router.refresh();
      }
    });
  };

  const openConfirmDialog = (decision: "approved" | "rejected") => {
    setConfirmDecision(decision);
    setConfirmComment("");
  };

  if (!commentsMode) {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {(status === "draft" || status === "needs_changes") && (
          <Button variant="ghost" size="sm" onClick={() => router.push(`/budgets/${budgetId}/edit`)}>
            <Edit size={13} /> Edit
          </Button>
        )}
        {canSubmit && (
          <Button size="sm" disabled={pending} onClick={handleSubmit}>
            <Send size={13} /> Submit for Review
          </Button>
        )}
        {canApprove && !showRejectForm && !confirmDecision && (
          <>
            <Button variant="danger" size="sm" disabled={pending} onClick={() => setShowRejectForm(true)}>
              <XCircle size={13} /> Request Changes
            </Button>
            <Button size="sm" disabled={pending} onClick={() => openConfirmDialog("approved")}>
              <CheckCircle2 size={13} /> Approve
            </Button>
          </>
        )}

        {confirmDecision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Budget decision confirmation">
            <div ref={dialogRef} className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl w-full max-w-sm p-5 space-y-4">
              <div>
                <p className="text-[14px] font-semibold">
                  {confirmDecision === "approved" ? "Approve Budget" : "Reject Budget"}
                </p>
                <p className="text-[12px] text-(--muted) mt-0.5">
                  {confirmDecision === "approved"
                    ? "This will mark the budget as approved."
                    : "This will reject the budget."}
                </p>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5">
                  Comment <span className="text-(--muted) font-normal">(optional)</span>
                </label>
                <textarea
                  value={confirmComment}
                  onChange={(e) => setConfirmComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full bg-(--surface) border border-(--border) rounded-(--r-input) px-3 py-2 text-[13px] outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setConfirmDecision(null); setConfirmComment(""); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant={confirmDecision === "rejected" ? "danger" : "primary"}
                  disabled={pending}
                  onClick={() => handleReview(confirmDecision, confirmComment || undefined)}
                >
                  {confirmDecision === "approved" ? "Confirm Approve" : "Confirm Reject"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showRejectForm && (
          <div className="flex items-center gap-2 mt-2 w-full">
            <input
              type="text"
              placeholder="Reason for requesting changes…"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="flex-1 px-3 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted)"
            />
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => setShowRejectForm(false)}>Cancel</Button>
            <Button variant="danger" size="sm" disabled={pending} onClick={() => handleReview("needs_changes", rejectComment)}>
              Confirm
            </Button>
          </div>
        )}
        {error && <p className="text-[12px] text-danger w-full">{error}</p>}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <p className="text-[14px] font-medium">Comments</p>
          <p className="text-[12px] text-(--muted)">{displayComments.length} comments</p>
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {displayComments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-(--primary) shrink-0 mt-0.5">
              {getInitials(c.authorId)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {c.id.startsWith("optimistic-") && (
                  <span className="text-[10px] text-(--muted) italic">Sending…</span>
                )}
                <span className="text-[11px] text-(--muted) ml-auto">{formatRelative(c.createdAt)}</span>
              </div>
              <p className="text-[13px] text-(--text) leading-relaxed bg-(--bg) border border-(--border) rounded-[10px] px-3.5 py-2.5">
                {c.body}
              </p>
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-(--primary) shrink-0 mt-0.5">
            {currentUserInitials}
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Add a comment…"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-(--surface) border border-(--border) rounded-[10px] px-3.5 py-2.5 text-[13px] text-(--text) placeholder:text-(--muted) outline-none focus:border-(--primary) transition-colors resize-none"
            />
            {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
            <div className="flex justify-end mt-2">
              <Button size="sm" disabled={pending || !comment.trim() || !approvalId} onClick={handleComment}>
                <MessageSquare size={12} /> Post Comment
              </Button>
            </div>
            {!approvalId && (
              <p className="text-[11px] text-(--muted) mt-1">Comments require an active approval record.</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
