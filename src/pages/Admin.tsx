
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAllMembers } from "@/hooks/useAllMembers";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: loadingAdmin } = useAdminStatus(userId);
  const { data: members = [], isLoading: loadingMembers, refetch } = useAllMembers(!!isAdmin);

  useEffect(() => {
    if (!isLoading && !loadingAdmin) {
      if (!userId) {
        toast({ title: "Not logged in", description: "Please log in first.", variant: "destructive" });
        navigate("/login");
      } else if (!isAdmin) {
        toast({ title: "Forbidden", description: "You are not an admin.", variant: "destructive" });
        navigate("/");
      }
    }
  }, [userId, isAdmin, isLoading, loadingAdmin, navigate]);

  const handlePromoteToPremium = async (targetUserId: string) => {
    // Upsert to subscriptions as premium
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: targetUserId,
        is_premium: true,
      }, { onConflict: "user_id" });
    if (error) toast({ title: "Upgrade failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Success", description: "User promoted to premium." });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Table>
        <TableCaption>All Platform Members</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead># Resumes</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Resumes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.user_id}>
              <TableCell className="break-all max-w-xs">{m.user_id}</TableCell>
              <TableCell>{m.roles?.join(", ")}</TableCell>
              <TableCell>{m.is_premium ? "Yes" : "No"}</TableCell>
              <TableCell>{m.resume_count}</TableCell>
              <TableCell>
                {!m.is_premium && (
                  <Button size="sm" onClick={() => handlePromoteToPremium(m.user_id)}>
                    Upgrade to Premium
                  </Button>
                )}
              </TableCell>
              <TableCell>
                {m.resumes.length > 0 ? (
                  <details>
                    <summary>View</summary>
                    <ul className="max-h-40 overflow-y-auto">
                      {m.resumes.map((r, idx) => (
                        <li key={r.id} className="text-xs mt-2 px-1 border-l border-primary">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(r.resume_data, null, 2)}</pre>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <span className="text-xs text-muted-foreground">No resumes</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Admin;
