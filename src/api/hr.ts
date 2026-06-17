import api from './axios';
import type { PagedResult, Employee, Department } from '../types';

export const hrApi = {
   getEmployees: (page = 1, pageSize = 10, search = '') =>
    api.get<PagedResult<Employee>>(`/hr/employee?page=${page}&pageSize=${pageSize}&search=${search}`),

    getDepartments: () =>
        api.get<Department[]>(`/hr/department`),

    createEmployee: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        position: string;
        salary: number;
        departmentId: string;
        hireDate: string;
    }) => api.post('/hr/employee', data),

updateEmployee: (id: string, data: {
    firstName: string;
    lastName: string;
    phone: string;
    position: string;
    email: string;
    salary: number;
    departmentId: string;
    hireDate: string;
}) => api.put(`/hr/employee/${id}`, data),

    deleteEmployee: (id: string) =>
        api.delete(`/hr/employee/${id}`),

    createDepartment: (data: {
        name: string;
        description: string;
        parentDepartmentId: string | null;
    }) => api.post('/hr/department', data),
};