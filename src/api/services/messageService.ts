import apiClient from "../apiClient";
import { supabase } from '@/supabase/client';

export interface Conversation {
    id?: string;
    name?: string;
    status?: number;
    userId?: string;
    messages?: any;
    lastMessage?: string;
    lastMessageAt?: string;
    guestId?: string;
}

export interface InsertConversation {
    user_id?: string | null;
    guest_id: string;
    last_message: string;
    last_message_at: string;
    name: string;
}

const API_BASE_URL = 'http://localhost:3000';

const generateFunApiUrl = (path: string) => `${API_BASE_URL}${path}`;

// 插入会话
const insertConversation: any = ({
                                       userId,
                                       guestId,
                                       message,
                                       name,
                                   }: {
    userId: string;
    guestId: string;
    message: string;
    name: string;
}) => {
    const payload: InsertConversation = {
        user_id: userId || null,
        guest_id: guestId,
        last_message: message,
        name,
        last_message_at: new Date().toISOString(),
    };

    return supabase
        .from('conversations')
        .insert(payload)
        .select()
        .single(); // ✅ 返回 Promise<{ data, error }>
};


const insertMessage: any = ({
    conversationId,
    type,
    content,
    currentUserId
}: any)=>{
    return supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            type,
            content,
            from_user: currentUserId,
        })
        .select()
        .single();
}


// 获取匿名用户 token
const getGuestToken = (phoneNumber: string) => {
    return apiClient.post<any>({
        url: generateFunApiUrl('/generate-token'),
        data: { phoneNumber },
    });
};



// 获取会话列表（支持分页、状态、taskId 等查询参数）
const getConversationList = (params: any) => {
    return apiClient.get({
        url: "/chat/conversation",
        params,
    });
};

// 统计会话数量（可传入 status, taskId 等筛选条件）
const countConversations = (params: any) => {
    return apiClient.get({
        url: "/chat/conversation/count",
        params,
    });
};

// 创建会话
const createConversation = (data: any) => {
    return apiClient.post({
        url: "/chat/conversation",
        data,
    });
};

// 更新会话（需要传 id）
const updateConversation = (id: string, data: any) => {
    return apiClient.put({
        url: `/chat/conversation/${id}`,
        data,
    });
};

// 删除会话（需要传 id）
const deleteConversation = (id: string) => {
    return apiClient.delete({
        url: `/chat/conversation/${id}`,
    });
};



// 获取消息列表（必须传 conversationId，支持分页）
const getMessageList = (params: {
    conversationId: string;
    page?: number;
    pageSize?: number;
}) => {
    return apiClient.get({
        url: "/message",
        params,
    });
};

// 统计消息数量（必须传 conversationId）
const countMessages = (params: { conversationId: string }) => {
    return apiClient.get({
        url: "/message/count",
        params,
    });
};

// 创建消息
const createMessage = (data: {
    conversationId: string;
    messageType: "text" | "image";
    content: string;
    guestId?: string;
}) => {
    return apiClient.post({
        url: "/message",
        data,
    });
};

// 更新消息（需要传 id）
const updateMessage = (id: number | string, data: Partial<{
    messageType: "text" | "image";
    content: string;
    guestId?: string;
}>) => {
    return apiClient.put({
        url: `/message/${id}`,
        data,
    });
};

// 删除消息（需要传 id）
const deleteMessage = (id: number | string) => {
    return apiClient.delete({
        url: `/message/${id}`,
    });
};


export default {
    insertConversation,
    insertMessage,
    getGuestToken,

    getConversationList,
    countConversations,
    createConversation,
    updateConversation,
    deleteConversation,

    getMessageList,
    countMessages,
    createMessage,
    updateMessage,
    deleteMessage,
};