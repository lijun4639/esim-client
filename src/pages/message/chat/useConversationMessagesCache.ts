import { useEffect, useState } from "react";
import messageService from "@/api/services/messageService";
import type { Message } from "./index.tsx";


interface CachedState {
    messages: Message[];
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export function useConversationMessagesCache(conversationId: string | null, currentUserId?: string) {
    const [cache, setCache] = useState<Record<string, CachedState>>({});

    const current = cache[conversationId ?? ""] ?? {
        messages: [],
        page: 1,
        hasMore: true,
        loading: false,
    };

    const loadMore = async () => {
        if (!conversationId || current.loading || !current.hasMore) return;

        setCache(prev => ({
            ...prev,
            [conversationId]: { ...current, loading: true },
        }));

        try {
            const res = await messageService.getMessageList({
                conversationId,
                page: current.page,
                pageSize: 15,
            });

            const newList = res.list || [];

            setCache(prev => ({
                ...prev,
                [conversationId]: {
                    messages: [...newList, ...current.messages],
                    page: current.page + 1,
                    hasMore: newList.length === 15,
                    loading: false,
                },
            }));
        } catch (e) {
            setCache(prev => ({
                ...prev,
                [conversationId]: { ...current, loading: false },
            }));
        }
    };

    const appendMessage = (conversationId:string | null,msg: Message) => {
        if (!conversationId) return;
        setCache(prev => {
            const existing = prev[conversationId] ?? {
                messages: [],
                page: 1,
                hasMore: true,
                loading: false,
            };
            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: [...existing.messages, msg],
                },
            };
        });
    };

    const replaceMessage = (tempId: number, newMsg: Message) => {
        if (!conversationId) return;
        setCache(prev => {
            const existing = prev[conversationId];
            if (!existing) return prev;
            const updatedMessages = existing.messages.map(m =>
                m.id === tempId ? newMsg : m
            );
            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: updatedMessages,
                },
            };
        });
    };

    const markMessageFailed = (tempId: number) => {
        if (!conversationId) return;
        setCache((prev):any => {
            const existing = prev[conversationId];
            if (!existing) return prev;
            const updatedMessages = existing.messages.map(m =>
                m.id === tempId ? { ...m, status: "failed" } : m
            );
            return {
                ...prev,
                [conversationId]: {
                    ...existing,
                    messages: updatedMessages,
                },
            };
        });
    };

    const sendMessage = async (type: "text" | "image", content: string) => {
        console.log("sendMessage", type, content);
        if (!conversationId || !content.trim()) return;

        const tempId = Date.now();
        const tempMsg: Message = {
            id: tempId,
            userId: currentUserId,
            type,
            content,
            createdAt: new Date().toISOString(),
            status: "sending",
        };
        appendMessage(conversationId,tempMsg);
        try {
            const data = await messageService.createMessage({
                conversationId,
                type,
                content
            });
            replaceMessage(tempId, {
                ...tempMsg,
                id: data.id,
                createdAt: data.created_at,
                status: "sent",
            });
        } catch {
            markMessageFailed(tempId);
        }
    };

    // ✅ 自动触发首次加载
    useEffect(() => {
        if (!conversationId) return;
        const cached = cache[conversationId];
        if (!cached || cached.messages.length === 0) {
            loadMore();
        }
    }, [conversationId]);

    return {
        messages: current.messages,
        hasMore: current.hasMore,
        loading: current.loading,
        loadMore,
        appendMessage,
        replaceMessage,
        markMessageFailed,
        sendMessage,
    };
}