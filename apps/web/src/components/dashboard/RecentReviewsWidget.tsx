"use client";

import { ReviewCard } from "@/components/ui/review-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Star } from "lucide-react";

/* ─── E.6.6 — Recent Reviews Widget ─────────────────────────────
   Shows 1-2 compact Review Cards from the freelance's latest reviews.
   ─────────────────────────────────────────────────────────────── */

export interface RecentReview {
  id: string;
  authorName: string;
  authorRole?: string;
  authorOrg?: string;
  rating: number;
  text: string;
  context?: string;
}

interface RecentReviewsWidgetProps {
  reviews: RecentReview[];
}

export function RecentReviewsWidget({ reviews }: RecentReviewsWidgetProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Aucun avis reçu"
        description="Vos premiers avis apparaîtront ici après vos missions."
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.slice(0, 2).map((r) => (
        <ReviewCard
          key={r.id}
          variant="compact"
          authorName={r.authorName}
          authorRole={r.authorRole}
          authorOrg={r.authorOrg}
          rating={r.rating}
          text={r.text}
          context={r.context}
          maxLines={2}
        />
      ))}
    </div>
  );
}
