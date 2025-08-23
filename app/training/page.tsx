'use client';

import { Chat } from '@/components/chat';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { useChat } from 'ai/react';
import { TrainingSidebar } from '@/components/TrainingSidebar';
import type { Message } from 'ai';

const initialMessages: Message[] = [
    {
        id: 'greeting',
        role: 'assistant',
        content: `Hello! I am the **InfyRescue Training Bot**. 
I can help you with:
*   Disaster preparedness
*   First aid procedures
*   Evacuation plans
*   Using the InfyRescue platform

How can I assist you today?`,
    },
];

export default function TrainingPage() {
    const { messages, input, handleInputChange, handleSubmit, setInput, setMessages, isLoading } = useChat({
        id: 'infyrescue-training-chat',
        initialMessages,
    });

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                        InfyRescue
                    </Link>

                    <div className="text-center">
                        <h1 className="text-lg font-semibold text-foreground">
                            Training Center
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            AI-powered disaster response training
                        </p>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                            Help
                        </Link>
                        <ThemeSwitcher />
                    </nav>
                </div>
            </header>

            <div className="container mx-auto flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 py-8 px-4">
                <div className="lg:col-span-1">
                    <TrainingSidebar setInput={setInput} setMessages={setMessages} initialMessages={initialMessages} />
                </div>
                <div className="lg:col-span-2">
                    <Chat
                        messages={messages}
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
};