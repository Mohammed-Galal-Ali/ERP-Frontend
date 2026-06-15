import api from './axios';
import type { SalesReport, HRReport, FinanceReport } from '../types';

export const reportsApi = {
    getSalesReport: () => api.get<SalesReport>('/report/sales'),
    getHRReport: () => api.get<HRReport>('/report/hr'),
    getFinanceReport: () => api.get<FinanceReport>('/report/finance'),
};