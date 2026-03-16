"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildConversationView,
  ensureSystemSeedMessage,
  getConversationMessages,
  markConversationRead,
  sendConversationMessage,
  type MessagingConversation,
  type MessagingConversationSeed,
  type MessagingMessage,
} from "@/lib/messaging-v1";
import { messagingQueryKeys } from "@/lib/messaging-query-keys";

type UseMessagingV1Input = {
  currentUserId: string;
  currentUserRole: "FREELANCE" | "ESTABLISHMENT";
  conversationSeeds: MessagingConversationSeed[];
  pollingMs?: number;
};

export function useMessagingV1({
  currentUserId,
  currentUserRole,
  conversationSeeds,
  pollingMs = 10000,
}: UseMessagingV1Input) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<MessagingConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessagingMessage[]>([]);

  const queryKey = useMemo(() => messagingQueryKeys.conversations(), []);

  const refetchConversations = useCallback(() => {
    try {
      const nextConversations = buildConversationView(conversationSeeds, currentUserId);
      setConversations(nextConversations);
      setError(null);
    } catch {
      setError("Impossible de charger les conversations.");
    }
  }, [conversationSeeds, currentUserId]);

  const refetchMessages = useCallback(
    (conversationId: string) => {
      try {
        const messageQueryKey = messagingQueryKeys.messages(conversationId);
        if (!messageQueryKey.length) {
          setError("Impossible de charger les messages.");
          return;
        }
        const nextMessages = markConversationRead(conversationId, currentUserId);
        setThreadMessages(nextMessages);
        refetchConversations();
        setError(null);
      } catch {
        setError("Impossible de charger les messages.");
      }
    },
    [currentUserId, refetchConversations],
  );

  const selectConversation = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      refetchMessages(conversationId);
    },
    [refetchMessages],
  );

  const sendMessage = useCallback(
    (content: string) => {
      const activeId = activeConversationId;
      if (!activeId) return { ok: false as const, error: "Conversation manquante." };
      if (!content.trim()) return { ok: false as const, error: "Message vide." };

      try {
        sendConversationMessage({
          conversationId: activeId,
          senderId: currentUserId,
          senderRole: currentUserRole,
          content,
        });
        const updated = getConversationMessages(activeId);
        setThreadMessages(updated);
        refetchConversations();
        setError(null);
        return { ok: true as const };
      } catch {
        setError("Impossible d'envoyer le message.");
        return { ok: false as const, error: "Impossible d'envoyer le message." };
      }
    },
    [activeConversationId, currentUserId, currentUserRole, refetchConversations],
  );

  useEffect(() => {
    setIsLoading(true);
    try {
      conversationSeeds.forEach((seed) => {
        if (seed.source === "BOOKING") {
          ensureSystemSeedMessage(seed.id, "un renfort ou atelier");
        }
      });
      const nextConversations = buildConversationView(conversationSeeds, currentUserId);
      setConversations(nextConversations);

      if (!activeConversationId && nextConversations.length > 0) {
        const firstId = nextConversations[0].id;
        setActiveConversationId(firstId);
        setThreadMessages(markConversationRead(firstId, currentUserId));
      }
      setError(null);
    } catch {
      setError("Impossible d'initialiser la messagerie.");
    } finally {
      setIsLoading(false);
    }
  }, [conversationSeeds, currentUserId, activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;
    const timer = window.setInterval(() => {
      refetchMessages(activeConversationId);
    }, pollingMs);
    return () => window.clearInterval(timer);
  }, [activeConversationId, pollingMs, refetchMessages]);

  return {
    queryKey,
    conversations,
    activeConversationId,
    threadMessages,
    isLoading,
    error,
    setError,
    selectConversation,
    sendMessage,
    refetchConversations,
    refetchMessages,
  };
}
