import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { Input } from "@/ui/input";
import { ConversationStatusMap } from "./constants";
import { useMemo } from "react";

const statusTabs = [
    { label: "全部", value: "-1" },
    { label: ConversationStatusMap[0], value: "0" },
    { label: ConversationStatusMap[1], value: "1" },
    { label: ConversationStatusMap[2], value: "2" },
];

interface Props {
    tab: string;
    onTabChange: (val: string) => void;
    search: string;
    onSearchChange: (val: string) => void;
    activeList: any[]; // 👈 来自父组件
}

export default function SidebarHeader({
                                          tab,
                                          onTabChange,
                                          search,
                                          onSearchChange,
                                          activeList,
                                      }: Props) {
    // ✅ 只统计 status < 2 的未读数
    const unreadCount = useMemo(() => {
        return activeList.filter(c => c.status < 2 && c.is_unread).length;
    }, [activeList]);

    return (
        <div className="px-3 pt-6">
            <Input
                placeholder="搜索会话"
                defaultValue={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="mb-4"
            />
            <Tabs value={tab} onValueChange={onTabChange}>
                <TabsList className="grid grid-cols-4 text-base">
                    {statusTabs.map((item) => (
                        <TabsTrigger key={item.value} value={item.value}>
                            {item.label}
                            {item.value === "-1" && unreadCount > 0 && (
                                <span className="ml-1 inline-block bg-red-500 text-white text-[10px] px-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
