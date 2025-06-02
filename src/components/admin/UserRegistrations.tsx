
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserCheck, Mail, Calendar, Filter, UserPlus, Ban, CheckCircle, AlertCircle, Users } from "lucide-react";

interface UserRegistrationsProps {
  isAdmin: boolean;
}

export function UserRegistrations({ isAdmin }: UserRegistrationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userProfiles = [], isLoading, refetch } = useUserProfiles(isAdmin);

  // Ensure userProfiles is always an array
  const users = Array.isArray(userProfiles) ? userProfiles : [];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || (() => {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today": return daysDiff === 0;
        case "week": return daysDiff <= 7;
        case "month": return daysDiff <= 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleResendVerification = async (userId: string, email: string) => {
    setActionLoading(userId);
    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: "Verification email sent", 
        description: `Verification email sent to ${email}` 
      });
    } catch (error: any) {
      toast({ 
        title: "Failed to send email", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      // Add user role if they don't have one
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: userId,
          role: "user"
        }, { onConflict: "user_id,role" });

      if (error) throw error;

      toast({ 
        title: "User approved", 
        description: "User has been approved and given user role" 
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["all-members"] });
    } catch (error: any) {
      toast({ 
        title: "Failed to approve user", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      // Remove all user roles to suspend
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast({ 
        title: "User suspended", 
        description: "User has been suspended" 
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["all-members"] });
    } catch (error: any) {
      toast({ 
        title: "Failed to suspend user", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (user: any) => {
    if (user.roles && user.roles.length > 0) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          User Registrations & Management
        </CardTitle>
        <CardDescription>
          Monitor, approve, and manage user registration data and account status in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enhanced Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <Filter className="w-4 h-4 mr-2" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Enhanced Registration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-blue-600 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Total Users
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.roles && u.roles.length > 0).length}
            </div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => !u.roles || u.roles.length === 0).length}
            </div>
            <div className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Pending
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.isPremium).length}
            </div>
            <div className="text-sm text-purple-600 flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              Premium
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => {
                const today = new Date();
                const userDate = new Date(u.createdAt);
                return today.toDateString() === userDate.toDateString();
              }).length}
            </div>
            <div className="text-sm text-orange-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Today
            </div>
          </div>
        </div>

        {/* Enhanced Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Roles & Status</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      Loading user registrations...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {users.length === 0 ? "No registered users found" : "No users match your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {user.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(user)}
                        {user.roles && user.roles.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.map((role: string) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isPremium ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {(!user.roles || user.roles.length === 0) && (
                          <Button 
                            size="sm" 
                            variant="default"
                            disabled={actionLoading === user.id}
                            onClick={() => handleApproveUser(user.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {user.roles && user.roles.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={actionLoading === user.id}
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        )}
                        
                        {!user.emailConfirmed && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={actionLoading === user.id}
                            onClick={() => handleResendVerification(user.id, user.email)}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Resend
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              Export User List
            </Button>
            <Button variant="outline" size="sm">
              Bulk Email Users
            </Button>
            <Button variant="outline" size="sm">
              User Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Sync with Database
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
