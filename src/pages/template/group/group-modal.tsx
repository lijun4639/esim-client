import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel,FormRequiredLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {Checkbox} from "@/ui/checkbox.tsx";

export type SimpleFormData = {
	name: string;
	status: number;
};

type SimpleFormProps = {
	show: boolean;
	title: string;
	formValue: Partial<SimpleFormData>;
	onOk: (data: SimpleFormData) => void;
	onCancel: VoidFunction;
};

export default function GroupModal({ show, title, formValue, onOk, onCancel }: SimpleFormProps) {
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

						<FormField
							control={form.control}
							rules={{ required: "请输入模板名称" }}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormRequiredLabel>模板名称</FormRequiredLabel>
									<FormControl><Input placeholder="请输入模板名称" {...field} /></FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="flex items-center space-x-2">
									<FormControl>
										<Checkbox
											checked={field.value === 1}
											onCheckedChange={(v) => field.onChange(v ? 1 : 0)}
										/>
									</FormControl>
									<FormLabel className="text-sm font-normal m-0 cursor-pointer">启用此模板</FormLabel>
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