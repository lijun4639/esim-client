import React, { useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Icon } from "@/components/icon";
import { Tag } from "antd";

interface ChatInputProps {
	onSendText: (text: string) => void;
	onSendImage: (file: File) => void;
	showEmoji: boolean;
	setShowEmoji: (v: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendText, onSendImage, showEmoji, setShowEmoji }) => {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSend = () => {
		const text = inputRef.current?.value.trim();
		if (text) {
			onSendText(text);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const handleEmojiSelect = (emoji: any) => {
		if (inputRef.current) {
			inputRef.current.value += emoji.native;
			inputRef.current.focus();
		}
		setShowEmoji(false);
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			onSendImage(e.target.files[0]);
			e.target.value = "";
		}
	};

	return (
		<div className="border-2 p-3 m-3 bottom-0 bg-gray-100 text-lg rounded-lg">
			<div className="flex items-center gap-2 mb-2">
				<Popover open={showEmoji} onOpenChange={setShowEmoji}>
					<PopoverTrigger asChild>
						<Icon className="cursor-pointer" icon="solar:emoji-funny-circle-line-duotone" size="20" />
						{/*<Button size="sm" variant="ghost"></Button>*/}
					</PopoverTrigger>
					<PopoverContent className="w-[300px] h-[350px] p-0">
						<Picker data={data} onEmojiSelect={handleEmojiSelect} previewPosition="none" />
					</PopoverContent>
				</Popover>
				<Icon
					className="cursor-pointer ml-2"
					onClick={() => fileInputRef.current?.click()}
					icon="solar:gallery-bold-duotone"
					size="18"
				/>
				{/*<div 📷</div>*/}
				<input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
			</div>

			<textarea
				ref={inputRef}
				placeholder="输入消息..."
				className="w-full resize-none min-h-[120px] border-t rounded p-2 outline-none"
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						handleSend();
					}
				}}
			/>
			<div className="flex items-start text-gray-500 text-base pt-2 border-t">
				按 <Tag style={{ borderWidth: "1px" }}>Enter</Tag> 发送， <Tag style={{ borderWidth: "1px" }}>Shift+Enter</Tag>{" "}
				换行
			</div>
		</div>
	);
};

export default ChatInput;
