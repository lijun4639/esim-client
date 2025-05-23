import {useEffect, useMemo, useRef, useState} from "react";
import Sidebar from "./sidebar/index.tsx";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import {useConversationMessagesCache} from "./useConversationMessagesCache.ts";
import {supabase} from "@/supabase/client.ts";
import userStore from "@/store/userStore.ts";
import {useWebSocket} from "@/hooks/common/useWebSocket.ts";

export interface Message {
	id?: number;
	userId?: string;
	type: "text" | "image";
	content: string;
	createdAt: string;
	status?: "sending" | "sent" | "failed";
	guestId?: string;
	conversationId?: string;
}

export default function Chat() {
	const [selected, setSelected] = useState<any>(null);
	const {userInfo} = userStore.getState()
	const selectedIdRef = useRef<string | null>(null);
	const sidebarRef = useRef<any>(null);

	const selectedId = useMemo(() => {
		if (selected) {
			return selected.id;
		}
		return null;
	}, [selected])

	useEffect(() => {
		// 闭包陷阱，在websocket中导致 selectedIdRef 始终是 null
		selectedIdRef.current = selectedId;
	}, [selectedId]);

	const {
		messages,
		loadMore,
		hasMore,
		loading,
		sendMessage,
		appendMessage,
	} = useConversationMessagesCache(selectedId,userInfo.id);

	useWebSocket(userInfo.id as string, (msg) => {
		console.log(msg)
		if (msg.type === 'web-chat-message') {
			const newMessage: any = msg.payload;
			const currentSelectedId = selectedIdRef.current;
			if (newMessage.conversationId === currentSelectedId) {
				// ✅ 当前正在查看的会话
				appendMessage(currentSelectedId,{
					...newMessage,
					status: "sent",
				});
			} else {
				// ✅ 非当前会话，可能要显示未读红点
				sidebarRef.current?.markIsUnRead?.(newMessage.conversationId,true);
			}

			// ✅ 更新 Sidebar 中对应会话的 lastMessage 和 lastMessageAt
			sidebarRef.current?.updateConversationById?.(newMessage.conversationId, {
				lastMessage: newMessage.content,
				status: 0,
			});
		}
	});
	async function uploadImage(file: File): Promise<string | null> {
		const filename = `${Date.now()}-${file.name}`;
		const { data, error } = await supabase.storage.from("chat-images").upload(`user-123/${filename}`, file);

		if (error || !data) return null;

		return supabase.storage.from("chat-images").getPublicUrl(data.path).data.publicUrl;
	}
	return (
		<div className="grid h-[calc(100vh-90px)] grid-cols-[280px_1fr] border  text-sm font-sans overflow-hidden">
			<Sidebar
				ref={sidebarRef}
				onSelected={setSelected}
			/>
			<div className="relative flex flex-col h-full">
				<div className="flex items-center space-x-2 justify-between border-b p-5 font-semibold bg-white">
					<span className="text-lg">
						{selected?.name || ""}
					</span>
				</div>
				<div className="flex flex-col justify-between h-[100%] ">
					<MessageList
						messages={messages}
						hasMore={hasMore}
						loading={loading}
						onLoadMore={loadMore}
						selected={selected}
					/>
					<ChatInput
						selected={selected}
						onSend={async (type, content) => {
							if (type === "image" && content instanceof File) {
								const url = await uploadImage(content);
								if (url) sendMessage("image", url);
							} else if (type === "text" && typeof content === "string") {
								sendMessage("text", content);
							}
							sidebarRef.current?.updateConversationById(selectedId, {lastMessage: content,status:1});
						}}
					/>
				</div>
			</div>
		</div>
	);
}