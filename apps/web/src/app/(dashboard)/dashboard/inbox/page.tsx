"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Paperclip, ArrowLeft } from "lucide-react";

/* ─── E.15 — Messagerie ──────────────────────────────────────────
   Split layout: conversation list (left) + active thread (right)
   Mobile: full-width list, push to thread view
   ─────────────────────────────────────────────────────────────── */

interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    avatarInitials: string;
    context?: string;
}

// Placeholder data — will come from API
const conversations: Conversation[] = [];

function ConversationItem({
    convo,
    active,
    onClick,
}: {
    convo: Conversation;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 border-b border-border transition-colors",
                active
                    ? "bg-[hsl(var(--color-teal-50))]"
                    : "hover:bg-[hsl(var(--color-cream))]",
            )}
        >
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[hsl(var(--color-teal-100))] flex items-center justify-center shrink-0 text-sm font-semibold text-[hsl(var(--color-teal-700))]">
                    {convo.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm truncate", convo.unread && "font-semibold")}>
                            {convo.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{convo.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
                    {convo.unread && (
                        <Badge variant="info" className="mt-1 text-[10px] px-1.5 py-0">
                            Nouveau
                        </Badge>
                    )}
                </div>
            </div>
        </button>
    );
}

export default function InboxPage() {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [mobileView, setMobileView] = React.useState<"list" | "thread">("list");
    const [message, setMessage] = React.useState("");

    const activeConvo = conversations.find((c) => c.id === activeId);

    const selectConvo = (id: string) => {
        setActiveId(id);
        setMobileView("thread");
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <header className="space-y-1.5">
                <p className="text-overline uppercase tracking-widest text-muted-foreground">Messages</p>
                <h1 className="font-display text-heading-xl tracking-tight">Messagerie</h1>
            </header>

            {conversations.length === 0 ? (
                <EmptyState
                    icon={MessageSquare}
                    title="Aucune conversation"
                    description="Vos échanges avec les établissements et freelances apparaîtront ici."
                    tips="Les conversations sont créées automatiquement lors des candidatures et réservations."
                />
            ) : (
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden min-h-[500px] flex">
                    {/* Left — Conversation list */}
                    <div
                        className={cn(
                            "w-full md:w-80 md:border-r border-border shrink-0 overflow-y-auto",
                            mobileView === "thread" && "hidden md:block",
                        )}
                    >
                        {conversations.map((c) => (
                            <ConversationItem
                                key={c.id}
                                convo={c}
                                active={c.id === activeId}
                                onClick={() => selectConvo(c.id)}
                            />
                        ))}
                    </div>

                    {/* Right — Thread */}
                    <div
                        className={cn(
                            "flex-1 flex flex-col",
                            mobileView === "list" && "hidden md:flex",
                        )}
                    >
                        {activeConvo ? (
                            <>
                                {/* Thread header */}
                                <div className="p-4 border-b border-border flex items-center gap-3">
                                    <button
                                        onClick={() => setMobileView("list")}
                                        className="md:hidden p-1"
                                        aria-label="Retour"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <p className="text-sm font-semibold">{activeConvo.name}</p>
                                        {activeConvo.context && (
                                            <p className="text-xs text-muted-foreground">{activeConvo.context}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Messages area */}
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <p className="text-center text-xs text-muted-foreground py-8">
                                        Début de la conversation
                                    </p>
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-border">
                                    <div className="flex items-end gap-2">
                                        <button
                                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label="Joindre un fichier"
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </button>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Votre message…"
                                            rows={1}
                                            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--teal))] resize-none"
                                        />
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-10 w-10 p-0"
                                            disabled={!message.trim()}
                                            aria-label="Envoyer"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-sm">
                                Sélectionnez une conversation
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
