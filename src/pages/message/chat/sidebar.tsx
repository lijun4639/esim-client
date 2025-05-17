import React from "react";
import { Input } from "@/ui/input.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs.tsx";
import { ScrollArea } from "@/ui/scroll-area.tsx";
import { Tag } from "antd";
import { Conversation } from "./useChat";

export const ConversationStatusMap = {
	0: "未回复",
	1: "已回复",
	2: "已关闭",
	3: "已归档",
} as const;

export type ConversationStatus = keyof typeof ConversationStatusMap;

interface SidebarProps {
	tab: string;
	setTab: (val: string) => void;
	search: string;
	setSearch: (val: string) => void;
	conversations: Conversation[];
	selectedId: string | null;
	setSelectedId: (id: string) => void;
}

const statusTabs = [
	{ label: "全部", value: "-1" },
	{ label: ConversationStatusMap[0], value: "0" },
	{ label: ConversationStatusMap[1], value: "1" },
	{ label: ConversationStatusMap[2], value: "2" },
];

const Sidebar: React.FC<SidebarProps> = ({
	tab,
	setTab,
	search,
	setSearch,
	conversations,
	selectedId,
	setSelectedId,
}) => {
	return (
		<div className="border-r border-gray-200 flex flex-col">
			{/*<div className="flex pl-3 pt-8 pb-3 flex-col">*/}
			{/*    <h3 className="text-xl font-medium">实时会话</h3>*/}
			{/*</div>*/}
			<div className="p-3">
				<Input placeholder="搜索会话" value={search} onChange={(e) => setSearch(e.target.value)} />
			</div>

			<Tabs value={tab} onValueChange={setTab} className="px-3">
				<TabsList className="grid grid-cols-4 text-xs">
					{statusTabs.map((item) => (
						<TabsTrigger key={item.value} value={item.value}>
							{item.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<ScrollArea className="flex-1 mt-3 overflow-y-auto">
				{conversations.map((c) => (
					<div
						key={c.id}
						onClick={() => setSelectedId(c.id)}
						className={`px-3 py-2 cursor-pointer border-b ${selectedId === c.id ? "bg-gray-200" : "hover:bg-gray-100"}`}
					>
						<div className="flex items-center space-x-2">
							<div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" /> {/* 头像占位 */}
							<div className="flex-1">
								<div className="flex justify-between font-medium text-sm truncate">
									<span>{c.name}</span>
									<div className="flex justify-between items-center text-xs text-gray-500 mb-1">
										<span>{c.lastMessageAt || "04-01"}</span> {/* 示例日期 */}
									</div>
								</div>
								<div className="text-xs mt-1 text-gray-500 truncate">{c.lastMessage || "无消息"}</div>
								<div className="mt-2 font-light">
									<Tag
										className="ml-0"
										style={{ fontWeight: 400 }}
										color={c.status === 0 ? "orange" : c.status === 1 ? "green" : c.status === 2 ? "gray" : "gray"}
									>
										{ConversationStatusMap[c.status as ConversationStatus] ?? "未知状态"}
									</Tag>
								</div>
							</div>
						</div>
					</div>
				))}
			</ScrollArea>
		</div>
	);
};

export default Sidebar;
