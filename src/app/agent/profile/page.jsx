
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, History, LogOut } from "lucide-react";
import Link from "next/link";

export default function AgentProfilePage() {
    return (
        <div className="container mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <header className="flex md:hidden justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">Profile</h1>
            </header>

            <div className="flex flex-col items-center pt-8 md:pt-0">
                <Avatar className="h-24 w-24 border-4 border-primary/50 mb-4">
                <AvatarImage src="https://picsum.photos/seed/agent-ravi/100/100" data-ai-hint="agent profile" alt="Agent Avatar" />
                <AvatarFallback>RK</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold font-headline">Ravi Kumar</h2>
                <p className="text-muted-foreground">ID: AGENT001</p>
            </div>

            <Card className="mt-10 bg-card/70 backdrop-blur-lg border-border/50">
                <CardContent className="p-2">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" className="w-full justify-start text-base py-6" asChild>
                            <Link href="/agent/profile">
                                <User className="mr-4"/> My Profile
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-base py-6" asChild>
                            <Link href="/agent/history">
                                <History className="mr-4"/> Job History
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-base py-6 text-destructive hover:text-destructive" asChild>
                             <Link href="/login">
                                <LogOut className="mr-4"/> Logout
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
