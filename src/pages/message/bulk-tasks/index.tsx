import taskService from "@/api/services/taskService";
import messageService from "@/api/services/messageService.ts";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useQuery } from "@tanstack/react-query";
import Table, { type ColumnsType } from "antd/es/table";
// import type { TableRowSelection } from "antd/es/table/interface";
import {useEffect, useState} from "react";
import { useForm } from "react-hook-form";
import type { BulkTasks } from "#/entity";
import TaskModal from "./task-modal";
import {useTemplateStore} from "@/store/templateStore.ts";
import {formatTime, FULL_TIME} from "@/utils/time.ts";
import {usePagination} from "@/hooks/common/usePagination.ts";
import ProgressModal from "./progress-modal";
import DetailModal from "./detail-modal.tsx";
import {Popconfirm} from "antd";

type SearchFormFieldType = Pick<BulkTasks, "name" | "status">;

export const TASK_STATUS_MAP: Record<string, { label: string; color: "default" | "success" | "warning" | "error" | "info" | "cancel" }> = {
	pending: { label: "等待中", color: "warning" },
	processing: { label: "处理中", color: "info" },
	completed: { label: "已完成", color: "success" },
	failed: { label: "失败", color: "error" },
	cancelled: { label: "已取消", color: "cancel" },
};
const STATUS_SELECT_OPTIONS = [
	{ value: "all", label: "所有状态" }, // 👈 默认项
	...Object.entries(TASK_STATUS_MAP).map(([key, val]) => ({
		value: key,
		label: val.label,
		color: val.color,
	})),
];

export default function BulkTasksPage() {
	const [searchParams, setSearchParams] = useState<Partial<SearchFormFieldType>>({});
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: {
			name: '',
			status: undefined,
		},
	});
	const { templateOptions, fetchTemplateOptions } = useTemplateStore();
	const { pagination, handlePaginationChange } = usePagination();
	const [selectedTask, setSelectedTask] = useState<BulkTasks | null>(null);
	const [showProgress, setShowProgress] = useState(false);
	const [showDetail, setShowDetail] = useState(false);
	const [taskSuccessCount, setTaskSuccessCount] = useState(0);

	const [TaskModalPros, setTaskModalProps] = useState<any>({
		formValue: {
			name: "",
			status: "all",
		},
		title: "新增任务",
		show: false,
		onOk: (data:any) => {
			handleOk(data);
		},
		onCancel: () => {
			setTaskModalProps((prev: any) => ({ ...prev, show: false }));
		},
	});

	useEffect(() => {
		fetchTemplateOptions(); // 初次加载
	}, []);

	useEffect(() => {
		if (selectedTask && showProgress) {
			fetchTaskStatus(selectedTask.id); // ⏱ 立即刷新一次任务状态
		}
	}, [selectedTask, showProgress]);

	const handleOk = async (data: any) => {
		if(data.id){
			await taskService.updateTask(data.id, {id: data.id,name: data.name})
		}else {
			const payload: any = {
				name: data.name,
				useTemplate: data.useTemplate,
				taskType: "sms",
				runAt: data.runAt,
				intervalMs: data.intervalMs,
				remark: data.remark
			}
			data.useTemplate === 1? payload.templateId = data.templateId: payload.message = data.message
			const formData = new FormData();

			formData.append("file", data.file);
			formData.append("payload", JSON.stringify(payload));

			console.log(formData)
			await taskService.createTask(formData)
		}
		setTaskModalProps((prev: any) => ({ ...prev, show: false }));
		refetch()
	}

	const handleCancel = (data:any)=>{
		console.log(data)
	}
	const columns: ColumnsType<BulkTasks> = [
		{
			title: "序号",
			dataIndex: "index",
			key: "index",
			render: (_text, _record, index) => {return <span className="text-gray-600">{index + 1}</span>},
			width: 60,
		},
		{ title: "任务名称", dataIndex: "name" },
		{
			title: "计划发送",
			dataIndex: "runAt",
			render: (text: string) => formatTime(text,FULL_TIME),
			sorter: (a:any, b:any) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime(),
		},
		{
			title: "文案来源",
			dataIndex: "useTemplate",
			render:(_text, _record: any)=>{
				if(_text === 1){
					const templateName = templateOptions.find((opt) => opt.value === _record.templateId)?.label || "-"
					return <span>{templateName}</span>
				}else {
					return <span>{_record.message}</span>
				}
			}
		},
		{ title: "目标数量", dataIndex: "phoneCount" },
		{ title: "回复数量", dataIndex: "replayCount" },
		{
			title: "状态",
			dataIndex: "status",
			align: "center",
			render: (status: string) => {
				const { label, color } = TASK_STATUS_MAP[status] || { label: status, color: "default" };
				return <Badge variant={color}>{label}</Badge>;
			},
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			render: (text: string) => formatTime(text,FULL_TIME),
			sorter: (a:any, b:any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		},
		{ title: "备注", dataIndex: "remark" },
		{
			title: "操作",
			key: "operation",
			align: "center",
			width: 230,
			render: (_, record:any) => {
				return(
					<div className="flex w-full justify-center text-gray">
						{
							(record.status === "pending" || "processing") &&
							<Popconfirm
								title="取消确认"
								description="是否要取消此任务?"
								okText="是"
								cancelText="否"
								onConfirm={()=>handleCancel(record)}
							>
								<Button variant="ghost" className="bg-error! text-white hover:text-white" size="sm">
									取消
								</Button>
							</Popconfirm>

						}
						{
							// record.status === "processing" &&
							<Button
								className="ml-2"
								variant="outline"
								size="sm"
								onClick={() => {
									setSelectedTask(record);
									setTaskSuccessCount(0);
									setShowProgress(true);
								}}
							>
								<Icon icon="solar:refresh-circle-outline" size={18} />
								查看进度
							</Button>
						}
						<Button
							className="ml-2"
							variant="outline"
							size="sm"
							onClick={() => {
								setSelectedTask(record);
								setShowDetail(true);
							}}
						>
							<Icon icon="solar:eye-linear" size={18} />详情
						</Button>
					</div>
				)
			},
		},
	];

	// rowSelection objects indicates the need for row selection
	// const rowSelection: TableRowSelection<Organization> = {
	// 	onChange: (selectedRowKeys, selectedRows) => {
	// 		console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
	// 	},
	// 	onSelect: (record, selected, selectedRows) => {
	// 		console.log(record, selected, selectedRows);
	// 	},
	// 	onSelectAll: (selected, selectedRows, changeRows) => {
	// 		console.log(selected, selectedRows, changeRows);
	// 	},
	// };
	// const cancelTask = async (id: string) => {
	// 	const confirm = window.confirm("确定要取消这个任务吗？");
	// 	if (!confirm) return;
	// 	// await taskService.cancelTask(id);
	// 	refetch();
	// };

	const fetchTaskStatus = async (id: string) => {
		const res = await messageService.countConversations({taskId:id})
		setTaskSuccessCount(res.count)
	};
	const { data,refetch,isLoading  } = useQuery({
		queryKey: ["tasks",searchParams,pagination],
		queryFn:()=> taskService.getTaskList({
			...searchParams,
			...pagination,
		}),
	});
	const onSearch = () => {
		const values = searchForm.getValues();
		setSearchParams(values); // 会自动触发 useQuery 请求
	};

	const onSearchFormReset = () => {
		searchForm.reset();
		setSearchParams({}); // 触发一次空条件查询
	};

	const onCreate = () => {
		setTaskModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "创建任务",
			formValue: {
				...prev.formValue,
				useTemplate: 1,
			},
		}));
	};

	// const onEdit = (formValue: BulkTasks) => {
	// 	setTaskModalProps((prev: any) => ({
	// 		...prev,
	// 		show: true,
	// 		title: "编辑任务",
	// 		formValue,
	// 	}));
	// };

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent>
					<Form {...searchForm}>
						<div className="flex items-center gap-4">
							<FormField
								control={searchForm.control}
								name="name"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel className="w-16 text-right shrink-0">任务名称</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="status"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel className="w-10 text-right shrink-0">状态</FormLabel>
										<Select onValueChange={field.onChange} value={field.value ?? "all"}>
											<SelectTrigger className="w-[180px]">
												<SelectValue>
													{field.value && field?.value !== "all" ? (
														<Badge variant={TASK_STATUS_MAP[field.value]?.color}>
															{TASK_STATUS_MAP[field.value]?.label}
														</Badge>
													) : (
														<span className="text-muted-foreground">所有状态</span>
													)}
												</SelectValue>
											</SelectTrigger>
											<SelectContent>
												{STATUS_SELECT_OPTIONS.map((item: any) => (
													<SelectItem key={item.value} value={item.value}>
														{item.color ? (
															<Badge variant={item.color}>{item.label}</Badge>
														) : (
															<span>{item.label}</span> // 所有状态 不加 badge
														)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<div className="flex ml-auto">
								<Button variant="outline" onClick={onSearchFormReset}>
									重置条件
								</Button>
								<Button onClick={onSearch} className="ml-4">查询</Button>
							</div>
						</div>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>群发任务列表</div>
						<Button onClick={onCreate}>创建任务</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						// rowKey="id"
						size="small"
						scroll={{ x: "max-content" }}
						pagination={{
							current: pagination.page,
							pageSize: pagination.pageSize,
							total: data?.pagination?.total || 0,
							showSizeChanger: true,
							onChange: handlePaginationChange,
						}}
						loading={isLoading}
						columns={columns}
						dataSource={data?.list || []}
						// rowSelection={{ ...rowSelection }}
					/>
				</CardContent>
			</Card>
			<TaskModal {...TaskModalPros} templateOptions={templateOptions} />
			{selectedTask && (
				<>
					<ProgressModal
						open={showProgress}
						onClose={() => setShowProgress(false)}
						successCount={taskSuccessCount}
						onRefresh={() => fetchTaskStatus(selectedTask.id)}
						task={selectedTask}
					/>

					<DetailModal
						open={showDetail}
						onClose={() => setShowDetail(false)}
						task={selectedTask}
						templateOptions={templateOptions}
					/>
				</>
			)}
		</div>
	);
}