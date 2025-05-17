// pages/Chat.tsx
import { useState } from "react";
import Sidebar from "./sidebar";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import { useChat } from "./useChat";

function Chat() {
	const { conversations, selectedId, setSelectedId, currentUserId, sendMessage, uploadImage, isLoading } = useChat();

	const [search, setSearch] = useState("");
	const [tab, setTab] = useState<string>("-1");
	const [showEmoji, setShowEmoji] = useState(false);

	const selected = conversations.find((c) => c.id === selectedId);

	const filteredConversations = conversations.filter((c) => {
		if (tab !== "-1" && String(c.status) !== tab) return false;
		return c.name.includes(search);
	});

	async function handleSendText(text: string) {
		await sendMessage("text", text);
	}

	async function handleSendImage(file: File) {
		const publicUrl = await uploadImage(file);
		if (!publicUrl) {
			console.error("图片上传失败");
			return;
		}
		await sendMessage("image", publicUrl);
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
				<div className="border-b p-5 font-semibold bg-white">
					{selected?.name || (isLoading ? "加载中..." : "未选择会话")}
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
		</div>
	);
}

export default Chat;
