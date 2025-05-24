import glass_bag from "@/assets/images/glass/ic_glass_bag.png";
import glass_buy from "@/assets/images/glass/ic_glass_buy.png";
import glass_message from "@/assets/images/glass/ic_glass_message.png";
import glass_users from "@/assets/images/glass/ic_glass_users.png";
import { themeVars } from "@/theme/theme.css.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.tsx";
import { Title } from "@/ui/typography.tsx";
import AnalysisCard from "../analysis/analysis-card.tsx";
import { useEffect, useState } from "react";
import Table from "antd/es/table";
import ConversationTrend from "./conversation-trend.tsx";
import dashboardService from "@/api/services/dashboardService.ts";
import { formatTime, FULL_TIME } from "@/utils/time.ts";
import { Icon } from "@/components/icon";

function Analysis() {
	const [overview, setOverview] = useState<any>([]);

	useEffect(() => {
		fetchOverview();
	}, []);

	const columns = [
		{
			title: "序号",
			dataIndex: "index",
			key: "index",
			render: (_text: string, _record: any, index: number) => {
				return <span className="text-gray-600">{index + 1}</span>;
			},
			width: 60,
		},
		{ title: "日期", dataIndex: "date", key: "date" },
		{ title: "发送消息", dataIndex: "messageCount", key: "messageCount" },
		{ title: "回复消息", dataIndex: "replyCount", key: "replyCount" },
		{ title: "发起会话", dataIndex: "conversationCount", key: "conversationCount" },
		{ title: "回复过的会话", dataIndex: "repliedConversationCount", key: "repliedConversationCount" },
		{
			title: "回复率",
			dataIndex: "replyRate",
			key: "replyRate",
			render: (val: number) => (val === 0 ? "0%" : `${(val * 100).toFixed(2)}%`),
		},
	];

	const fetchOverview = async () => {
		try {
			const response = await dashboardService.getOverview();
			setOverview(response);
		} catch (error) {}
	};

	return (
		<div className="p-2">
			<Title className="text-2xl" as="h4">
				数据概览
			</Title>
			{overview?.updatedAt && (
				<p className="text-gray-600 text-sm mt-1 pb-2">
					<Icon icon="solar:clock-circle-linear" size={14} className="mr-1" />
					更新时间: {formatTime(overview.updatedAt, FULL_TIME)}
				</p>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
				<AnalysisCard
					cover={glass_bag}
					title={overview?.overview?.messageTotal}
					subtitle="平台总发送量"
					style={{
						color: themeVars.colors.palette.success.dark,
						backgroundColor: `rgba(${themeVars.colors.palette.success.defaultChannel} / .2)`,
					}}
				/>
				<AnalysisCard
					cover={glass_users}
					title={overview?.overview?.replyTotal}
					subtitle="平台总回复量"
					style={{
						color: themeVars.colors.palette.info.dark,
						backgroundColor: `rgba(${themeVars.colors.palette.info.defaultChannel} / .2)`,
					}}
				/>
				<AnalysisCard
					cover={glass_buy}
					title={overview?.overview?.conversationTotal}
					subtitle="平台总发起会话"
					style={{
						color: themeVars.colors.palette.warning.dark,
						backgroundColor: `rgba(${themeVars.colors.palette.warning.defaultChannel} / .2)`,
					}}
				/>
				<AnalysisCard
					cover={glass_message}
					title={overview?.overview?.repliedConversationTotal}
					subtitle="有过回复的会话数量"
					style={{
						color: themeVars.colors.palette.error.dark,
						backgroundColor: `rgba(${themeVars.colors.palette.error.defaultChannel} / .2)`,
					}}
				/>
			</div>

			<Card className="mt-8">
				<CardHeader>
					<CardTitle>近五日统计表</CardTitle>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="id"
						size="small"
						scroll={{ x: "max-content" }}
						pagination={false}
						columns={columns}
						dataSource={overview?.dailyStats || []}
					/>
				</CardContent>
			</Card>

			<div className="flex mt-8">
				<div className="flex-1">
					<ConversationTrend defaultDays={7} />
				</div>

				{/*<div className="flex flex-col w-[30%] ml-4">*/}
				{/*	<div className="h-[100px] border-2 bg-gray-200 rounded-xl mb-4">*/}
				{/*	</div>*/}
				{/*	<Card className="flex-1">*/}

				{/*	</Card>*/}
				{/*</div>*/}
			</div>
		</div>
	);
}

export default Analysis;
