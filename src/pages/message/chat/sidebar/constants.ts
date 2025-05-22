export const ConversationStatusMap: { [key: number]: string } = {
    0: "未回复",
    1: "已回复",
    2: "已关闭",
    3: "已归档",
};

export type ConversationStatus = keyof typeof ConversationStatusMap;

export interface Conversation {
    id: string;
    name: string;
    status: number;
    lastMessage: string;
    lastMessageAt: string;
    is_unread: boolean;
}