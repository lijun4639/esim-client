import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/ui/scroll-area.tsx";
import { Message } from "./useChat";
import dayjs from "dayjs";

interface MessageListProps {
	messages: Message[];
	currentUserId: string;
	onResend?: (message: Message) => void;
}

const TIME_GAP_MINUTES = 180;

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, onResend }) => {
	const bottomRef = useRef<HTMLDivElement>(null);

	// 自动滚动到底部
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	let lastTimestamp: string | null = null;

	return (
		<ScrollArea className="h-[calc(100vh-400px)] text-base p-4 bg-gray-100 overflow-y-auto">
			{messages.map((msg, index: number) => {
				const isSelf = msg.from_user === currentUserId;
				const currentTime = dayjs(msg.createdAt);
				const lastTime = lastTimestamp ? dayjs(lastTimestamp) : null;
				const shouldShowTime = !lastTime || currentTime.diff(lastTime, "minute") > TIME_GAP_MINUTES;

				lastTimestamp = msg.createdAt;

				return (
					<React.Fragment key={msg.id || index}>
						{/* 时间间隔大于 5 分钟，则显示日期标签 */}
						{shouldShowTime && (
							<div className="text-center text-xs text-gray-400 mb-2">{currentTime.format("YYYY-MM-DD")}</div>
						)}

						{/* 消息气泡 + 头像 */}
						<div className={`flex items-start gap-2 ${isSelf ? "justify-end" : "justify-start"} mb-5`}>
							{!isSelf && (
								<div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-xs font-bold">
									{msg.from_user}
								</div>
							)}

							<div className="flex flex-col items-end gap-1 max-w-[70%] ">
								<div
									className={`py-2 px-3 mb-1 shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-lg ${isSelf ? "bg-blue-100 text-right" : "bg-white border text-left"}`}
								>
									{msg.type === "text" ? (
										<p className="whitespace-pre-wrap break-words">{msg.content}</p>
									) : (
										<img src={msg.content} alt="uploaded" className="rounded max-w-full max-h-[240px]" />
									)}
								</div>
								<div className="text-[12px] text-gray-500">{currentTime.format("HH:mm:ss")}</div>
								{msg.status === "sending" && <span className="text-[12px] text-gray-400">发送中...</span>}
								{msg.status === "failed" && (
									<button className="text-[12px] text-red-500 hover:underline" onClick={() => onResend?.(msg)}>
										发送失败，点击重试
									</button>
								)}
							</div>

							{isSelf && (
								<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
									我
								</div>
							)}
						</div>
					</React.Fragment>
				);
			})}

			{/* 底部锚点 */}
			<div ref={bottomRef} />
		</ScrollArea>
	);
};

export default MessageList;
