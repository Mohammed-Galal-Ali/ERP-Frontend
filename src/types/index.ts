export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    fullName: string;
    email: string;
    permissions: string[];
    roles: string[];
}

export interface PagedResult<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface Employee {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    salary: number;
    hireDate: string;
    status: string;
    departmentId: string;
    departmentName: string;
}

export interface Department {
    id: string;
    name: string;
    description: string;
    parentDepartmentId: string | null;
    parentDepartmentName: string | null;
    managerId: string | null;
    managerName: string | null;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string;
    price: number;
    costPrice: number;
    stockQuantity: number;
    minStockLevel: number;
    isLowStock: boolean;
    categoryId: string;
    categoryName: string;
}

export interface Customer {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

export interface SalesOrder {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    notes: string;
    customerId: string;
    customerName: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
}

export interface SalesReport {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    topProducts: TopProduct[];
}

export interface TopProduct {
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}

export interface HRReport {
    totalEmployees: number;
    totalDepartments: number;
    totalSalaries: number;
    employeesByDepartment: DepartmentCount[];
}

export interface DepartmentCount {
    departmentName: string;
    employeeCount: number;
    totalSalaries: number;
}

export interface FinanceReport {
    totalPaid: number;
    totalUnpaid: number;
    paidInvoices: number;
    unpaidInvoices: number;
    unpaidInvoicesList: UnpaidInvoice[];
}

export interface UnpaidInvoice {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    dueDate: string;
    isOverdue: boolean;
}