import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import {formatTime, FULL_TIME} from "@/utils/time";
import {Icon} from "@/components/icon";
import {Card} from "@/ui/card.tsx";
import {TASK_STATUS_MAP} from "./index.tsx";
import {BulkTasks} from "#/entity.ts";
import {useEffect} from "react";

interface ProgressModalProps {
    open: boolean;
    onClose: () => void;
    onRefresh: () => void;
    successCount: number;
    task: BulkTasks;
}

export default function ProgressModal({
                                          open,
                                          onClose,
                                          onRefresh,
                                          task,
                                          successCount=0,
                                      }: ProgressModalProps) {
    const { status, createdAt, phoneCount } = task;

    const progress = phoneCount > 0 ? Math.round((successCount / phoneCount) * 100) : 0;
    const statusInfo = TASK_STATUS_MAP[status] || { label: status, color: "default" };

    useEffect(() => {
        if (!open) return;
        const interval = setInterval(() => {
            onRefresh();
        }, 3000); // 每 3 秒刷新一次
        return () => clearInterval(interval); // 弹窗关闭时清除定时器
    }, [open, onRefresh]);


    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>发送进度</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-base">
                    <div>
                        <div className="font-medium mb-1">执行进度</div>
                        <Progress value={progress} className="h-3 my-1" />
                        <div className="text-base text-muted-foreground mt-1">
                            {successCount} / {phoneCount}（{progress}% 完成度）
                        </div>
                    </div>
                    <Card>
                        <div className="text-base px-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-muted-foreground">任务状态</div>
                                <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground">创建时间</div>
                                <div>{formatTime(createdAt,FULL_TIME)}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground">总发送量</div>
                                <div>{phoneCount} 个号码</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground">发送成功</div>
                                <div className="text-green-600 font-medium">{successCount} 个号码</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <DialogFooter className="mt-4">
                    <div className="flex justify-between w-full">
                        <div className="flex">
                            <Button variant="outline" onClick={onRefresh}>
                                <Icon icon="solar:refresh-circle-outline" size={18} />
                                刷新
                            </Button>
                        </div>
                        <Button onClick={onClose}>关闭</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}