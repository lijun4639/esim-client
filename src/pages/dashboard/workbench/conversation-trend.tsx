import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart, useChart } from "@/components/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.tsx";
import dashboardService from "@/api/services/dashboardService.ts";
import { Skeleton } from "@/ui/skeleton.tsx";
import type { ApexOptions } from "apexcharts";

interface ConversationTrendProps {
	defaultDays?: number;
}

export default function ConversationTrend({ defaultDays = 7 }: ConversationTrendProps) {
	const [days, setDays] = useState(defaultDays);

	const { data = [], isLoading } = useQuery({
		queryKey: ["dashboard-trend", days],
		queryFn: () => dashboardService.getConversationTrend({ days: String(days) }),
	});

	// ✅ 转为 MM-DD 格式
	const xCategories = data.map(
		(item: any) => item.date.slice(5), // '2025-05-21' => '05-21'
	);

	const series: ApexAxisChartSeries = [
		{
			name: "发起会话数",
			type: "bar",
			data: data.map((item: any) => item.conversationCount ?? 0),
		},
		{
			name: "有回复会话数",
			type: "bar",
			data: data.map((item: any) => item.repliedConversationCount ?? 0),
		},
		{
			name: "回复率",
			type: "line",
			data: data.map((item: any) => (item.replyRate != null ? Number((item.replyRate * 100).toFixed(2)) : 0)),
		},
	];

	return (
		<Card className="flex-col">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>近 {days} 天会话趋势图</span>
					<Select onValueChange={(v) => setDays(Number(v))} defaultValue={String(days)}>
						<SelectTrigger className="w-28">
							<SelectValue placeholder="时间范围" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">近 7 天</SelectItem>
							<SelectItem value="15">近 15 天</SelectItem>
							<SelectItem value="30">近 30 天</SelectItem>
						</SelectContent>
					</Select>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="h-[500px] w-full">
						<Skeleton className="h-full w-full rounded-md" />
					</div>
				) : data.length === 0 ? (
					<div className="h-[500px] flex items-center justify-center text-gray-400">暂无趋势数据</div>
				) : (
					<ChartArea series={series} categories={xCategories} />
				)}
			</CardContent>
		</Card>
	);
}

function ChartArea({
	series,
	categories,
}: {
	series: ApexAxisChartSeries;
	categories: string[];
}) {
	const chartOptions: ApexOptions = useChart({
		chart: {
			type: "line",
			stacked: false,
		},
		stroke: {
			width: [0, 0, 2],
			curve: "smooth",
		},
		plotOptions: {
			bar: {
				columnWidth: "40%",
			},
		},
		xaxis: {
			type: "category",
			categories,
		},
		tooltip: {
			shared: true,
			intersect: false,
			y: {
				formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => {
					return seriesIndex === 2 ? `${val.toFixed(2)}%` : `${val}`;
				},
			},
		},
	});

	return <Chart type="line" series={series} options={chartOptions} height={400} />;
}
