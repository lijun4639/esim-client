import apiClient from "../apiClient";

// ===== Template Group =====

const getTemplateGroupList = (params: any) => {
    return apiClient.get({
        url: '/template/group',
        params,
    });
};

const createTemplateGroup = (data: any) => {
    return apiClient.post({
        url: '/template/group',
        data,
    });
};

const updateTemplateGroup = (id: string, data: any) => {
    return apiClient.put({
        url: `/template/group/${id}`,
        data,
    });
};

// ✅ 获取所有 group 字典（label: name, value: id）
const getTemplateGroupOptions = () => {
    return apiClient.get({
        url: '/template/group/options',
    });
};

// ===== Template Content =====

const getTemplateContentList = (params: any) => {
    return apiClient.get({
        url: '/template/content',
        params,
    });
};

const createTemplateContent = (data: any) => {
    return apiClient.post({
        url: '/template/content',
        data,
    });
};

const updateTemplateContent = (id: string, data: any) => {
    return apiClient.put({
        url: `/template/content/${id}`,
        data,
    });
};

const deleteTemplateContent = (id: string) => {
    return apiClient.delete({
        url: `/template/content/${id}`,
    });
};

export default {
    // group
    getTemplateGroupList,
    createTemplateGroup,
    updateTemplateGroup,
    getTemplateGroupOptions,

    // content
    getTemplateContentList,
    createTemplateContent,
    updateTemplateContent,
    deleteTemplateContent,
};
