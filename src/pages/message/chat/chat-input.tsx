import React, {useRef, useState} from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Icon } from "@/components/icon";
import { Tag } from "antd";

interface ChatInputProps {
	onSend: (type: "text" | "image", content: string | File) => void;
	selected: any;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend,selected }) => {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [showEmoji, setShowEmoji] = useState(false);

	const handleSend = () => {
		const text = inputRef.current?.value.trim();
		if (text) {
			onSend("text", text);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const handleEmojiSelect = (emoji: any) => {
		if (inputRef.current) {
			const cursorPos = inputRef.current.selectionStart;
			const original = inputRef.current.value;
			const updated =
				original.substring(0, cursorPos) + emoji.native + original.substring(cursorPos);
			inputRef.current.value = updated;
			inputRef.current.focus();
		}
		setShowEmoji(false);
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onSend("image", file);
			e.target.value = "";
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		selected?.status !== 2 ? (
			<div className="border-2 p-3 m-3 bottom-0 bg-gray-100 text-lg rounded-lg">
				<div className="flex items-center gap-2 mb-2">
					<Popover open={showEmoji} onOpenChange={setShowEmoji}>
						<PopoverTrigger asChild>
							<Icon
								className="cursor-pointer"
								icon="solar:emoji-funny-circle-line-duotone"
								size="20"
							/>
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
					<input
						type="file"
						accept="image/*"
						className="hidden"
						ref={fileInputRef}
						onChange={handleImageSelect}
					/>
				</div>

				<textarea
					disabled={selected?.status === 2}
					ref={inputRef}
					placeholder="输入消息..."
					className="w-full resize-none min-h-[120px] border-t rounded p-2 outline-none"
					onKeyDown={handleKeyDown}
				/>

				<div className="flex items-start text-gray-500 text-base pt-2 border-t">
					按 <Tag style={{ borderWidth: "1px" }}>Enter</Tag> 发送，
					<Tag style={{ borderWidth: "1px" }}>Shift+Enter</Tag> 换行
				</div>
			</div>
		):
			<div className="h-[100px] mx-3 mb-3 bg-gray-200 border-2 rounded-lg">
				<div className="text-base text-center flex flex-col items-center mt-6">
					<div className="flex items-center gap-2 flex justify-center">
						<Icon icon="solar:lock-bold-duotone"  size={22}/>
						<span className="text-lg">此会话已关闭</span>
					</div>
					<p className="text-gray-500">您只能查看历史消息，无法发送新消息</p>
				</div>
			</div>
	);
};

export default ChatInput;