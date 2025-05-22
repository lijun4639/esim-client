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
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Organization } from "#/entity";
import GroupModal from "./group-modal.tsx";
import templateService from "@/api/services/templateService";
import {formatTime, FULL_TIME} from "@/utils/time.ts";
import {useRouter} from "@/routes/hooks";
import {usePagination} from "@/hooks/common/usePagination.ts";

type SearchFormFieldType = Pick<Organization, "name" | "status">;

export default function TemplateGroupPage() {

	const router = useRouter();

	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: {
			name: "",
			status: undefined,
		},
	});

	const [searchParams, setSearchParams] = useState<Partial<SearchFormFieldType>>({});
	const { pagination, handlePaginationChange,resetPage } = usePagination();
	const [groupModalPros, setGroupModalProps] = useState<any>({
		formValue: {
			name: "",
			status: 1,
		},
		title: "新增任务",
		show: false,
		onOk: (data:any) => {
			handleOk(data)
		},
		onCancel: () => {
			setGroupModalProps((prev: any) => ({ ...prev, show: false }));
		},
	});

	const handleOk = async (data: any) => {
		if(data.id){
			await templateService.updateTemplateGroup(data.id, {id: data.id,name: data.name})
		}else {
			const params = {...data, type:"sms"}
			await templateService.createTemplateGroup(params)
		}
		setGroupModalProps((prev: any) => ({ ...prev, show: false }));
		refetch()
	}


	const columns: ColumnsType<Organization> = [
		{
			title: "序号",
			dataIndex: "index",
			key: "index",
			render: (_text, _record, index) => {return <span className="text-gray-600">{index + 1}</span>},
			width: 60,
		},
		{
			title: "模板名称",
			dataIndex: "name",
			render: (text: string, record: any) => (
				<div
					className=" underline font-bold cursor-pointer"
					onClick={() => router.push(`/template/content?templateId=${record.id}`)}
				>
					<Icon className="mr-2" icon="solar:link-bold" size={14} />
					{text}
				</div>
			),
		},
		{ title: "创建时间", dataIndex: "createdAt" ,render: (text: string) => formatTime(text,FULL_TIME) },
		{ title: "文案数量", dataIndex: "contentCount" },
		{
			title: "状态",
			dataIndex: "status",
			render: (status) => (
				<Badge variant={status === 1 ? "success" : "error"}>
					{status === 1?"启用":"未启用"}
				</Badge>
			),
		},
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
					{/*<Button variant="ghost" size="icon">*/}
					{/*	<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />*/}
					{/*</Button>*/}
				</div>
			),
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

// ✅ 自动触发：searchParams 变化时查询
	const { data,refetch,isLoading } = useQuery({
		queryKey: [
			"template-groups",
			searchParams,
			pagination.page,
			pagination.pageSize,
		],
		queryFn: () => templateService.getTemplateGroupList({
			...searchParams,
			page: pagination.page,
			pageSize: pagination.pageSize,
		}),
		// enabled: false
	});
	const onSearch = () => {
		const values = searchForm.getValues();
		setSearchParams(values); // 会自动触发 useQuery 请求
		resetPage()
	};

	const onSearchFormReset = () => {
		searchForm.reset();
		setSearchParams({}); // 触发一次空条件查询
		resetPage()
	};

	const onCreate = () => {
		setGroupModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "创建模板",
			formValue: {
				...prev.formValue,
				name: "",
			},
		}));
	};

	const onEdit = (formValue: Organization) => {
		setGroupModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "编辑模板",
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
										<Select clearable onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="w-[180px]">
												{
													!!field.value &&
													<SelectValue placeholder="选择状态" />
												}

											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<Badge variant="success">启用</Badge>
												</SelectItem>
												<SelectItem value="0">
													<Badge variant="error">未启用</Badge>
												</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<div className="flex ml-auto">
								<Button variant="outline" onClick={onSearchFormReset}>
									重置条件
								</Button>
								<Button className="ml-4" onClick={onSearch}>查询</Button>
							</div>
						</div>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>模板列表</div>
						<Button onClick={onCreate}>创建任务</Button>
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
			<GroupModal {...groupModalPros} />
		</div>
	);
}