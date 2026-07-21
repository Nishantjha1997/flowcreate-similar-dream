import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { captureError } from '@/lib/monitoring';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { KeyRound, Mail, Trash2, Loader2 } from 'lucide-react';

export function SecuritySettingsForm() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- Change password ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    if (newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      // Re-verify the current password before allowing a change - updateUser()
      // alone would let anyone with a live session change the password without
      // ever proving they know the current one.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) {
        toast({ title: 'Current password is incorrect', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      captureError(error, { action: 'change-password' });
      toast({
        title: 'Could not update password',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // --- Change email ---
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    setChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({
        title: 'Confirmation email sent',
        description: `Check ${newEmail.trim()} (and your current inbox) to confirm the change.`,
      });
      setNewEmail('');
    } catch (error) {
      captureError(error, { action: 'change-email' });
      toast({
        title: 'Could not update email',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChangingEmail(false);
    }
  };

  // --- Delete account ---
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('self-delete-account', {});
      if (error) throw new Error(error.message || 'Failed to delete account');
      toast({ title: 'Account deleted', description: 'Your account and all data have been permanently removed.' });
      await signOut();
      navigate('/');
    } catch (error) {
      captureError(error, { action: 'delete-account' });
      toast({
        title: 'Could not delete account',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" /> Change Password
          </CardTitle>
          <CardDescription>Update your password. You'll need to confirm your current one.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <div>
            <Label className="text-xs">Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <Label className="text-xs">New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div>
            <Label className="text-xs">Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" /> Change Email
          </CardTitle>
          <CardDescription>
            Current email: <span className="font-medium text-foreground">{user?.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <div>
            <Label className="text-xs">New Email Address</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <Button onClick={handleChangeEmail} disabled={changingEmail || !newEmail.trim()}>
            {changingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Confirmation
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" /> Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account, resumes, and subscription data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog onOpenChange={(open) => !open && setDeleteConfirmText('')}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account, saved resumes, and subscription. Type{' '}
                  <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirmText !== 'DELETE' || deleting}
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Permanently Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
