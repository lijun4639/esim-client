// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';

export function useWebSocket(userId: string,onMessage: (data: any) => void) {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:3000/ws/web-client?user_id=${userId}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('✅ WebSocket 已连接');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (err) {
                console.error('消息解析失败', err);
            }
        };

        socket.onerror = (err) => {
            console.error('WebSocket 错误', err);
        };

        socket.onclose = () => {
            console.log('❌ WebSocket 已断开');
        };

        return () => {
            socket.close();
        };
    }, [userId]);
}