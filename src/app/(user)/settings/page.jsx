
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export default function SettingsPage() {
    const { toast } = useToast();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);

    const handlePasswordChange = () => {
        toast({ title: "Feature Coming Soon!", description: "The change password functionality is not yet implemented." });
    }

    const handlePaymentMethods = () => {
        toast({ title: "Feature Coming Soon!", description: "The payment management functionality is not yet implemented." });
    }

    const handleDeleteAccount = () => {
        toast({
            variant: "destructive",
            title: "Account Deletion",
            description: "Your account has been successfully deleted.",
        });
    }


    return (
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and notification preferences.</p>
            </header>

            <div className="space-y-8">
                <Card className="bg-card/70 backdrop-blur-lg border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Bell className="text-primary"/>
                            <span>Notifications</span>
                        </CardTitle>
                        <CardDescription>
                            Choose how you want to be notified about your bookings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-background/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">Receive updates on your mobile device.</p>
                            </div>
                            <Switch 
                                id="push-notifications" 
                                checked={pushNotifications}
                                onCheckedChange={setPushNotifications}
                            />
                        </div>
                         <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-background/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                                <p className="text-xs text-muted-foreground">Get booking summaries and receipts.</p>
                            </div>
                            <Switch 
                                id="email-notifications" 
                                checked={emailNotifications}
                                onCheckedChange={setEmailNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                 <Card className="bg-card/70 backdrop-blur-lg border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Shield className="text-primary"/>
                            <span>Account & Security</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start" onClick={handlePasswordChange}>Change Password</Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handlePaymentMethods}>Manage Payment Methods</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
