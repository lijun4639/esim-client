import apiClient from "../apiClient";

// 获取任务列表（支持查询、分页等参数）
const getTaskList = (params: any) => {
    return apiClient.get({
        url: "/task",
        params,
    });
};

// 创建任务
const createTask = (data: any) => {
    return apiClient.post({
        url: "/task",
        data,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// 更新任务（需要传 id）
const updateTask = (id: string, data: any) => {
    return apiClient.put({
        url: `/task/${id}`,
        data,
    });
};

const cancelTask = (id: string) => {
    return apiClient.put({
        url: `/task/cancel/${id}`,
    });
};

export default {
    getTaskList,
    createTask,
    updateTask,
    cancelTask,
};