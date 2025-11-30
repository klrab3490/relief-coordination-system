import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useApi } from "./APIContext";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export interface Message {
    userId: string;
    username: string;
    message: string;
    timestamp: number;
}

interface ChatContextType {
    socket: Socket | null;
    connected: boolean;
    messages: Message[];
    currentRoom: string | null;
    typingUser: string | null;

    // Actions
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    sendMessage: (message: string) => void;
    setTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useApi();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    // Initialize socket connection
    useEffect(() => {
        if (!user) return;

        const newSocket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
            setConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
            setConnected(false);
        });

        newSocket.on("receive_message", (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        newSocket.on("user_joined", (data: { userId: string; message: string }) => {
            console.log(data.message);
        });

        newSocket.on("user_left", (data: { userId: string; message: string }) => {
            console.log(data.message);
        });

        newSocket.on("user_typing", (data: { username: string }) => {
            setTypingUser(data.username);
        });

        newSocket.on("user_stop_typing", () => {
            setTypingUser(null);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const joinRoom = useCallback(
        (roomId: string) => {
            if (!socket) return;

            // Leave current room if any
            if (currentRoom) {
                socket.emit("leave_room", currentRoom);
            }

            // Join new room
            socket.emit("join_room", roomId);
            setCurrentRoom(roomId);
            setMessages([]); // Clear messages when switching rooms
        },
        [socket, currentRoom]
    );

    const leaveRoom = useCallback(() => {
        if (!socket || !currentRoom) return;

        socket.emit("leave_room", currentRoom);
        setCurrentRoom(null);
        setMessages([]);
    }, [socket, currentRoom]);

    const sendMessage = useCallback(
        (message: string) => {
            if (!socket || !currentRoom || !user) return;

            const messageData = {
                roomId: currentRoom,
                message,
                username: user.username,
                timestamp: Date.now(),
            };

            socket.emit("send_message", messageData);
        },
        [socket, currentRoom, user]
    );

    const setTyping = useCallback(
        (isTyping: boolean) => {
            if (!socket || !currentRoom || !user) return;

            if (isTyping) {
                socket.emit("typing", { roomId: currentRoom, username: user.username });
            } else {
                socket.emit("stop_typing", { roomId: currentRoom });
            }
        },
        [socket, currentRoom, user]
    );

    const value: ChatContextType = {
        socket,
        connected,
        messages,
        currentRoom,
        typingUser,
        joinRoom,
        leaveRoom,
        sendMessage,
        setTyping,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used inside ChatProvider");
    return ctx;
};
