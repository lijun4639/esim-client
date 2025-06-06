import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/ui/dropdown-menu";
import { Tag } from "antd";
import { useState } from "react";
import { Conversation, ConversationStatusMap } from "./constants";
import { cn } from "@/utils";

interface Props {
    conversation: Conversation;
    selected: boolean;
    onSelect: () => void;
    onArchive: () => void;
}

export default function ConversationItem({
                                             conversation,
                                             selected,
                                             onSelect,
                                             onArchive,
                                         }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
        setMenuOpen(true);
    };

    return (
        <>
            <div
                onClick={onSelect}
                onContextMenu={handleContextMenu}
                className={cn(
                    "relative px-3 py-3 cursor-pointer border-b hover:bg-gray-100 group flex text-base items-start",
                    selected && "bg-gray-200"
                )}
            >
                <div className="relative w-10 h-10 rounded-full border-1 shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex justify-center items-center flex-shrink-0 mr-3">
                    {conversation.isUnread && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    {conversation.guestId ? conversation.guestId.slice(-1) : ""}
                </div>

                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between font-medium">
                        <span className="truncate">{conversation.name}</span>
                        <span className="text-sm pt-[2px] text-gray-400">{conversation.lastMessageAt}</span>
                    </div>
                    <div className="text-sm mt-1 text-gray-500 truncate">
                        {conversation.lastMessage || "无消息"}
                    </div>
                    <div className="flex mt-1 ml-[-5px] justify-between">
                        <Tag
                            className="mt-1"
                            style={{ fontWeight: 400 }}
                            color={
                                conversation.status === 0
                                    ? "orange"
                                    : conversation.status === 1
                                        ? "green"
                                        : "gray"
                            }
                        >
                            {ConversationStatusMap[conversation.status] ?? "未知状态"}
                        </Tag>
                    </div>
                </div>
            </div>

            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuContent
                    sideOffset={0}
                    style={{
                        position: "fixed",
                        top: menuPos.y,
                        left: menuPos.x,
                        zIndex: 9999,
                    }}
                >
                    <DropdownMenuItem onClick={onArchive}>归档会话</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
