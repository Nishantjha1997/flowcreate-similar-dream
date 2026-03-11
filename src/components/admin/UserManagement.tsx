
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Crown, Shield, Trash2, Users, Mail } from "lucide-react";
import { AddUserModal } from "./AddUserModal";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { format } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
  status: string;
  roles?: string[];
  isPremium?: boolean;
  avatarUrl?: string | null;
}

interface UserManagementProps {
  members: any[];
  userProfiles: UserProfile[];
  isLoading: boolean;
  refetch: () => void;
}

export function UserManagement({ members, userProfiles, isLoading, refetch }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use userProfiles (from edge function with full auth data) as primary source
  const users = userProfiles.length > 0 ? userProfiles : [];

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = user.email.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === "all" || user.roles?.includes(roleFilter);
    const matchesPremium = premiumFilter === "all" || 
      (premiumFilter === "premium" && user.isPremium) ||
      (premiumFilter === "free" && !user.isPremium);
    
    return matchesSearch && matchesRole && matchesPremium;
  });

  const handlePromoteToPremium = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: targetUserId,
          is_premium: true,
        }, { onConflict: "user_id" });
      
      if (error) throw error;
      
      toast({ title: "Success", description: "User promoted to premium." });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
    } catch (error: any) {
      toast({ title: "Upgrade failed", description: error.message, variant: "destructive" });
    }
  };

  const handleRevokePremium = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ is_premium: false })
        .eq("user_id", targetUserId);
      
      if (error) throw error;
      
      toast({ title: "Success", description: "Premium access revoked." });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
    } catch (error: any) {
      toast({ title: "Revoke failed", description: error.message, variant: "destructive" });
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: string) => {
    try {
      await supabase.from("user_roles").delete().eq("user_id", targetUserId);
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role: newRole as any });
      if (error) throw error;

      toast({ title: "Success", description: `User role updated to ${newRole}.` });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
    } catch (error: any) {
      toast({ title: "Role update failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setRemovingId(deleteTarget.id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { targetUserId: deleteTarget.id }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "User deleted", description: `${deleteTarget.email} has been permanently removed.` });
      setDeleteTarget(null);
      refetch();
      queryClient.invalidateQueries();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and premium memberships ({users.length} users found)
          </p>
        </div>
        <AddUserModal refetch={refetch} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={premiumFilter} onValueChange={setPremiumFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Premium" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Roles</TableHead>
              <TableHead className="font-semibold">Premium</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="font-semibold">Last Sign In</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Users className="w-12 h-12 opacity-50" />
                    <p className="text-lg font-medium">
                      {users.length === 0 ? "No users found" : "No users match your filters"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                      {user.emailConfirmed && (
                        <Badge variant="outline" className="text-xs ml-1 border-green-500 text-green-600">verified</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.roles && user.roles.length > 0 ? user.roles.map((role: string) => (
                        <Badge 
                          key={role} 
                          variant={role === 'admin' ? 'destructive' : 'secondary'}
                        >
                          {role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {role}
                        </Badge>
                      )) : <Badge variant="outline">user</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isPremium ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastSignIn ? format(new Date(user.lastSignIn), "MMM d, yyyy HH:mm") : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      {!user.isPremium ? (
                        <Button size="sm" variant="outline" onClick={() => handlePromoteToPremium(user.id)}>
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleRevokePremium(user.id)}>
                          Revoke
                        </Button>
                      )}
                      <Select onValueChange={(role) => handleChangeRole(user.id, role)}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={removingId === user.id}
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.email}</strong> and all their data 
              (resumes, profiles, subscriptions, roles, org memberships). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removingId ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GlassCard>
  );
}
