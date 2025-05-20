// pages/Chat.tsx
import { useState } from "react";
import Sidebar from "./sidebar";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import { useChat } from "./useChat";
import {Button} from "@/ui/button";
import ConversationModal from "@/pages/message/chat/conversation-modal.tsx";

export default function Chat() {
	const { conversations, selectedId, setSelectedId,insertConversationByPhone,updateConversation, currentUserId, sendMessage, uploadImage, isLoading } = useChat();

	const [search, setSearch] = useState("");
	const [tab, setTab] = useState<string>("-1");
	const [showEmoji, setShowEmoji] = useState(false);
	const [showPhoneModal, setShowPhoneModal] = useState(false);

	const selected = conversations.find((c) => c.id === selectedId);

	const filteredConversations = conversations.filter((c) => {
		if (tab !== "-1" && String(c.status) !== tab) return false;
		return c.name.includes(search);
	});

	async function handleSendText(text: string) {
		await sendMessage("text", text, selectedId);
		// 如果是聊天中，发完消息需要更新conversation的最后一次时间和最后一次消息方便列表展示，如果是新增一个会话则不需要
		await updateConversation(text ,selectedId);
	}

	async function handleSendImage(file: File) {
		const publicUrl = await uploadImage(file);
		if (!publicUrl) {
			console.error("图片上传失败");
			return;
		}
		await sendMessage("image", publicUrl, selectedId);
		// 如果是聊天中，发完消息需要更新conversation的最后一次时间和最后一次消息方便列表展示，如果是新增一个会话则不需要
		await updateConversation("[图片]",selectedId)
	}
	async function handleInsertConversation({phoneNumber,message}: { phoneNumber: string; message: string }) {
		await insertConversationByPhone({
			phoneNumber,
			message
		})
	}

	return (
		<div className="grid h-[calc(100vh-90px)] grid-cols-[280px_1fr] border  text-sm font-sans overflow-hidden">
			<Sidebar
				tab={tab}
				setTab={setTab}
				search={search}
				setSearch={setSearch}
				conversations={filteredConversations}
				selectedId={selectedId}
				setSelectedId={setSelectedId}
			/>
			<div className="relative flex flex-col h-full">
				<div className="flex items-center space-x-2 justify-between border-b p-5 font-semibold bg-white">
					<span className="text-lg">
						{selected?.name || (isLoading ? "加载中..." : "未选择会话")}
					</span>
					<div>
						<Button variant="outline" onClick={()=>setShowPhoneModal(!showPhoneModal)}>创建会话</Button>
					</div>
				</div>
				<div className="flex flex-col justify-between h-[100%] ">
					<MessageList messages={selected?.messages || []} currentUserId={currentUserId || ""} />
					<ChatInput
						onSendText={handleSendText}
						onSendImage={handleSendImage}
						showEmoji={showEmoji}
						setShowEmoji={setShowEmoji}
					/>
				</div>
			</div>
			<ConversationModal
				open={showPhoneModal}
				onClose={() => setShowPhoneModal(false)}
				onConfirm={handleInsertConversation}
			/>
		</div>
	);
}