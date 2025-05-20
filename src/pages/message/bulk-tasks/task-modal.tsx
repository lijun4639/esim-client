import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import {Form, FormControl, FormField, FormItem, FormMessage, FormRequiredLabel} from "@/ui/form";
import { Input } from "@/ui/input";
import { useForm } from "react-hook-form";
import {Upload, Radio, DatePicker} from "antd";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/ui/select.tsx";
import {Icon} from "@/components/icon";
import {Textarea} from "@/ui/textarea.tsx";
import dayjs from "dayjs";
import {UploadFile} from "antd/es/upload";

export type SimpleFormData = {
	name: string;
	useTemplate: number;
	templateId?: string;
	runAt: string;
	intervalMs: number;
	message?: string;
	remark:string;
	file?: File;
};

type SimpleFormProps = {
	show: boolean;
	title: string;
	formValue: Partial<SimpleFormData>;
	templateOptions: any[];
	onOk: (data: SimpleFormData) => void;
	onCancel: VoidFunction;
};


export default function TaskModal({ show, title, formValue, onOk, onCancel,templateOptions }: SimpleFormProps) {
	const form = useForm<SimpleFormData>({
		shouldUnregister: false,
		defaultValues: {
			useTemplate: 1,
			...formValue,
		},
	});

	// useEffect(() => {
	// 	form.reset(formValue);
	// }, [formValue, form]);

	const useTemplate = form.watch("useTemplate");

	const onSubmit = (data: SimpleFormData) => {
		onOk(data);
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent >
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

						<FormField
							control={form.control}
							rules={{
								required: "请输入任务名称",
								maxLength: { value: 20, message: "任务名称不能超过 20 个字符" },
							}}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormRequiredLabel>任务名称</FormRequiredLabel>
									<FormControl><Input placeholder="请输入任务名称" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex gap-4">
							<div className="flex-1">
								<FormField
									control={form.control}
									name="runAt"
									rules={{
										required: "请选择执行时间",
										validate: (value) => {
											if (!value) return "执行时间不能为空";
											const selected = new Date(value).getTime();
											const now = Date.now();
											return selected > now || "执行时间必须大于当前时间";
										},
									}}
									render={({ field }) => (
										<FormItem>
											<FormRequiredLabel>设定执行时间</FormRequiredLabel>
											<FormControl className="text-sm">
												<DatePicker
													placeholder="请选择执行时间"
													format="YYYY-MM-DD HH:mm"
													showTime={{
														format: "HH:mm",
														showSecond: false,
													}}
													{...field}
													disabledDate={(current) => current && current < dayjs().startOf("day")}
													disabledTime={(date) => {
														if (!date) return {};
														const now = dayjs();
														const isToday = date.isSame(now, "day");
														if (!isToday) return {};
														return {
															disabledHours: () =>
																Array.from({ length: 24 }, (_, i) => i).filter((h) => h < now.hour()),
															disabledMinutes: (h) =>
																h === now.hour()
																	? Array.from({ length: 60 }, (_, i) => i).filter((m) => m < now.minute())
																	: [],
														};
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="w-50"> {/* 可根据需要改宽度 */}
								<FormField
									control={form.control}
									rules={{
										required: "请输入执行间隔时间",
										min: { value: 1, message: "执行间隔不能小于 1 秒" },
										validate: (value) =>
											Number(value) >= 1 || "必须为大于等于 1 的数字",
									}}
									name="intervalMs"
									render={({ field }) => (
										<FormItem>
											<FormRequiredLabel>执行间隔(秒)</FormRequiredLabel>
											<FormControl>
												<Input type="number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<FormField
							control={form.control}
							rules={{ required: "请选择发送信息的方式" }}
							name="useTemplate"
							render={({ field }) => (
								<FormItem>
									{/*<FormLabel>Type</FormLabel>*/}
									<FormControl>
										<Radio.Group defaultValue={0} {...field} style={{marginBottom: "-16px"}}>
											<Radio value={1}>使用模板</Radio>
											<Radio value={0}>自定义文案</Radio>
										</Radio.Group>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							rules={{
								validate: (value) => {
									if (useTemplate === 1 && !value) {
										return "请选择所属模板";
									}
									return true;
								}
							}}
							name="templateId"
							render={({ field }) => (
								<FormItem style={{ display: useTemplate === 1 ? "block" : "none" }}>
									<FormControl >
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="w-[100%]">
												<SelectValue placeholder="请选择模板" />
											</SelectTrigger>
											<SelectContent>
												{templateOptions?.map((opt:any) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage className="mt-2" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							rules={{
								validate: (value) => {
									if (useTemplate === 0 && !value?.trim()) {
										return "请输入自定义文案";
									}
									return true;
								}
							}}
							name="message"
							render={({ field }) => (
								<FormItem style={{ display: useTemplate === 0 ? "block" : "none" }}>
									<FormControl>
										<Textarea
											placeholder="请输入自定义文案"
											value={field.value}
											onChange={field.onChange}
											style={{ width: "100%" }}
										/>
									</FormControl>
									<FormMessage className="m-2" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="file"
							rules={{ required: "请选择上传文件" }}
							render={({ field }) => (
								<FormItem>
									<FormRequiredLabel>目标号码</FormRequiredLabel>
									<FormControl>
										<div className="min-h-[80px]">
											<Upload.Dragger
												multiple={false}
												showUploadList={{ showRemoveIcon: true }}
												beforeUpload={(file) => {
													field.onChange(file); // ✅ 保存 file 对象
													return false;
												}}
												fileList={
													field.value
														? [
															{
																uid: "-1",
																name: field.value.name,
																status: "done",
																originFileObj: field.value,
																lastModified: field.value.lastModified,
																lastModifiedDate: new Date(field.value.lastModified),
																size: field.value.size,
																type: field.value.type,
																percent: 100,
															} as UploadFile
														]
														: []
												}
												onRemove={() => field.onChange(undefined)}
											>
												<p className="ant-upload-drag-icon">
													<Icon icon="solar:cloud-upload-outline" size="50" />
												</p>
												<p className="text-sm">点击或拖拽文件上传</p>
											</Upload.Dragger>
										</div>

									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="remark"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											placeholder="可选择在此处输入备注信息"
											value={field.value}
											onChange={field.onChange}
											style={{ width: "100%" }}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onCancel}>取消</Button>
							<Button type="submit">提交</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}