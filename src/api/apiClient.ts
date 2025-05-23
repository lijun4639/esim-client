import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";

import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";

import { toast } from "sonner";
import type { Result } from "#/api";
import { ResultEnum } from "#/enum";
import userService from "@/api/services/userService.ts";
import {removeEmptyParams} from "@/utils/clean.ts";
// const { accessToken } = useUserToken();
// 创建 axios 实例
const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
	withCredentials: true,
});

// 请求拦截
axiosInstance.interceptors.request.use(
	(config) => {
		// 在请求被发送之前做些什么
		const { userToken } = userStore.getState(); // ✅ 获取全局 store 中的 token
		const token = userToken?.accessToken;
		config.headers.Authorization = "Bearer "+token;
		if (config.params) {
			config.params = removeEmptyParams(config.params);
		}
		return config;
	},
	(error) => {
		// 请求错误时做些什么
		return Promise.reject(error);
	},
);

// 响应拦截
axiosInstance.interceptors.response.use(
	(res: AxiosResponse<Result>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));

		const { status, data, message } = res.data;
		// 业务请求成功
		const hasSuccess = data && Reflect.has(res.data, "status") && status === ResultEnum.SUCCESS;
		if (hasSuccess) {
			return data;
		}

		// 业务请求错误
		throw new Error(message || t("sys.api.apiRequestFailed"));
	},
	async (error: AxiosError<Result>) => {
		const { response, message, config  } = error || {};
		const status = response?.status;

		if (status === 401) {
			const originalRequest = config as AxiosRequestConfig & { _retry?: boolean };

			if (!originalRequest._retry) {
				originalRequest._retry = true;
				try {
					const { tokens }: any = await userService.refresh();
					userStore.getState().actions.setUserToken({
						accessToken: tokens.accessToken,
						refreshToken: tokens.refreshToken,
					});

					// 重试原请求
					originalRequest.headers = {
						...originalRequest.headers,
						Authorization: "Bearer " + tokens.accessToken,
					};
					return axiosInstance(originalRequest);
				} catch (refreshErr) {
					// 只有 refresh 失败时才清除用户并提示
					userStore.getState().actions.clearUserInfoAndToken();
					toast.error(t("sys.api.tokenExpired"), {
						position: "top-center",
					});
					return Promise.reject(refreshErr);
				}
			}

			// refresh 失败后仍是 401，再提示
			toast.error(t("sys.api.tokenExpired"), {
				position: "top-center",
			});
			userStore.getState().actions.clearUserInfoAndToken();
			return Promise.reject(error);
		}

		// 对其他非 401 错误，统一提示
		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");
		toast.error(errMsg, {
			position: "top-center",
		});
		return Promise.reject(error);
	},
);

class APIClient {
	get<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "GET" });
	}

	post<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "POST" });
	}

	put<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "PUT" });
	}

	delete<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "DELETE" });
	}

	request<T = any>(config: AxiosRequestConfig): Promise<T> {
		return new Promise((resolve, reject) => {
			axiosInstance
				.request<any, AxiosResponse<Result>>(config)
				.then((res: AxiosResponse<Result>) => {
					resolve(res as unknown as Promise<T>);
				})
				.catch((e: Error | AxiosError) => {
					reject(e);
				});
		});
	}
}


export default new APIClient();
