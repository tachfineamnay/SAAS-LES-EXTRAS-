"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MoreHorizontal, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  banUser,
  getAdminUserProfile,
  getAdminUsers,
  verifyUser,
  type AdminUserProfileDetails,
  type AdminUserRole,
  type AdminUserRow,
  type AdminUserStatus,
} from "@/app/actions/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusPill } from "@/components/ui/status-pill";
import { DataTableShell } from "@/components/data/DataTableShell";
import { FilterBar, type FilterDefinition } from "@/components/data/FilterBar";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type UsersTableProps = {
  initialUsers: AdminUserRow[];
};

type RoleFilter = AdminUserRole | "ALL";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const ROLE_FILTERS: FilterDefinition[] = [
  {
    key: "role",
    label: "Tous les rôles",
    options: [
      { label: "Établissement", value: "ESTABLISHMENT" },
      { label: "Freelance", value: "FREELANCE" },
      { label: "Admin", value: "ADMIN" },
    ],
  },
];

function getRoleBadgeVariant(role: AdminUserRole): "info" | "default" | "quiet" {
  if (role === "ESTABLISHMENT") return "info";
  if (role === "FREELANCE") return "default";
  return "quiet";
}

function getStatusKey(status: AdminUserStatus): "active" | "pending" | "cancelled" {
  if (status === "VERIFIED") return "active";
  if (status === "BANNED") return "cancelled";
  return "pending";
}

function getAvatarFallback(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("");
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [isLoadingUsers, startLoadingUsers] = useTransition();
  const [isActionPending, startAction] = useTransition();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<AdminUserProfileDetails | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const requestFilters = useMemo(
    () => ({
      search,
      role: roleFilter,
    }),
    [search, roleFilter],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startLoadingUsers(async () => {
        try {
          const nextUsers = await getAdminUsers(requestFilters);
          setUsers(nextUsers);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Impossible de charger les utilisateurs.");
        }
      });
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [requestFilters]);

  const refreshUsers = () => {
    startLoadingUsers(async () => {
      try {
        const nextUsers = await getAdminUsers(requestFilters);
        setUsers(nextUsers);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de charger les utilisateurs.");
      }
    });
  };

  const handleVerify = (userId: string) => {
    startAction(async () => {
      try {
        await verifyUser(userId);
        toast.success("Compte validé.");
        refreshUsers();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Validation impossible.");
      }
    });
  };

  const handleBan = (userId: string) => {
    startAction(async () => {
      try {
        await banUser(userId);
        toast.success("Compte suspendu.");
        refreshUsers();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Suspension impossible.");
      }
    });
  };

  const handleOpenProfile = (userId: string) => {
    setIsProfileOpen(true);
    setIsProfileLoading(true);
    setProfile(null);

    void getAdminUserProfile(userId)
      .then((nextProfile) => {
        setProfile(nextProfile);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Impossible de charger le profil.");
      })
      .finally(() => {
        setIsProfileLoading(false);
      });
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "role") setRoleFilter(value as RoleFilter);
  };

  const handleReset = () => {
    setSearch("");
    setRoleFilter("ALL");
  };

  return (
    <>
      <DataTableShell
        columns={["Nom", "Email", "Rôle", "Statut", "Inscription", "Actions"]}
        isLoading={isLoadingUsers}
        emptyTitle="Aucun utilisateur trouvé"
        emptyDescription="Essayez de modifier vos critères de recherche."
        filterSlot={
          <FilterBar
            filters={ROLE_FILTERS}
            activeFilters={{ role: roleFilter }}
            onFilterChange={handleFilterChange}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher par email…"
            onReset={handleReset}
          />
        }
      >
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium text-foreground">{user.name}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
            </TableCell>
            <TableCell>
              <StatusPill status={getStatusKey(user.status)} label={user.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {dateFormatter.format(new Date(user.createdAt))}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Actions utilisateur"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleOpenProfile(user.id)}>
                    Voir Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleVerify(user.id)}
                    disabled={isActionPending || user.status === "VERIFIED"}
                  >
                    Valider le compte
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBan(user.id)}
                    disabled={isActionPending || user.status === "BANNED"}
                    className="text-destructive focus:text-destructive"
                  >
                    Suspendre
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>Se connecter en tant que</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md glass-surface">
          <SheetHeader>
            <SheetTitle>Profil utilisateur</SheetTitle>
            <SheetDescription>Détails du compte sélectionné.</SheetDescription>
          </SheetHeader>

          {isProfileLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Chargement du profil…</p>
          ) : profile ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border/50">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {getAvatarFallback(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border border-border/50 bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Rôle</p>
                  <p className="font-medium text-foreground">{profile.role}</p>
                </div>
                <div className="rounded-md border border-border/50 bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <p className="font-medium text-foreground">{profile.status}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-md border border-border/50 bg-muted/50 px-3 py-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date d'inscription</p>
                  <p className="font-medium text-foreground">{dateFormatter.format(new Date(profile.createdAt))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fonction</p>
                  <p className="font-medium text-foreground">{profile.jobTitle ?? "Non renseignée"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bio</p>
                  <p className="text-sm text-foreground">{profile.bio ?? "Non renseignée"}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleVerify(profile.id)}
                  disabled={isActionPending || profile.status === "VERIFIED"}
                >
                  <UserRound className="h-4 w-4" />
                  Valider
                </Button>
                <Button
                  variant="danger-soft"
                  className="flex-1"
                  onClick={() => handleBan(profile.id)}
                  disabled={isActionPending || profile.status === "BANNED"}
                >
                  <Shield className="h-4 w-4" />
                  Suspendre
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Aucun profil sélectionné.</p>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
