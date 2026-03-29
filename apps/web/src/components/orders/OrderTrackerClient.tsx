"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CircleDot,
  MapPin,
  CalendarDays,
  MessageSquare,
  Plus,
  Star,
  Download,
} from "lucide-react";
import Link from "next/link";
import type {
  OrderTrackerData,
  OrderQuote,
  TimelineEvent,
  OrderMessage,
} from "@/app/actions/orders";
import {
  sendOrderMessage,
  acceptQuote,
  rejectQuote,
} from "@/app/actions/orders";
import { QuoteCard } from "./QuoteCard";
import { QuoteFormModal } from "./QuoteFormModal";
import { ReviewModal } from "@/components/modals/ReviewModal";
import { createReview } from "@/app/actions/reviews";
import { useOrderSSE, type OrderSSEEvent } from "@/lib/hooks/useOrderSSE";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const REVIEWABLE_STATUSES = new Set(["COMPLETED", "AWAITING_PAYMENT", "PAID"]);

// ── Status config ──

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" | "teal" | "quiet" }> = {
  PENDING: { label: "En attente", variant: "warning" },
  QUOTE_SENT: { label: "Devis envoyé", variant: "info" },
  QUOTE_ACCEPTED: { label: "Devis accepté", variant: "teal" },
  CONFIRMED: { label: "Confirmé", variant: "success" },
  IN_PROGRESS: { label: "En cours", variant: "info" },
  COMPLETED: { label: "Terminé", variant: "quiet" },
  AWAITING_PAYMENT: { label: "En attente de paiement", variant: "warning" },
  PAID: { label: "Payé", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "error" },
};

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  CREATED: <CircleDot className="h-4 w-4" />,
  QUOTE_SENT: <FileText className="h-4 w-4" />,
  QUOTE_ACCEPTED: <CheckCircle2 className="h-4 w-4" />,
  QUOTE_REJECTED: <XCircle className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  IN_PROGRESS: <Clock className="h-4 w-4" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  INVOICE_GENERATED: <FileText className="h-4 w-4" />,
  PAID: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  REVIEW_SUBMITTED: <Star className="h-4 w-4" />,
};

// ── Props ──

type OrderTrackerClientProps = {
  data: OrderTrackerData;
  currentUserId: string;
  currentUserRole: "FREELANCE" | "ESTABLISHMENT";
  apiToken: string;
};

// ── Component ──

export function OrderTrackerClient({
  data: initialData,
  currentUserId,
  currentUserRole,
  apiToken,
}: OrderTrackerClientProps) {
  const [data, setData] = useState(initialData);
  const [draft, setDraft] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { booking, mission, service, freelance, establishment, conversation, quotes, timeline, invoice, review } = data;

  // SSE — real-time updates
  const handleSSE = useCallback((event: OrderSSEEvent) => {
    if (event.type === "MESSAGE_NEW") {
      // Refresh the page data to get the new message
      window.location.reload();
    }
    if (event.type === "QUOTE_SENT" || event.type === "QUOTE_ACCEPTED" || event.type === "QUOTE_REJECTED" || event.type === "STATUS_CHANGE") {
      window.location.reload();
    }
  }, []);

  useOrderSSE({
    bookingId: booking.id,
    token: apiToken,
    onEvent: handleSSE,
  });

  const counterpart = currentUserRole === "FREELANCE" ? establishment : freelance;
  const title = mission?.title ?? service?.title ?? "Commande";
  const statusConfig = STATUS_MAP[booking.status] ?? { label: booking.status, variant: "quiet" as const };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  // ── Handlers ──

  function handleSendMessage() {
    if (!draft.trim() || !counterpart.id) return;
    const content = draft;
    setDraft("");
    startTransition(async () => {
      const result = await sendOrderMessage(counterpart.id, content, booking.id);
      if (result.error) {
        setDraft(content);
        return;
      }
      // Optimistic: append message locally
      setData((prev) => ({
        ...prev,
        conversation: prev.conversation
          ? {
              ...prev.conversation,
              messages: [
                ...prev.conversation.messages,
                {
                  id: `temp-${Date.now()}`,
                  content,
                  senderId: currentUserId,
                  type: "USER",
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : {
              id: "temp-conv",
              messages: [
                {
                  id: `temp-${Date.now()}`,
                  content,
                  senderId: currentUserId,
                  type: "USER",
                  createdAt: new Date().toISOString(),
                },
              ],
            },
      }));
    });
  }

  function handleAcceptQuote(quoteId: string) {
    startTransition(async () => {
      const result = await acceptQuote(quoteId, booking.id);
      if (!result.error) {
        setData((prev) => ({
          ...prev,
          booking: { ...prev.booking, status: "QUOTE_ACCEPTED" },
          quotes: prev.quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "ACCEPTED", acceptedAt: new Date().toISOString() } : q,
          ),
        }));
      }
    });
  }

  function handleRejectQuote(quoteId: string) {
    startTransition(async () => {
      const result = await rejectQuote(quoteId, booking.id);
      if (!result.error) {
        setData((prev) => ({
          ...prev,
          booking: { ...prev.booking, status: "PENDING" },
          quotes: prev.quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "REJECTED", rejectedAt: new Date().toISOString() } : q,
          ),
        }));
      }
    });
  }

  // ── Render helpers ──

  function renderTimeline() {
    return (
      <div className="space-y-0">
        {timeline.map((event, idx) => (
          <div key={event.id} className="flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  idx === timeline.length - 1
                    ? "bg-[hsl(var(--color-teal-500))] text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {TIMELINE_ICONS[event.type] ?? <CircleDot className="h-4 w-4" />}
              </div>
              {idx < timeline.length - 1 && (
                <div className="w-px flex-1 bg-border min-h-[24px]" />
              )}
            </div>
            {/* Content */}
            <div className="pb-4 pt-1">
              <p className="text-sm font-medium leading-tight">{event.label}</p>
              {event.actor && (
                <p className="text-xs text-muted-foreground">{event.actor.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.timestamp), "dd MMM yyyy · HH:mm", { locale: fr })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderActionPanel() {
    const actions: React.ReactNode[] = [];

    if (currentUserRole === "FREELANCE" && (booking.status === "PENDING" || booking.status === "QUOTE_SENT")) {
      actions.push(
        <Button
          key="create-quote"
          onClick={() => setShowQuoteForm(true)}
          className="w-full bg-[hsl(var(--color-teal-500))] hover:bg-[hsl(var(--color-teal-600))] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {booking.status === "QUOTE_SENT" ? "Réviser le devis" : "Envoyer un devis"}
        </Button>,
      );
    }

    // Review CTA for completed orders
    if (REVIEWABLE_STATUSES.has(booking.status) && !review) {
      actions.push(
        <Button
          key="leave-review"
          onClick={() => setShowReviewModal(true)}
          className="w-full bg-[hsl(var(--coral))] hover:bg-[hsl(var(--coral))]/90 text-white"
        >
          <Star className="mr-2 h-4 w-4" />
          Laisser un avis
        </Button>,
      );
    }

    // Invoice download
    if (invoice) {
      actions.push(
        <Button
          key="download-invoice"
          variant="outline"
          className="w-full"
          onClick={async () => {
            try {
              const resp = await fetch(`${API_BASE}/invoices/${encodeURIComponent(invoice.id)}/download`, {
                headers: { Authorization: `Bearer ${apiToken}` },
              });
              if (!resp.ok) return;
              const blob = await resp.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              a.download = `facture-${invoice.invoiceNumber ?? invoice.id.substring(0, 8)}.pdf`;
              a.click();
              URL.revokeObjectURL(blobUrl);
            } catch { /* ignore */ }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger la facture
        </Button>,
      );
    }

    if (actions.length === 0) return null;

    return <div className="space-y-2">{actions}</div>;
  }

  function renderInfoPanel() {
    return (
      <div className="space-y-3">
        {mission && (
          <>
            <div className="flex items-start gap-2 text-sm">
              <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">
                  {format(new Date(mission.dateStart), "dd MMM yyyy", { locale: fr })}
                  {" — "}
                  {format(new Date(mission.dateEnd), "dd MMM yyyy", { locale: fr })}
                </p>
                {mission.shift && <p className="text-muted-foreground">{mission.shift}</p>}
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p>{mission.address}</p>
            </div>
          </>
        )}
        {service && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <p>{service.durationMinutes} min · {service.pricingType}</p>
          </div>
        )}
        <Separator />
        <div className="text-sm">
          <p className="font-medium">{counterpart.firstName ?? ""} {counterpart.lastName ?? ""}</p>
          {counterpart.companyName && <p className="text-muted-foreground">{counterpart.companyName}</p>}
          <p className="text-muted-foreground">{counterpart.email}</p>
        </div>
      </div>
    );
  }

  function renderMessages(messages: OrderMessage[]) {
    if (messages.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <MessageSquare className="mr-2 h-4 w-4" />
          Aucun message pour le moment
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          const isSystem = msg.type === "SYSTEM";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <p className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                  {msg.content}
                </p>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  isMine
                    ? "bg-[hsl(var(--color-teal-500))] text-white"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    isMine ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  function renderQuotes() {
    if (quotes.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Devis</h3>
        {quotes.map((q) => (
          <QuoteCard
            key={q.id}
            quote={q}
            currentUserRole={currentUserRole}
            onAccept={() => handleAcceptQuote(q.id)}
            onReject={() => handleRejectQuote(q.id)}
            isPending={isPending}
            apiToken={apiToken}
          />
        ))}
      </div>
    );
  }

  // ── Layout — Desktop: split, Mobile: tabs ──

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            <p className="text-xs text-muted-foreground">
              Commande du {format(new Date(booking.createdAt), "dd MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-[380px_1fr] md:gap-4 md:min-h-[calc(100vh-180px)]">
          {/* Left panel */}
          <div className="space-y-4 overflow-y-auto pr-2">
            {renderActionPanel()}
            {renderInfoPanel()}
            <Separator />
            {renderQuotes()}
            <Separator />
            <h3 className="text-sm font-semibold">Suivi</h3>
            {renderTimeline()}
          </div>

          {/* Right panel — conversation */}
          <div className="flex flex-col rounded-xl border bg-card">
            {/* Chat header */}
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Discussion</span>
            </div>
            {/* Messages */}
            {renderMessages(conversation?.messages ?? [])}
            {/* Composer */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <textarea
                  className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-teal-500))]"
                  placeholder="Votre message…"
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!draft.trim() || isPending}
                  onClick={handleSendMessage}
                  className="bg-[hsl(var(--color-teal-500))] hover:bg-[hsl(var(--color-teal-600))] text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile layout — tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="suivi">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suivi">Suivi</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            <TabsContent value="suivi" className="space-y-4 mt-4">
              {renderActionPanel()}
              {renderInfoPanel()}
              <Separator />
              {renderQuotes()}
              <Separator />
              <h3 className="text-sm font-semibold">Suivi</h3>
              {renderTimeline()}
            </TabsContent>
            <TabsContent value="discussion" className="mt-4">
              <div className="flex flex-col rounded-xl border bg-card min-h-[60vh]">
                {renderMessages(conversation?.messages ?? [])}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <textarea
                      className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-teal-500))]"
                      placeholder="Votre message…"
                      rows={1}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      disabled={!draft.trim() || isPending}
                      onClick={handleSendMessage}
                      className="bg-[hsl(var(--color-teal-500))] hover:bg-[hsl(var(--color-teal-600))] text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showQuoteForm && (
        <QuoteFormModal
          bookingId={booking.id}
          onClose={() => setShowQuoteForm(false)}
          onSuccess={() => {
            setShowQuoteForm(false);
            window.location.reload();
          }}
        />
      )}

      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        targetName={counterpart.firstName ? `${counterpart.firstName} ${counterpart.lastName ?? ""}`.trim() : counterpart.email}
        context={title}
        reviewerSide={currentUserRole === "ESTABLISHMENT" ? "establishment" : "freelance"}
        onSubmit={(reviewData) => {
          const roleType = currentUserRole === "ESTABLISHMENT"
            ? "ESTABLISHMENT_TO_FREELANCE" as const
            : "FREELANCE_TO_ESTABLISHMENT" as const;
          const comment = [reviewData.text.trim(), reviewData.tags.length > 0 ? `Tags: ${reviewData.tags.join(", ")}` : ""].filter(Boolean).join("\n\n") || undefined;

          startTransition(async () => {
            const result = await createReview({
              bookingId: booking.id,
              rating: reviewData.rating,
              comment,
              type: roleType,
            });
            if (!("error" in result)) {
              setShowReviewModal(false);
              window.location.reload();
            }
          });
        }}
      />
    </>
  );
}
