import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useApi } from "@/context/APIContext";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Chat = () => {
    const { user } = useApi();
    const { connected, messages, currentRoom, typingUser, joinRoom, sendMessage, setTyping } = useChat();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("room") || "general";

    const [messageInput, setMessageInput] = useState("");
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Join room on mount
    useEffect(() => {
        if (roomId) {
            joinRoom(roomId);
        }
    }, [roomId, joinRoom]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        sendMessage(messageInput);
        setMessageInput("");
        setTyping(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    const handleTyping = (value: string) => {
        setMessageInput(value);

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set typing indicator
        setTyping(true);

        // Stop typing after 2 seconds of inactivity
        const timeout = setTimeout(() => {
            setTyping(false);
        }, 2000);

        setTypingTimeout(timeout);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6">
                <Card className="h-[calc(100vh-200px)] flex flex-col animate-fade-in-up">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">Chat Room</CardTitle>
                                <CardDescription>
                                    Room: <span className="font-mono font-semibold">{currentRoom || roomId}</span>
                                </CardDescription>
                            </div>
                            <Badge variant={connected ? "default" : "destructive"} className="animate-pulse">
                                {connected ? "🟢 Connected" : "🔴 Disconnected"}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500 text-center">
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isOwnMessage = msg.username === user?.username;
                                    return (
                                        <div
                                            key={index}
                                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fade-in`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow transition-all duration-300 hover:scale-105 ${
                                                    isOwnMessage
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                }`}
                                            >
                                                {!isOwnMessage && (
                                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                                        {msg.username}
                                                    </p>
                                                )}
                                                <p className="text-sm break-words">{msg.message}</p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        isOwnMessage
                                                            ? "text-blue-200"
                                                            : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                                >
                                                    {formatTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* Typing Indicator */}
                            {typingUser && typingUser !== user?.username && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-semibold">{typingUser}</span> is typing
                                            <span className="animate-pulse">...</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={!connected}
                                    className="flex-1 transition-all duration-300 focus:scale-[1.02]"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!connected || !messageInput.trim()}
                                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Chat;
