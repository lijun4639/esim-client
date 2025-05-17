// hooks/useChat.ts
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import dayjs from "dayjs";

export interface Message {
	id: number;
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
	messages: any;
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
			.order("last_message_at", { ascending: true });

		setIsLoading(false);
		if (error) {
			console.error("加载会话失败:", error);
			return;
		}

		const loaded: Conversation[] = (data || []).map((row) => ({
			id: row.id,
			name: row.name,
			status: row.status,
			lastMessageAt: row.last_message_at,
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
			createdAt: dayjs(msg.created_at).format("YYYY-MM-DD HH:mm:ss"),
		}));

		setConversations((prev) =>
			prev.map((conv) => (conv.id === selectedId ? { ...conv, messages: newMessages } : conv)),
		);
	}

	function updateMessageStatus(conversationId: string, tempId: number, update: Partial<Message>) {
		setConversations((prev) =>
			prev.map((conv) =>
				conv.id === conversationId
					? {
							...conv,
							messages: conv.messages.map((msg: any) => (msg.id === tempId ? { ...msg, ...update } : msg)),
						}
					: conv,
			),
		);
	}

	async function uploadImage(file: File): Promise<string | null> {
		const filename = `${Date.now()}-${file.name}`;
		const { data, error } = await supabase.storage.from("chat-images").upload(`user-123/${filename}`, file);

		if (error || !data) return null;

		return supabase.storage.from("chat-images").getPublicUrl(data.path).data.publicUrl;
	}

	async function sendMessage(type: "text" | "image", content: string) {
		if (!selectedId || !currentUserId || !content.trim()) return;

		const tempId = Date.now();

		const newMessage: Message = {
			id: tempId,
			from_user: currentUserId,
			type,
			content,
			createdAt: new Date().toISOString(),
			status: "sending",
		};

		// setConversations((prev) =>
		//     prev.map((conv) =>
		//         conv.id === selectedId
		//             ? { ...conv, messages: [...conv.messages, newMessage] }
		//             : conv
		//     )
		// );
		setConversations((prev) => {
			const updated = prev.map((c) => {
				if (c.id === selectedId) {
					return {
						...c,
						lastMessage: newMessage.content,
						lastMessageAt: newMessage.createdAt,
					};
				}
				return c;
			});

			// 把当前会话移到最前面
			const current = updated.find((c) => c.id === selectedId);
			const others = updated.filter((c) => c.id !== selectedId);
			return current ? [current, ...others] : others;
		});

		const { data, error } = await supabase
			.from("messages")
			.insert({
				conversation_id: selectedId,
				type,
				content,
				from_user: currentUserId,
			})
			.select()
			.single();

		if (error || !data) {
			updateMessageStatus(selectedId, tempId, { status: "failed" });
			return;
		}
		updateMessageStatus(selectedId, tempId, {
			id: data.id,
			createdAt: data.created_at,
			status: "sent",
		});
	}

	return {
		conversations,
		selectedId,
		setSelectedId,
		currentUserId,
		sendMessage,
		uploadImage,
		isLoading,
	};
}
