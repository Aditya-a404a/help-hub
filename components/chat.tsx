'use client';

import { Send, BotMessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UseChatHelpers } from 'ai/react';
import { useEffect, useRef } from 'react';

// Define a type for the props the Chat component will receive.
type ChatProps = Pick<
    UseChatHelpers,
    'messages' | 'input' | 'handleInputChange' | 'handleSubmit' | 'isLoading'
>;

export function Chat({ messages, input, handleInputChange, handleSubmit, isLoading }: ChatProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full min-h-[70vh] bg-background/30 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length > 0 ? messages.map(m => (
                    <div
                        key={m.id}
                        className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xl px-5 py-3 rounded-2xl shadow-md text-sm ${m.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-lg'
                                : 'bg-accent text-accent-foreground rounded-bl-lg'
                                }`}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                                    ul: ({ ...props }) => <ul className="list-disc list-inside pl-2 space-y-1" {...props} />,
                                    li: ({ ...props }) => <li {...props} />,
                                }}
                            >
                                {m.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <BotMessageSquare className="h-12 w-12 mb-4" />
                        <h2 className="text-lg font-semibold">Welcome to the Training Center</h2>
                        <p className="text-sm">Your chat will appear here. Use the sidebar to start a topic or type below.</p>
                    </div>
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-2xl shadow-md text-sm rounded-bl-lg">
                            <BotMessageSquare className="h-5 w-5 animate-pulse" />
                            <span>Typing...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-background/20">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3"
                >
                    <input
                        className="flex-1 bg-input/70 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/80 transition-all duration-300"
                        value={input}
                        placeholder="Ask about first aid, evacuation plans..."
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground p-3 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 flex-shrink-0"
                        aria-label="Send message"
                        disabled={!input || isLoading}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}