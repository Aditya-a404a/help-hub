'use client';

import { MessageSquarePlus, BotMessageSquare } from 'lucide-react';
import type { Message } from 'ai';

// Define the props the sidebar will receive. `reload` is no longer needed.
interface TrainingSidebarProps {
    setInput: (input: string) => void;
    setMessages: (messages: Message[]) => void;
    initialMessages: Message[];
}

const suggestedPrompts = [
    "What should I do during an earthquake?",
    "How do I perform CPR on an adult?",
    "Create a checklist for a home emergency kit.",
    "What are the first signs of a flood?",
    "How to treat a first-degree burn?",
];

export function TrainingSidebar({ setInput, setMessages, initialMessages }: TrainingSidebarProps) {
    const handleNewChat = () => {
        // This correctly resets the chat to its initial state without making an API call.
        setMessages(initialMessages);
        setInput('');
    };

    return (
        <aside className="p-4 bg-background/50 rounded-2xl shadow-lg hidden lg:flex flex-col gap-4">
            <button
                onClick={handleNewChat}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
                <MessageSquarePlus className="h-5 w-5" />
                New Chat
            </button>
            <div className="flex-grow">
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BotMessageSquare className="h-5 w-5" />
                    Quick Topics
                </h2>
                <div className="space-y-2">
                    {suggestedPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => setInput(prompt)}
                            className="w-full text-left text-sm text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
            <p className="text-xs text-muted-foreground/80 text-center">
                Select a topic or type your own question in the chat.
            </p>
        </aside>
    );
}