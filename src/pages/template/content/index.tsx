import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { useQuery } from "@tanstack/react-query";
import Table, { type ColumnsType } from "antd/es/table";
// import type { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TemplateContent } from "#/entity";
import ContentModal from "./content-modal.tsx";
import templateService from "@/api/services/templateService";
import { formatTime, FULL_TIME } from "@/utils/time.ts";
import { useSearchParams } from "@/routes/hooks";
import { useTemplateStore } from "@/store/templateStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Popconfirm, Tooltip } from "antd";
import { usePagination } from "@/hooks/common/usePagination.ts";

export default function TemplateContentPage() {
	const searchUrlParams = useSearchParams();
	const templateId = searchUrlParams.get("templateId");
	const { pagination, handlePaginationChange, resetPage } = usePagination();
	const { templateOptions, fetchTemplateOptions } = useTemplateStore();

	useEffect(() => {
		fetchTemplateOptions(); // 初次加载
	}, []);

	const searchForm = useForm<any>({
		defaultValues: {
			content: "",
			templateId,
		},
	});
	const watchedTemplateId = searchForm.watch("templateId");
	const [searchParams, setSearchParams] = useState<any>({ templateId });
	const [contentModalPros, setContentModalProps] = useState<any>({
		formValue: {
			content: "",
			templateId: watchedTemplateId,
		},
		title: "文案处理",
		show: false,
		onOk: (data: any) => {
			handleOk(data);
		},
		onCancel: () => {
			setContentModalProps((prev: any) => ({ ...prev, show: false }));
		},
	});

	const handleOk = async (data: any) => {
		if (data.id) {
			await templateService.updateTemplateContent(data.id, { id: data.id, content: data.content });
		} else {
			const params = { ...data };
			await templateService.createTemplateContent(params);
		}
		setContentModalProps((prev: any) => ({ ...prev, show: false }));
		refetch();
	};

	const handleDelete = async (item: any) => {
		await templateService.deleteTemplateContent(item.id);
		refetch();
	};
	useEffect(() => {
		if (watchedTemplateId) {
			const currentValues = searchForm.getValues();
			resetPage();
			setSearchParams(currentValues); // ⬅️ 会触发 useQuery 自动查询
		}
	}, [watchedTemplateId]);

	const columns: ColumnsType<TemplateContent> = [
		{
			title: "序号",
			dataIndex: "index",
			key: "index",
			render: (_text, _record, index) => {
				return <span className="text-gray-600">{index + 1}</span>;
			},
			width: 60,
		},
		{
			title: "文案内容",
			dataIndex: "content",
			ellipsis: true,
			render: (text: string) => (
				<Tooltip title={text}>
					<span className="inline-block max-w-[300px] truncate align-middle">{text}</span>
				</Tooltip>
			),
		},
		{
			title: "所属模板",
			dataIndex: "templateId",
			render: (templateId: string) => templateOptions.find((opt) => opt.value === templateId)?.label || "-",
		},
		{ title: "创建时间", dataIndex: "createdAt", render: (text: string) => formatTime(text, FULL_TIME) },
		{
			title: "操作",
			key: "operation",
			align: "center",
			width: 120,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Popconfirm
						title="删除确认"
						description="是否要删除此项文案?"
						okText="是"
						cancelText="否"
						onConfirm={() => handleDelete(record)}
					>
						<Button variant="ghost" size="icon">
							<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	// rowSelection objects indicates the need for row selection
	// const rowSelection: TableRowSelection<TemplateContent> = {
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

	// ✅ 自动触发：searchParams 变化时查询
	const { data, refetch, isLoading } = useQuery({
		queryKey: ["template-groups", searchParams, pagination],
		queryFn: () =>
			!!watchedTemplateId &&
			templateService.getTemplateContentList({
				...searchParams,
				...pagination,
			}),
		// enabled: false
	});
	const onSearch = () => {
		const values = searchForm.getValues();
		setSearchParams(values); // 会自动触发 useQuery 请求
		resetPage();
	};

	const onSearchFormReset = () => {
		searchForm.reset();
		setSearchParams({ templateId, content: "" }); // 触发一次空条件查询
		resetPage();
	};

	const onCreate = () => {
		setContentModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "创建文案",
			formValue: {
				...prev.formValue,
				templateId: watchedTemplateId,
			},
		}));
	};

	const onEdit = (formValue: TemplateContent) => {
		setContentModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "编辑文案",
			formValue,
		}));
	};

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent>
					<Form {...searchForm}>
						<div className="flex items-center gap-4">
							<FormField
								control={searchForm.control}
								name="templateId"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel className="w-16 text-right shrink-0">所属模板</FormLabel>
										<FormControl className="w-[220px]">
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger className="w-[200px]">
													<SelectValue placeholder="请选择状态" />
												</SelectTrigger>
												<SelectContent>
													{templateOptions?.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="content"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel className="w-16 text-right shrink-0">任务名称</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="flex ml-auto">
								<Button variant="outline" disabled={!watchedTemplateId} onClick={onSearchFormReset}>
									重置条件
								</Button>
								<Button className="ml-4" disabled={!watchedTemplateId} onClick={onSearch}>
									查询
								</Button>
							</div>
						</div>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>文案列表</div>
						<Button disabled={!watchedTemplateId} onClick={onCreate}>
							创建文案
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="id"
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
			<ContentModal {...contentModalPros} templateOptions={templateOptions} />
		</div>
	);
}
