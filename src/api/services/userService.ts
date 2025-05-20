import apiClient from "../apiClient";
import { supabase } from '@/supabase/client'


import type { UserInfo, UserToken } from "#/entity";

export interface SignInReq {
	email: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	// email: string;
}
export type SignInRes = UserToken & { user: UserInfo };

const esimFunUrl = "http://localhost:3000";
export enum UserApi {
	// SignIn = "/auth/signin",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh",
	User = "/user",
	FunGuestToken = esimFunUrl+"/generate-token",
}

const signin = (data: SignInReq) =>{
	return supabase.auth.signInWithPassword(data)
	// return apiClient.post<SignInRes>({ url: UserApi.SignIn, data});
}


const signup = () =>{
	return supabase.auth.signUp({
		email: '11554639@qq.com',
		password: '12345678',
		options: {
			data: {
				username: 'superadmin'
			}
		}
	})
	// apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
}

const logout = () => apiClient.get({ url: UserApi.Logout });
const findById = (id: string) =>
	apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

export default {
	signin,
	signup,
	findById,
	logout,
};
