import { create } from 'zustand';

interface TemplateOption {
    label: string;
    value: string;
}

interface TemplateStore {
    templateOptions: TemplateOption[];
    setTemplateOptions: (options: TemplateOption[]) => void;
    fetchTemplateOptions: () => Promise<void>;
}

import templateService from '@/api/services/templateService'; // 调用你刚才写的接口

export const useTemplateStore = create<TemplateStore>((set) => ({
    templateOptions: [],
    setTemplateOptions: (templateOptions) => set({ templateOptions }),

    fetchTemplateOptions: async () => {
        try {
            const list = await templateService.getTemplateGroupOptions();
            set({ templateOptions: list });
        } catch (err) {
            console.error('获取模板分组失败', err);
        }
    },
}));