import SidebarHeader from "./sidebar-header.tsx";
import ConversationList from "./conversation-list.tsx";
import { useChatConversations } from "./useChatConversations";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";

interface Props {
    onSelected: (data:any) => void;
}

const Sidebar = forwardRef((props: Props,ref)=> {
    const { onSelected} = props;

    const [tab, setTab] = useState("-1");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // ✅ 获取当前 tab 对应的数据
    const {
        list,
        loadMore,
        hasMore,
        archiveConversation,
        loading,
        updateConversationById,
        markIsUnRead,
    } = useChatConversations({
        tab: tab,
        keyword: search,
    });
    useImperativeHandle(ref, () => ({
        updateConversationById,
        markIsUnRead,
    }));

    useEffect(() => {
        // 默认选中第一个
        if (!selectedId && list.length > 0) {
            setSelectedId(list[0].id);
        }
        // ✅ 同步选中的项给父组件
        if (onSelected) {
            const selectedItem = list.find(item => item.id === selectedId) || null;
            onSelected(selectedItem);
        }
    }, [list, selectedId]);

    useEffect(() => {
        if(selectedId){

            markIsUnRead(selectedId,false)
        }
    },[selectedId])

    return (
        <div className="border-r border-gray-200 flex flex-col">
            <SidebarHeader
                tab={tab}
                onTabChange={setTab}
                search={search}
                onSearchChange={setSearch}
                activeList={list} // ✅ 传入
            />
            <ConversationList
                list={list}
                loadMore={loadMore}
                hasMore={hasMore}
                archiveConversation={archiveConversation}
                loading={loading}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
        </div>
    );
})
export default Sidebar;