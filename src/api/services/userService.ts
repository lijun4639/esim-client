import apiClient from '../apiClient';

interface LoginParams {
	email: string;
	password: string;
}

interface LoginResult {
	user: any;
}

interface RefreshResult {
	user: any;
}

const signin = async (data: LoginParams): Promise<LoginResult> => {
	return apiClient.post({url:'/auth/login', data});
};

const signup = async (params: LoginParams): Promise<LoginResult> => {
	return apiClient.post({url:'/auth/signup', params});
}
const getUserInfo = async (params: LoginParams): Promise<LoginResult> => {
	return apiClient.get({url:'/auth/user', params});
}

const refresh = async (): Promise<RefreshResult> => {
	return apiClient.post({
		url: '/auth/refresh',
	});
};

const logout = async (): Promise<void> => {
	return apiClient.post({url: '/auth/logout'});
};

export default {
	signin,
	signup,
	getUserInfo,
	refresh,
	logout,
};