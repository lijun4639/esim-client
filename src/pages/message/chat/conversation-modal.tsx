import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

interface ConversationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (payload: { phoneNumber: string; message: string }) => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({ open, onClose, onConfirm }) => {
    const [phoneNumber, setphoneNumber] = useState("");
    const [message, setMessage] = useState("");

    const handleConfirm = () => {
        const trimmedPhoneNumber = phoneNumber.trim();
        const trimmedMessage = message.trim();

        // if (!/^1\d{10}$/.test(trimmedPhoneNumber)) {
        //     alert("请输入正确的手机号");
        //     return;
        // }

        onConfirm({
            phoneNumber: trimmedPhoneNumber,
            message: trimmedMessage || "欢迎使用客服系统",
        });

        // 清空状态
        setphoneNumber("");
        setMessage("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>新建会话</DialogHeader>

                <Input
                    placeholder="请输入手机号"
                    value={phoneNumber}
                    onChange={(e) => setphoneNumber(e.target.value)}
                />

                <Input
                    className="mt-2"
                    placeholder="请输入首条消息（可选）"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>取消</Button>
                    <Button onClick={handleConfirm}>确定</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConversationModal;