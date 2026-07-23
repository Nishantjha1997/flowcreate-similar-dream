
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
    if (!window.confirm("Grant Pro Monthly (100 AI actions / 30 days) to ALL users? This action cannot be undone easily.")) {
      return;
    }

    setIsProcessing(true);
    try {
      // Get all users first
      const { data: users, error: usersError } = await supabase
        .from("user_roles")
        .select("user_id");

      if (usersError) throw usersError;

      const { data: monthlyPlan, error: planError } = await supabase
        .from("subscription_plans")
        .select("id, slug, billing_interval")
        .eq("product", "resume")
        .eq("slug", "monthly")
        .eq("is_active", true)
        .maybeSingle();

      if (planError) throw planError;
      if (!monthlyPlan) throw new Error("The Pro Monthly plan is not configured.");

      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Always write a concrete plan. A bare is_premium=true row can resolve
      // to the wrong entitlement catalog entry and hide the intended quota.
      const premiumPromises = users.map(user => 
        supabase
          .from("subscriptions")
          .upsert({
            user_id: user.user_id,
            is_premium: true,
            plan_id: monthlyPlan.id,
            plan_type: monthlyPlan.slug,
            provider: "manual",
            status: "active",
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            expires_at: periodEnd.toISOString(),
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" })
      );

      await Promise.all(premiumPromises);

      toast({ title: "Success", description: "Pro Monthly access granted to all users." });
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
              Grant Pro Monthly to All Users
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
