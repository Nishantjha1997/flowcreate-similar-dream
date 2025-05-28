
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Crown, Database, RefreshCw } from "lucide-react";

interface QuickActionsProps {
  refetch: () => void;
}

export function QuickActions({ refetch }: QuickActionsProps) {
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddUserRole = async () => {
    if (!newUserId.trim()) {
      toast({ title: "Error", description: "Please enter a user ID", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: newUserId,
          role: newUserRole as any,
        });

      if (error) throw error;

      toast({ title: "Success", description: `Role ${newUserRole} added to user.` });
      setNewUserId("");
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Failed to add role", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGrantPremiumToAll = async () => {
    if (!window.confirm("Are you sure you want to grant premium access to ALL users? This action cannot be undone easily.")) {
      return;
    }

    setIsProcessing(true);
    try {
      // Get all users first
      const { data: users, error: usersError } = await supabase
        .from("user_roles")
        .select("user_id");

      if (usersError) throw usersError;

      // Grant premium to all users
      const premiumPromises = users.map(user => 
        supabase
          .from("subscriptions")
          .upsert({
            user_id: user.user_id,
            is_premium: true,
          }, { onConflict: "user_id" })
      );

      await Promise.all(premiumPromises);

      toast({ title: "Success", description: "Premium access granted to all users." });
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Bulk update failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add User Role
          </CardTitle>
          <CardDescription>
            Assign a role to a specific user ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="User ID (UUID)"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            />
            <Select value={newUserRole} onValueChange={setNewUserRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddUserRole} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Adding..." : "Add Role"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Bulk Actions
          </CardTitle>
          <CardDescription>
            Perform actions on multiple users at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleGrantPremiumToAll}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Grant Premium to All Users
            </Button>
            <Button 
              onClick={refetch}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
