import { useEffect, useMemo, useRef, useState } from "react";
import { usePaginatedLoader } from "@/hooks/common/usePaginatedLoader";
import messageService from "@/api/services/messageService";
import type { Conversation } from "./constants";
import {formatTime} from "@/utils/time.ts";

interface UseChatParams {
    tab: string;
    keyword: string;
}

export function useChatConversations({ tab, keyword }: UseChatParams) {
    const [activeAll, setActiveAll] = useState<Conversation[]>([]);
    const [activeLoading, setActiveLoading] = useState(false);
    const didLoadActive = useRef(false);

    const isStaticTab = ["-1", "0", "1"].includes(tab);

    // ✅ 非分页：仅首次加载
    useEffect(() => {
        if (isStaticTab && !didLoadActive.current) {
            setActiveLoading(true);
            messageService
                .getConversationList({ status: "<2", page: 1, pageSize: -1 })
                .then(res => {
                    if(res.list){
                        const formatted = res.list.map((item:any) => ({
                            ...item,
                            lastMessageAt: item.lastMessageAt ? formatTime(item.lastMessageAt,"MM-DD") : null,
                        }));
                        setActiveAll(formatted);
                    }
                    didLoadActive.current = true;
                })
                .finally(() => setActiveLoading(false));
        }
    }, [isStaticTab]);

    // ✅ 分页加载：仅 tab === "2" 时启用
    const closedHook = usePaginatedLoader<Conversation>({
        query: { status: 2 },
        fetchFn: messageService.getConversationList,
        pageSize: 20,
        autoLoad: true,
        autoLoadOnQueryChange: true,
        enabled: tab === "2", // ✅ 核心：始终调用 hook，但只在 tab === 2 时启用行为
    });

    // ✅ 前端过滤逻辑
    const activeList = useMemo(() => {
        let base = activeAll;

        if (tab === "0") base = base.filter(c => c.status === 0);
        if (tab === "1") base = base.filter(c => c.status === 1);

        if (keyword.trim()) {
            return base.filter(c =>
                c.name?.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        return base;
    }, [tab, keyword, activeAll]);

    const closedList = useMemo(() => {
        return (closedHook?.data ?? []).map(item => ({
            ...item,
            lastMessageAt: item.lastMessageAt ? formatTime(item.lastMessageAt, "MM-DD") : null,
        }));
    }, [closedHook?.data]);
    // const closedList = closedHook?.data ?? [];
    const list = tab === "2" ? closedList : activeList;
    const loadMore = () => {
        if (tab === "2") closedHook?.loadMore();
    };

    const hasMore = tab === "2" ? closedHook?.hasMore ?? false : false;

    const loading = tab === "2" ? closedHook?.loading ?? false : activeLoading;

    const refresh = tab === "2" ? closedHook?.reset ?? (() => {}) : () => {};

    const archiveConversation = async (id: string) => {
        await messageService.updateConversation(id, { status: 3 });
        if (isStaticTab) {
            setActiveAll(prev => prev.filter(c => c.id !== id));
        }
    };

    const markIsUnRead = async (id: string,isUnread=false) => {
        const index = activeAll.findIndex(c => c.id === id);
        if (index !== -1) {
            // 标记为未读已经在服务器推送数据的时候改了数据库了，只有未读变成已读才需要在客户端执行
            if(!isUnread) {
                await messageService.updateConversation(id, { isUnread: isUnread });
            }
            setActiveAll(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, isUnread: isUnread } : c
                )
            );
        }
    };

    const updateConversationById = (id: string, updates: Partial<Conversation>) => {
        setActiveAll(prev => {
            const updatedList = prev.map(c =>
                c.id === id ? { ...c, ...updates, lastMessageAt: formatTime(new Date(), "MM-DD") } : c
            );

            const idx = updatedList.findIndex(c => c.id === id);
            if (idx === -1) return updatedList;

            const [target] = updatedList.splice(idx, 1);
            return [target, ...updatedList];
        });
    };

    return {
        list,
        loadMore,
        hasMore,
        loading,
        refresh,
        archiveConversation,
        markIsUnRead,
        updateConversationById,
    };
}
