import { useEffect, useRef } from "react";
import { ScrollArea } from "@/ui/scroll-area";
import ConversationItem from "./conversation-item.tsx";

interface Props {
    list: any[];
    loadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    archiveConversation: (id: string) => void;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function ConversationList({
                                             list,
                                             loadMore,
                                             hasMore,
                                             loading,
                                             archiveConversation,
                                             selectedId,
                                             onSelect,
                                         }: Props) {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        const isScrollable = el.scrollHeight > el.clientHeight;
        if (!isScrollable && list.length > 0) {
            const timer = setTimeout(() => {
                loadMore();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [list.length, hasMore, loading]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;

        if (hasMore && !loading && nearBottom) {
            loadMore();
        }
    };

    return (
        <ScrollArea
            ref={scrollRef}
            className="h-[calc(100vh-214px)] mt-3 overflow-y-auto"
            onScroll={handleScroll}
        >
            {list.map((c: any) => (
                <ConversationItem
                    key={c.id}
                    conversation={c}
                    selected={selectedId === c.id}
                    onSelect={() => onSelect(c.id)}
                    onArchive={() => archiveConversation(c.id)}
                />
            ))}
        </ScrollArea>
    );
}