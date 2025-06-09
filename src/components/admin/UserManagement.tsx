
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Crown, Shield, Trash2, Users } from "lucide-react";
import { AddUserModal } from "./AddUserModal";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/loading-skeleton";

interface UserManagementProps {
  members: any[];
  isLoading: boolean;
  refetch: () => void;
}

export function UserManagement({ members, isLoading, refetch }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If no members data, show loading or empty state
  const actualMembers = Array.isArray(members) ? members : [];

  const filteredMembers = actualMembers.filter(member => {
    const matchesSearch = member.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.roles?.includes(roleFilter);
    const matchesPremium = premiumFilter === "all" || 
      (premiumFilter === "premium" && member.is_premium) ||
      (premiumFilter === "free" && !member.is_premium);
    
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
      
      toast({ 
        title: "Success", 
        description: "User promoted to premium.",
        variant: "default"
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    } catch (error: any) {
      toast({ 
        title: "Upgrade failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleRevokePremium = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ is_premium: false })
        .eq("user_id", targetUserId);
      
      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: "Premium access revoked.",
        variant: "default"
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    } catch (error: any) {
      toast({ 
        title: "Revoke failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: string) => {
    try {
      // First remove existing roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId);

      // Then add new role
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: targetUserId,
          role: newRole as any,
        });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `User role updated to ${newRole}.`,
        variant: "default"
      });
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Role update failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleRemoveUser = async (targetUserId: string) => {
    if (!window.confirm(`Are you sure you want to remove this user (${targetUserId})? This will delete all their data.`)) {
      return;
    }

    setRemovingId(targetUserId);
    try {
      // Remove user data in order
      await supabase.from("user_roles").delete().eq("user_id", targetUserId);
      await supabase.from("subscriptions").delete().eq("user_id", targetUserId);
      await supabase.from("resumes").delete().eq("user_id", targetUserId);

      toast({ 
        title: "User data removed", 
        description: "Data for user has been deleted from app database.",
        variant: "default"
      });
      refetch();
      queryClient.invalidateQueries();
    } catch (error: any) {
      toast({
        title: "Remove failed",
        description: error.message || "Error removing user",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Users className="w-6 h-6 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-600 mt-2">
            Manage users, roles, and premium memberships ({actualMembers.length} users found)
          </p>
        </div>
        <AddUserModal refetch={refetch} />
      </div>

      {/* Enhanced Filters */}
      <div className="flex gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-blue-50/80 border border-gray-200/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px] border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-white/95 border border-white/20">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={premiumFilter} onValueChange={setPremiumFilter}>
          <SelectTrigger className="w-[140px] border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm">
            <SelectValue placeholder="Premium" />
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-white/95 border border-white/20">
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Users Table */}
      <div className="border border-gray-200/50 rounded-xl overflow-hidden backdrop-blur-sm bg-white/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200/50">
              <TableHead className="font-semibold text-gray-700">User ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Roles</TableHead>
              <TableHead className="font-semibold text-gray-700">Premium</TableHead>
              <TableHead className="font-semibold text-gray-700">Resumes</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium">
                      {actualMembers.length === 0 ? "No users found in the system" : "No users match your filters"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.user_id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-mono text-xs bg-gray-100/50 rounded p-2">
                    {member.user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {member.roles?.map((role: string) => (
                        <Badge 
                          key={role} 
                          variant={role === 'admin' ? 'destructive' : 'secondary'}
                          className="shadow-sm"
                        >
                          {role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {role}
                        </Badge>
                      )) || <Badge variant="outline" className="shadow-sm">user</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.is_premium ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shadow-sm">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-gray-700">
                      {member.resume_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!member.is_premium ? (
                        <Button 
                          size="sm" 
                          onClick={() => handlePromoteToPremium(member.user_id)}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Make Premium
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRevokePremium(member.user_id)}
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        >
                          Revoke Premium
                        </Button>
                      )}
                      <Select onValueChange={(role) => handleChangeRole(member.user_id, role)}>
                        <SelectTrigger className="w-[100px] border-gray-200 focus:border-blue-500">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="backdrop-blur-xl bg-white/95 border border-white/20">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={removingId === member.user_id}
                        onClick={() => handleRemoveUser(member.user_id)}
                        className="shadow-lg hover:shadow-xl transition-all duration-300"
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
    </GlassCard>
  );
}
