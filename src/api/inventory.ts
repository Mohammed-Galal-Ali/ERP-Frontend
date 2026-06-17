import api from './axios';
import type { PagedResult, Product } from '../types';

export const inventoryApi = {
    getProducts: (page = 1, pageSize = 10, search = '') =>
        api.get<PagedResult<Product>>(`/inventory/product?page=${page}&pageSize=${pageSize}&search=${search}`),

    getCategories: () =>
    api.get<{ data: { id: string; name: string; }[] }>(`/inventory/category`),

    createProduct: (data: {
        name: string;
        sku: string;
        description: string;
        price: number;
        costPrice: number;
        minStockLevel: number;
        categoryId: string;
    }) => api.post('/inventory/product', data),

updateProduct: (id: string, data: {
    name: string;
    description: string;
    price: number;
    minStockLevel: number;
    sku: string;
    costPrice: number;
    categoryId: string;
}) => api.put(`/inventory/product/${id}`, data),

    deleteProduct: (id: string) =>
        api.delete(`/inventory/product/${id}`),

    addStock: (id: string, quantity: number) =>
        api.post(`/inventory/product/${id}/add-stock?quantity=${quantity}`),
};