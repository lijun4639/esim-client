import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem,FormRequiredLabel } from "@/ui/form";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/ui/select.tsx";
import {Textarea} from "@/ui/textarea.tsx";

export type SimpleFormData = {
	content: string;
	templateId?: string;
	templateOptions: any[];
};

type SimpleFormProps = {
	show: boolean;
	title: string;
	templateId: string;
	formValue: Partial<SimpleFormData>;
	templateOptions: any[];
	onOk: (data: SimpleFormData) => void;
	onCancel: VoidFunction;
};

export default function ContentModal({ show, title, formValue, onOk, onCancel,templateOptions }: SimpleFormProps) {
	const form = useForm<SimpleFormData>({
		defaultValues: formValue
	});

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const onSubmit = (data: SimpleFormData) => {
		onOk(data);
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent   className="w-[800px] max-w-none !w-[800px] !max-w-none"
							 style={{ width: "800px" }}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

						<FormField
							control={form.control}
							rules={{ required: "文案内容不能为空" }}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormRequiredLabel>文案内容</FormRequiredLabel>
									<FormControl><Textarea placeholder="请输入文案" {...field} /></FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="templateId"
							rules={{ required: "请选择所属模板" }}
							render={({ field }) => (
								<FormItem>
									<FormRequiredLabel>所属模板</FormRequiredLabel>
									<FormControl>
										<Select disabled={true} onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="w-[200px]">
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