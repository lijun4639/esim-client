import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {formatTime, FULL_TIME} from "@/utils/time";
import { Icon } from "@/components/icon";
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/ui/card";
import {BulkTasks} from "#/entity.ts";
import {useRouter} from "@/routes/hooks";
import { TASK_STATUS_MAP } from "./index.tsx";

interface DetailModalProps {
    open: boolean;
    onClose: () => void;
    task: BulkTasks;
    templateOptions: any[]
}

export default function DetailModal({ open, onClose, task,templateOptions }: DetailModalProps) {
    const router = useRouter();
    const statusInfo = TASK_STATUS_MAP[task.status] || { label: task.status, color: "default" };

    const SourceDom = ()=>{
        if(task.useTemplate === 1){
            const templateName = templateOptions.find((opt) => opt.value === task.templateId)?.label || "-"
            return <Badge variant="outline" className="text-sm">{templateName}</Badge>
        }else {
            return <span>{task.message}</span>
        }
    }
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-[600px] text-base">
                <DialogHeader>
                    <DialogTitle>任务详情</DialogTitle>
                    {/*<p className="text-sm text-muted-foreground">查看任务 "{task.id}" 的详细信息</p>*/}
                </DialogHeader>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Icon icon="solar:info-square-linear" className="text-muted-foreground mr-1" />
                            <span>基本信息</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="mt-[-5px] space-y-2">
                            <div className="flex gap-2">
                                <label className="text-muted-foreground w-[80px]">任务名称：</label>
                                <span className="font-semibold">{task.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <label className="text-muted-foreground w-[80px]">任务 ID：</label>
                                <span className="">#{task.id}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="text-muted-foreground w-[80px]">状态：</label>
                                <Badge variant={statusInfo.color}>
                                    {statusInfo.label}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <label className="text-muted-foreground w-[80px]">创建时间：</label>
                                {formatTime(task.createdAt, FULL_TIME)}
                            </div>
                            <div className="flex gap-2">
                                <label className="text-muted-foreground w-[80px]">计划发送：</label>
                                {formatTime(task.runAt, FULL_TIME)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Icon icon="solar:chat-round-dots-line-duotone" className="text-muted-foreground mr-1" />
                            <span>消息发送</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mt-[-5px]">
                            <div className="flex gap-2">
                                <label className="text-muted-foreground w-[80px]">目标数量：</label>
                                <span>{task.phoneCount} 个号码</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Icon icon="solar:document-text-broken" className="text-muted-foreground mr-1" />
                            <span>文案信息</span>
                        </CardTitle>
                        <CardDescription>卡片的简要描述信息</CardDescription>
                        {
                            task.useTemplate === 1 &&
                            <CardAction>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/template/content?templateId=${task.templateId}`)}
                                    size="sm">
                                    <Icon icon="solar:eye-outline" size={15} />预览文案
                                </Button>
                            </CardAction>
                        }

                    </CardHeader>

                    <CardContent>
                        <div className="space-y-2 mt-[-5px]">
                            <div className="flex gap-2">
                                <label className="text-muted-foreground w-[80px]">文案来源：</label>
                                <SourceDom />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>关闭</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
