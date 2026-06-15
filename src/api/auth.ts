import api from './axios';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
    login: async (data: LoginRequest) => {
        const response = await api.post<LoginResponse>('/auth/login', data);
        
        // حفظ الـ Permissions والـ Roles
        localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
        
        return response;
    }
};