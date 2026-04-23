"use client";

import { useMemo, useState } from "react";
import { type ContactBypassEventRow } from "@/app/actions/admin";
import { DataTableShell } from "@/components/data/DataTableShell";
import { FilterBar, type FilterDefinition } from "@/components/data/FilterBar";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

type ContactBypassEventsTableProps = {
  events: ContactBypassEventRow[];
};

type DateFilter = "ALL" | "TODAY" | "7D" | "30D";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const FILTERS: FilterDefinition[] = [
  {
    key: "date",
    label: "Toutes dates",
    options: [
      { label: "Aujourd’hui", value: "TODAY" },
      { label: "7 derniers jours", value: "7D" },
      { label: "30 derniers jours", value: "30D" },
    ],
  },
  {
    key: "blockedReason",
    label: "Toutes raisons",
    options: [
      { label: "Email", value: "EMAIL" },
      { label: "Téléphone", value: "PHONE" },
      { label: "WhatsApp", value: "WHATSAPP" },
      { label: "Telegram", value: "TELEGRAM" },
      { label: "URL externe", value: "EXTERNAL_URL" },
    ],
  },
];

function getBlockedReasonMeta(reason: ContactBypassEventRow["blockedReason"]) {
  if (reason === "EMAIL") return { label: "Email", variant: "default" as const };
  if (reason === "PHONE") return { label: "Téléphone", variant: "secondary" as const };
  if (reason === "WHATSAPP") return { label: "WhatsApp", variant: "warning" as const };
  if (reason === "TELEGRAM") return { label: "Telegram", variant: "outline" as const };
  return { label: "URL externe", variant: "coral" as const };
}

function matchesDateFilter(createdAt: string, dateFilter: DateFilter) {
  if (dateFilter === "ALL") {
    return true;
  }

  const createdAtDate = new Date(createdAt);
  const now = new Date();

  if (dateFilter === "TODAY") {
    return createdAtDate.toDateString() === now.toDateString();
  }

  const diffMs = now.getTime() - createdAtDate.getTime();
  const maxDays = dateFilter === "7D" ? 7 : 30;
  return diffMs <= maxDays * 24 * 60 * 60 * 1000;
}

export function ContactBypassEventsTable({ events }: ContactBypassEventsTableProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [reasonFilter, setReasonFilter] = useState<"ALL" | ContactBypassEventRow["blockedReason"]>("ALL");
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return events.filter((event) => {
      if (!matchesDateFilter(event.createdAt, dateFilter)) {
        return false;
      }

      if (reasonFilter !== "ALL" && event.blockedReason !== reasonFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${event.sender.name} ${event.sender.email}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [dateFilter, events, reasonFilter, search]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "date") {
      setDateFilter(value as DateFilter);
    }

    if (key === "blockedReason") {
      setReasonFilter(value as "ALL" | ContactBypassEventRow["blockedReason"]);
    }
  };

  const handleReset = () => {
    setDateFilter("ALL");
    setReasonFilter("ALL");
    setSearch("");
  };

  return (
    <DataTableShell
      columns={["Date", "Raison", "Expéditeur", "Extrait", "Conversation"]}
      emptyTitle="Aucun contournement détecté"
      emptyDescription="Les tentatives bloquées apparaîtront ici."
      filterSlot={
        <FilterBar
          filters={FILTERS}
          activeFilters={{ date: dateFilter, blockedReason: reasonFilter }}
          onFilterChange={handleFilterChange}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un expéditeur…"
          onReset={handleReset}
        />
      }
    >
      {filteredEvents.map((event) => {
        const reason = getBlockedReasonMeta(event.blockedReason);

        return (
          <TableRow key={event.id}>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {dateFormatter.format(new Date(event.createdAt))}
            </TableCell>
            <TableCell>
              <Badge variant={reason.variant}>{reason.label}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px]">
              <p className="font-medium text-foreground">{event.sender.name}</p>
              <p className="truncate text-xs text-muted-foreground">{event.sender.email}</p>
            </TableCell>
            <TableCell className="max-w-[420px]">
              <p className="line-clamp-2 text-sm text-foreground">{event.rawExcerpt}</p>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {event.conversationId ?? "—"}
            </TableCell>
          </TableRow>
        );
      })}
    </DataTableShell>
  );
}
