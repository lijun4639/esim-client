import {useMemo, useState} from "react";
import Sidebar from "./sidebar/index.tsx";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import {useConversationMessagesCache} from "./useConversationMessagesCache.ts";
import {supabase} from "@/supabase/client.ts";
import userStore from "@/store/userStore.ts";

export interface Message {
	id?: number;
	userId?: string;
	type: "text" | "image";
	content: string;
	createdAt: string;
	status?: "sending" | "sent" | "failed";
	guestId?: string;
}

export default function Chat() {
	const [selected, setSelected] = useState<any>(null);
	const {userInfo} = userStore.getState()
	const selectedId = useMemo(() => {
		if (selected) {
			return selected.id;
		}
		return null;
	}, [selected])

	const {
		messages,
		loadMore,
		hasMore,
		loading,
		sendMessage
	} = useConversationMessagesCache(selectedId,userInfo.id);

	// async function handleSendText(text: string) {
	// 	await sendMessage("text", text, selected.id);
	// 	// 如果是聊天中，发完消息需要更新conversation的最后一次时间和最后一次消息方便列表展示，如果是新增一个会话则不需要
	// 	await updateConversation(text ,selected.id);
	// }
	//
	// async function handleSendImage(file: File) {
	// 	const publicUrl = await uploadImage(file);
	// 	if (!publicUrl) {
	// 		console.error("图片上传失败");
	// 		return;
	// 	}
	// 	await sendMessage("image", publicUrl, selected.id);
	// 	// 如果是聊天中，发完消息需要更新conversation的最后一次时间和最后一次消息方便列表展示，如果是新增一个会话则不需要
	// 	await updateConversation("[图片]",selected.id)
	// }
	async function uploadImage(file: File): Promise<string | null> {
		const filename = `${Date.now()}-${file.name}`;
		const { data, error } = await supabase.storage.from("chat-images").upload(`user-123/${filename}`, file);

		if (error || !data) return null;

		return supabase.storage.from("chat-images").getPublicUrl(data.path).data.publicUrl;
	}
	return (
		<div className="grid h-[calc(100vh-90px)] grid-cols-[280px_1fr] border  text-sm font-sans overflow-hidden">
			<Sidebar
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
						onSend={async (type, content) => {
							if (type === "image" && content instanceof File) {
								const url = await uploadImage(content);
								if (url) sendMessage("image", url);
							} else if (type === "text" && typeof content === "string") {
								sendMessage("text", content);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}