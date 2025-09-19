
'use client';

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const API_BASE_URL = 'http://localhost:5001/api';

export default function ChatDialog({ trigger, booking, currentUser }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);

    const otherUserName = currentUser === 'agent' ? booking.customer : booking.agent?.name;
    const currentUserAvatar = currentUser === 'agent' ? `https://picsum.photos/seed/${booking.agent?.id}/100/100` : `https://i.pravatar.cc/150?u=${booking.customer_id}`;
    const otherUserAvatar = currentUser === 'agent' ? `https://i.pravatar.cc/150?u=${booking.customer_id}` : `https://picsum.photos/seed/${booking.agent?.id}/100/100`;

    const fetchMessages = async () => {
        if (!booking?.id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/chat/${booking.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (open) {
            fetchMessages();
            const intervalId = setInterval(fetchMessages, 3000);
            return () => clearInterval(intervalId);
        }
    }, [open, booking?.id]);


    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (type = 'text', content = newMessage) => {
        if (content.trim() === '') return;

        const messagePayload = {
            sender: currentUser,
            message_type: type,
            content: content,
        };

        if (type === 'text') {
            setNewMessage('');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/chat/${booking.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messagePayload),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            // Fire-and-refetch
            await fetchMessages();

        } catch (error) {
            console.error("Send message error:", error);
        }
    };
    
    const handleSendPhoto = () => {
        const imageUrl = `https://picsum.photos/seed/${Math.random()}/400/300`;
        handleSendMessage('image', imageUrl);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg h-[calc(100vh-4rem)] max-h-[90vh] flex flex-col bg-background/80 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Chat with {otherUserName}</DialogTitle>
                    <DialogDescription>
                        Regarding booking ID: {booking.id}
                    </DialogDescription>
                </DialogHeader>
                
                <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {isLoading && messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-3", msg.sender === currentUser ? "justify-end" : "justify-start")}>
                            {msg.sender !== currentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={otherUserAvatar} />
                                    <AvatarFallback>{otherUserName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-[70%] rounded-lg px-4 py-2", msg.sender === currentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                {msg.message_type === 'text' && <p className="text-sm">{msg.content}</p>}
                                {msg.message_type === 'image' && (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden mt-2">
                                        <Image src={msg.content} alt="Shared image" layout="fill" objectFit="cover" data-ai-hint="queue status" />
                                    </div>
                                )}
                                <p className={cn("text-xs mt-1 text-right", msg.sender === currentUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                             {msg.sender === currentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentUserAvatar} />
                                    <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex items-center w-full space-x-2">
                         {currentUser === 'agent' && (
                             <Button size="icon" variant="outline" onClick={handleSendPhoto}>
                                <Paperclip className="h-4 w-4" />
                                <span className="sr-only">Send Photo</span>
                            </Button>
                         )}
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button onClick={() => handleSendMessage()} size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send Message</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
