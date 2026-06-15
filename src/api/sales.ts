import api from './axios';
import type { PagedResult, SalesOrder, Customer, Invoice } from '../types';

export const salesApi = {
    getOrders: (page = 1, pageSize = 10) =>
        api.get<PagedResult<SalesOrder>>(`/sales/salesorder?page=${page}&pageSize=${pageSize}`),

    getCustomers: (page = 1, pageSize = 10) =>
        api.get<PagedResult<Customer>>(`/sales/customer?page=${page}&pageSize=${pageSize}`),

    getInvoices: (page = 1, pageSize = 10) =>
        api.get<PagedResult<Invoice>>(`/sales/invoice?page=${page}&pageSize=${pageSize}`),

    createOrder: (data: {
        customerId: string;
        notes: string;
        items: { productId: string; quantity: number; }[];
    }) => api.post('/sales/salesorder', data),

    confirmOrder: (id: string) =>
        api.post(`/sales/salesorder/${id}/confirm`),

    cancelOrder: (id: string) =>
        api.post(`/sales/salesorder/${id}/cancel`),

    deliverOrder: (id: string) =>
        api.post(`/sales/salesorder/${id}/deliver`),

    createInvoice: (orderId: string, dueDate: string) =>
        api.post(`/sales/invoice?orderId=${orderId}&dueDate=${dueDate}`),

    markInvoicePaid: (id: string) =>
        api.post(`/sales/invoice/${id}/pay`),

    createCustomer: (data: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
    }) => api.post('/sales/customer', data),
};