
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

interface AddUserFormProps {
  onUserAdded: () => void;
}

export function AddUserForm({ onUserAdded }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    isPremium: false,
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create user via Supabase Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add user role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: formData.role as any
          });

        if (roleError) {
          console.error("Role assignment error:", roleError);
        }

        // Add premium subscription if selected
        if (formData.isPremium) {
          const { error: subError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: authData.user.id,
              is_premium: true
            });

          if (subError) {
            console.error("Subscription error:", subError);
          }
        }

        toast({
          title: "User created successfully",
          description: `${formData.firstName} ${formData.lastName} has been added to the platform`
        });

        // Reset form
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          role: "user",
          isPremium: false,
          password: ""
        });

        onUserAdded();
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Failed to create user",
        description: error.message || "An error occurred while creating the user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New User
        </CardTitle>
        <CardDescription>
          Create a new user account and assign roles/permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPremium"
              checked={formData.isPremium}
              onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
            />
            <Label htmlFor="isPremium">Grant Premium Access</Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating User..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
