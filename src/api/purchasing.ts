import api from './axios';

export const purchasingApi = {
    getOrders: (page = 1, pageSize = 10) =>
        api.get(`/purchasing/purchaseorder?page=${page}&pageSize=${pageSize}`),

    getSuppliers: (page = 1, pageSize = 10) =>
        api.get(`/purchasing/supplier?page=${page}&pageSize=${pageSize}`),

    createOrder: (data: {
        supplierId: string;
        notes: string;
        items: { productId: string; quantity: number; unitCost: number; }[];
    }) => api.post('/purchasing/purchaseorder', data),

    confirmOrder: (id: string) =>
        api.post(`/purchasing/purchaseorder/${id}/confirm`),

    receiveOrder: (id: string) =>
        api.post(`/purchasing/purchaseorder/${id}/receive`),

    cancelOrder: (id: string) =>
        api.post(`/purchasing/purchaseorder/${id}/cancel`),

    createSupplier: (data: {
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
    }) => api.post('/purchasing/supplier', data),
};