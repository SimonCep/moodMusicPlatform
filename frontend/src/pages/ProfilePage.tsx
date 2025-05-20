import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from 'sonner';
import { apiClient } from '@/services/api';
import { PasswordRequirements } from '@/components/PasswordRequirements';
import { X } from 'lucide-react';

interface UserProfile {
    id: number;
    username: string;
    email: string;
}

const changePasswordSchema = z.object({
    old_password: z.string().min(1, "Current password is required"),
    new_password1: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    new_password2: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.new_password1 === data.new_password2, {
    message: "New passwords don't match",
    path: ["new_password2"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password1: "",
      new_password2: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);
      try {
        const response = await apiClient.get<UserProfile>('/api/profile/');
        setUserProfile(response.data);
      } catch (error: any) {
        setProfileError(error.response?.data?.detail || error.message || "Failed to load profile.");
         toast.error("Could not fetch profile data.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const onSubmitPassword = async (data: ChangePasswordFormValues) => {
    setIsLoadingPassword(true);
    try {
      await apiClient.put('/api/change-password/', data);
      toast.success("Password changed successfully.");
      form.reset();
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      const backendErrors = error.response?.data;
      let errorMessage = "Failed to change password.";
      if (backendErrors) {
         if (backendErrors.old_password) errorMessage = `Current password error: ${backendErrors.old_password.join(', ')}`;
         else if (backendErrors.new_password1) errorMessage = `New password error: ${backendErrors.new_password1.join(', ')}`;
         else if (backendErrors.new_password2) errorMessage = `Confirmation error: ${backendErrors.new_password2.join(', ')}`;
         else if (backendErrors.detail) errorMessage = backendErrors.detail;
         else if (backendErrors.non_field_errors) errorMessage = backendErrors.non_field_errors.join(', ');
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Card className="w-full max-w-2xl glass-card text-card-foreground">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription className="text-card-foreground/80">
            Your current profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProfile && <p>Loading profile...</p>}
          {profileError && <p className="text-destructive">{profileError}</p>}
          {userProfile && !isLoadingProfile && !profileError && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Username:</Label>
                <span className="col-span-2 text-card-foreground/90">{userProfile.username}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-medium">Email:</Label>
                <span className="col-span-2 text-card-foreground/90">{userProfile.email}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl glass-card text-card-foreground">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription className="text-card-foreground/80">
            Update your password here. Make sure it's secure.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-accent/20 border border-primary">Change Password</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription className="text-card-foreground/80">
                  Update your password here. Enter your current password and the new password twice.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="old_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} className="bg-input/50 text-card-foreground" />
                        </FormControl>
                        <FormMessage className="text-destructive font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_password1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">New Password</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="password" 
                            placeholder="Enter new password"
                            className="bg-input/50 text-card-foreground"
                            onFocus={() => setIsNewPasswordFocused(true)}
                            onBlur={() => setIsNewPasswordFocused(false)}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive font-medium" />
                        <PasswordRequirements password={field.value} isVisible={isNewPasswordFocused} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_password2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} className="bg-input/50 text-card-foreground" />
                        </FormControl>
                        <FormMessage className="text-destructive font-medium" />
                        {form.watch('new_password1') !== field.value && field.value && (
                          <div className="mt-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 shadow-sm transition-all duration-200 ease-in-out">
                            <div className="flex items-center space-x-2 text-sm text-destructive">
                              <X className="h-3.5 w-3.5" />
                              <span>Passwords do not match</span>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="bg-card/80 hover:bg-card/60 cursor-pointer transition-all duration-300 hover:scale-105 border border-primary">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      disabled={isLoadingPassword} 
                      className="bg-primary/90 hover:bg-primary cursor-pointer transition-all duration-300 hover:scale-105 border border-primary"
                    >
                      {isLoadingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage; 