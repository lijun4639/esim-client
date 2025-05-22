import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/ui/scroll-area.tsx";
import { Message } from "./index.tsx";
import { formatTime } from "@/utils/time.ts";



interface MessageListProps {
	selected: any;
	messages: Message[];
	onResend?: (message: Message) => void;
	onLoadMore: () => void;
	hasMore?: boolean;
	loading?: boolean;
}

const TIME_GAP_MINUTES = 180;

const MessageList: React.FC<MessageListProps> = ({
													 messages,
													 onResend,
													 onLoadMore,
													 hasMore = false,
													 loading = false,
												 }) => {
	const bottomRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// ✅ 自动滚动到底部
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// ✅ 滚动到顶部加载更多
	useEffect(() => {
		const el = scrollRef.current;
		if (!el || !hasMore || loading) return;

		const handleScroll = () => {
			if (el.scrollTop < 50 && onLoadMore) {
				onLoadMore();
			}
		};

		el.addEventListener("scroll", handleScroll);
		return () => el.removeEventListener("scroll", handleScroll);
	}, [hasMore, loading]);

	let lastTimestamp: string | null = null;

	return (
		<ScrollArea
			ref={scrollRef}
			className="h-[calc(100vh-400px)] text-base p-4 bg-gray-100 overflow-y-auto"
		>
			{loading && (
				<div className="text-center text-xs text-gray-500 mb-2">加载中...</div>
			)}

			{messages.map((msg, index) => {
				const isSelf = !!msg.userId;
				const currentTime: any = formatTime(msg.createdAt);
				const lastTime = lastTimestamp ? formatTime(lastTimestamp) : null;
				const shouldShowTime =
					!lastTime || currentTime.diff(lastTime, "minute") > TIME_GAP_MINUTES;

				lastTimestamp = msg.createdAt;

				return (
					<React.Fragment key={msg.id || index}>
						{shouldShowTime && (
							<div className="text-center text-xs text-gray-400 mb-2">
								{currentTime.format("YYYY-MM-DD")}
							</div>
						)}

						<div
							className={`flex items-start gap-2 ${isSelf ? "justify-end" : "justify-start"} mb-5`}
						>
							{!isSelf && (
								<div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-xs font-bold">
									{msg.guestId}
								</div>
							)}

							<div className="flex flex-col items-end gap-1 max-w-[70%]">
								<div
									className={`py-2 px-3 mb-1 shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-lg ${
										isSelf
											? "bg-blue-100 text-right"
											: "bg-white border text-left"
									}`}
								>
									{msg.type === "text" ? (
										<p className="whitespace-pre-wrap break-words">{msg.content}</p>
									) : (
										<img
											src={msg.content}
											alt="uploaded"
											className="rounded max-w-full max-h-[240px]"
										/>
									)}
								</div>
								<div className="text-[12px] text-gray-500">
									{currentTime.format("HH:mm:ss")}
								</div>
								{msg.status === "sending" && (
									<span className="text-[12px] text-gray-400">发送中...</span>
								)}
								{msg.status === "failed" && (
									<button
										className="text-[12px] text-red-500 hover:underline"
										onClick={() => onResend?.(msg)}
									>
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

			<div ref={bottomRef} />
		</ScrollArea>
	);
};

export default MessageList;