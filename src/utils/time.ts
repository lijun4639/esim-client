// utils/time.ts
import dayjs, {Dayjs} from 'dayjs';


export const FULL_TIME = "YYYY-MM-DD HH:mm:ss";
/**
 * 格式化 Supabase 返回的 UTC 时间为北京时间字符串
 */

// ✅ 函数重载声明
export function formatTime(time: string | Date): Dayjs;
export function formatTime(time: string | Date, format: string): string;

// ✅ 实现签名
export function formatTime(time: string | Date, format?: string): Dayjs | string {
    const base = dayjs.utc(time).tz();
    return format ? base.format(format) : base;
}