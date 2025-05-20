import {useEffect, useState} from "react";
import {supabase} from "@/supabase/client";
import {formatTime} from "@/utils/time.ts";
import messageService from "@/api/services/messageService";

export interface Message {
	id?: number;
	from_user: string;
	type: "text" | "image";
	content: string;
	createdAt: string;
	status?: "sending" | "sent" | "failed";
}

export interface Conversation {
	id: string;
	name: string;
	status: number;
	messages: Message[];
	lastMessage: string;
	lastMessageAt: string;
}

export function useChat() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data.user?.id) setCurrentUserId(data.user.id);
		});
	}, []);

	useEffect(() => {
		loadConversations();
	}, []);

	useEffect(() => {
		loadMessages();
	}, [selectedId]);

	async function loadConversations() {
		setIsLoading(true);
		const { data, error } = await supabase
			.from("conversations")
			.select("*")
			.order("last_message_at", { ascending: false });

		setIsLoading(false);
		if (error) {
			console.error("加载会话失败:", error);
			return;
		}

		const loaded: Conversation[] = (data || []).map((row) => ({
			id: row.id,
			name: row.name,
			status: row.status,
			lastMessageAt: formatTime(row.last_message_at).format("MM-DD"),
			lastMessage: row.last_message,
			messages: [],
		}));

		setConversations(loaded);
		if (!selectedId && loaded.length > 0) {
			setSelectedId(loaded[0].id);
		}
	}

	async function loadMessages() {
		if (!selectedId) return;

		const existing = conversations.find((c) => c.id === selectedId);
		if (existing && existing.messages.length > 0) {
			return; // 已经加载过
		}

		const { data, error } = await supabase
			.from("messages")
			.select("*")
			.eq("conversation_id", selectedId)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("加载消息失败:", error);
			return;
		}

		const newMessages: Message[] = (data || []).map((msg) => ({
			id: msg.id,
			from_user: msg.from_user,
			type: msg.type,
			content: msg.content,
			createdAt: msg.created_at,
		}));

		setConversations((prev) =>
			prev.map((conv) =>
				conv.id === selectedId ? { ...conv, messages: newMessages } : conv
			)
		);
	}


	function updateMessageStatus(conversationId: string, update: Partial<Message>) {
		setConversations((prev) =>
			prev.map((conv) => {
				if (conv.id !== conversationId) return conv;

				const lastIdx = conv.messages.length - 1;
				if (lastIdx < 0) return conv;

				const lastMsg = conv.messages[lastIdx];

				const updatedMessages = [...conv.messages];
				updatedMessages[lastIdx] = { ...lastMsg, ...update };

				console.log({ ...conv, messages: updatedMessages })
				return { ...conv, messages: updatedMessages };
			})
		);
	}

	async function uploadImage(file: File): Promise<string | null> {
		const filename = `${Date.now()}-${file.name}`;
		const { data, error } = await supabase.storage.from("chat-images").upload(`user-123/${filename}`, file);

		if (error || !data) return null;

		return supabase.storage.from("chat-images").getPublicUrl(data.path).data.publicUrl;
	}

	const addNewConversation = (data: any) => {
		setConversations((prev) => {
			const newConv: any = {
				id: data.id,
				name: data.name,
				messages: [],
				status: data.status,
			};
			return [newConv, ...prev];
		});
	};

	const appendMessageToConversation = (newMessage: Message,conversationId: string) => {
		setConversations((prev) => {
			const updated: Conversation[] = [];
			let current: Conversation | null = null;

			for (const conv of prev) {
				if (conv.id === conversationId) {
					current = {
						...conv,
						messages: [...conv.messages, newMessage],
						lastMessage: newMessage.content,
						lastMessageAt: newMessage.createdAt,
					};
				} else {
					updated.push(conv);
				}
			}
			return current ? [current, ...updated] : updated;
		});
	};


	async function sendMessage(type: "text" | "image", content: string, conversationId: string | null) {
		if (!conversationId || !currentUserId || !content.trim()) return;


		const newMessage: Message = {
			id: new Date().getTime(),
			from_user: currentUserId,
			type,
			content,
			createdAt: new Date().toISOString(),
			status: "sending",
		};

		appendMessageToConversation(newMessage,conversationId)

		const { data, error } = await messageService.insertMessage({
			conversationId,
			type,
			content,
			currentUserId,
		})

		if (error || !data) {
			updateMessageStatus(conversationId, { status: "failed" });
			return;
		}

		//TODO 应该在此处完成手机调用
		//......................
		updateMessageStatus(conversationId, {
			id: data.id,
			createdAt: data.created_at,
			status: "sent",
		});

	}
	async function updateConversation(content: string,conversationId: string | null){
		if (!conversationId) {
			console.warn("⛔ conversationId 为 null，跳过更新");
			return;
		}

		const { data, error } = await supabase
			.from('conversations')
			.update({ last_message: content })
			.eq('id', String(conversationId))
			.select();

		if (error) {
			console.error('更新失败:', error);
		} else if (data.length === 0) {
			console.warn('⚠️ 更新无效，未找到匹配的会话 ID:', conversationId);
		} else {
			console.log('✅ 更新成功:', data);
		}
	}

	async function insertConversationByPhone({phoneNumber, message}: {phoneNumber: string,message: string}) {
		const {token} = await messageService.getGuestToken(phoneNumber);
		console.log(token)
		if (!token) throw new Error("Token 中缺少手机号");

		const { data ,error } = await messageService.insertConversation({
			userId: currentUserId,
			guestId: token,
			message,
			name: phoneNumber
		});
		if (error) throw error;
		const { id } = data
		addNewConversation(data);
		setSelectedId(id)
		await sendMessage("text", message, id);
	}


	return {
		conversations,
		selectedId,
		setSelectedId,
		currentUserId,
		sendMessage,
		uploadImage,
		isLoading,
		insertConversationByPhone,
		updateConversation
	};
}
