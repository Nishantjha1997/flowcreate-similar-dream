
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Crown, Shield, Trash2 } from "lucide-react";
import { AddUserModal } from "./AddUserModal";

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
      
      toast({ title: "Success", description: "User promoted to premium." });
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
      
      toast({ title: "Success", description: "Premium access revoked." });
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

      toast({ title: "Success", description: `User role updated to ${newRole}.` });
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

      toast({ title: "User data removed", description: "Data for user has been deleted from app database." });
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage users, roles, and premium memberships ({actualMembers.length} users found)
            </CardDescription>
          </div>
          <AddUserModal refetch={refetch} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={premiumFilter} onValueChange={setPremiumFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Premium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Resumes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {actualMembers.length === 0 ? "No users found in the system" : "No users match your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-mono text-xs">
                      {member.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {member.roles?.map((role: string) => (
                          <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
                            {role}
                          </Badge>
                        )) || <Badge variant="outline">user</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.is_premium ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>{member.resume_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!member.is_premium ? (
                          <Button 
                            size="sm" 
                            onClick={() => handlePromoteToPremium(member.user_id)}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Make Premium
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRevokePremium(member.user_id)}
                          >
                            Revoke Premium
                          </Button>
                        )}
                        <Select onValueChange={(role) => handleChangeRole(member.user_id, role)}>
                          <SelectTrigger className="w-[100px]">
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
                          disabled={removingId === member.user_id}
                          onClick={() => handleRemoveUser(member.user_id)}
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
      </CardContent>
    </Card>
  );
}
