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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UsersTableProps = {
  initialUsers: AdminUserRow[];
};

type RoleFilter = AdminUserRole | "ALL";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getRoleBadgeClass(role: AdminUserRole): string {
  if (role === "CLIENT") {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (role === "TALENT") {
    return "bg-violet-100 text-violet-700 hover:bg-violet-100";
  }

  return "bg-slate-200 text-slate-800 hover:bg-slate-200";
}

function getStatusBadgeClass(status: AdminUserStatus): string {
  if (status === "VERIFIED") {
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  }

  if (status === "BANNED") {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }

  return "bg-amber-100 text-amber-700 hover:bg-amber-100";
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

  const hasUsers = users.length > 0;

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

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Rechercher par email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            <SelectItem value="CLIENT">CLIENT</SelectItem>
            <SelectItem value="TALENT">TALENT</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasUsers ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  {isLoadingUsers ? "Chargement..." : "Aucun utilisateur trouvé."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeClass(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions utilisateur">
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
                          className="text-red-700 focus:text-red-700"
                        >
                          Suspendre
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>Se connecter en tant que</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Profil utilisateur</SheetTitle>
            <SheetDescription>Détails du compte sélectionné.</SheetDescription>
          </SheetHeader>

          {isProfileLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Chargement du profil...</p>
          ) : profile ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback>{getAvatarFallback(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border bg-slate-50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Rôle</p>
                  <p className="font-medium">{profile.role}</p>
                </div>
                <div className="rounded-md border bg-slate-50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <p className="font-medium">{profile.status}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-md border bg-slate-50 px-3 py-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date d'inscription</p>
                  <p className="font-medium">{dateFormatter.format(new Date(profile.createdAt))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fonction</p>
                  <p className="font-medium">{profile.jobTitle ?? "Non renseignée"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bio</p>
                  <p className="text-sm">{profile.bio ?? "Non renseignée"}</p>
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
                  variant="destructive"
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
    </section>
  );
}
