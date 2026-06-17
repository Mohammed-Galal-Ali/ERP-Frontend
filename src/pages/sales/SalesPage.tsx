import { useEffect, useState } from 'react';
import { salesApi } from '../../api/sales';
import { inventoryApi } from '../../api/inventory';
import type { SalesOrder, Customer, Invoice, Product } from '../../types';
import {
    ShoppingCart, Users, FileText, CheckCircle,
    Clock, XCircle, DollarSign, Plus, X, Search
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from 'react-i18next';

export default function SalesPage() {
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'invoices'>('orders');
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [showCreateCustomer, setShowCreateCustomer] = useState(false);
    const [showCreateInvoice, setShowCreateInvoice] = useState<SalesOrder | null>(null);

    // Pagination & Search
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersTotalCount, setOrdersTotalCount] = useState(0);
    const [ordersSearch, setOrdersSearch] = useState('');

    const [customersPage, setCustomersPage] = useState(1);
    const [customersTotalCount, setCustomersTotalCount] = useState(0);
    const [customersSearch, setCustomersSearch] = useState('');

    const [invoicesPage, setInvoicesPage] = useState(1);
    const [invoicesTotalCount, setInvoicesTotalCount] = useState(0);
    const [invoicesSearch, setInvoicesSearch] = useState('');

    const pageSize = 10;
    const { can } = usePermissions();
    const { t } = useTranslation('sales');
    const { t: tc } = useTranslation('common');

    const fetchData = async () => {
        try {
            const [ordersRes, customersRes, invoicesRes] = await Promise.all([
                salesApi.getOrders(ordersPage, pageSize, ordersSearch),
                salesApi.getCustomers(customersPage, pageSize, customersSearch),
                salesApi.getInvoices(invoicesPage, pageSize, invoicesSearch),
            ]);
            setOrders(ordersRes.data?.data || []);
            setOrdersTotalCount(ordersRes.data?.totalCount || 0);
            setCustomers(customersRes.data?.data || []);
            setCustomersTotalCount(customersRes.data?.totalCount || 0);
            setInvoices(invoicesRes.data?.data || []);
            setInvoicesTotalCount(invoicesRes.data?.totalCount || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [ordersPage, ordersSearch, customersPage, customersSearch, invoicesPage, invoicesSearch]);

    const handleConfirm = async (id: string) => {
        try { await salesApi.confirmOrder(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Cancel this order?')) return;
        try { await salesApi.cancelOrder(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const handleDeliver = async (id: string) => {
        try { await salesApi.deliverOrder(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const handleMarkPaid = async (id: string) => {
        try { await salesApi.markInvoicePaid(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {tc('loading')}
            </div>
        </div>
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock size={12} className="text-yellow-500" />;
            case 'Confirmed': return <CheckCircle size={12} className="text-blue-500" />;
            case 'Delivered': return <CheckCircle size={12} className="text-green-500" />;
            case 'Cancelled': return <XCircle size={12} className="text-red-500" />;
            default: return null;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-600';
            case 'Confirmed': return 'bg-blue-50 text-blue-600';
            case 'Delivered': return 'bg-green-50 text-green-600';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                        <ShoppingCart size={14} /> {ordersTotalCount} {t('orders')}
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-50 text-purple-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                        <Users size={14} /> {customersTotalCount} {t('customers')}
                    </div>
                    {can('Sales.Create') && activeTab === 'orders' && (
                        <button onClick={() => setShowCreateOrder(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={15} /> {t('newOrder')}
                        </button>
                    )}
                    {can('Sales.Create') && activeTab === 'customers' && (
                        <button onClick={() => setShowCreateCustomer(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={15} /> {t('addCustomer')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {[
                    { key: 'orders', label: t('orders'), icon: ShoppingCart },
                    { key: 'customers', label: t('customers'), icon: Users },
                    { key: 'invoices', label: t('invoices'), icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key}
                        onClick={() => setActiveTab(key as 'orders' | 'customers' | 'invoices')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}>
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search orders..."
                                value={ordersSearch}
                                onChange={e => { setOrdersSearch(e.target.value); setOrdersPage(1); }}
                                className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('orders')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('customer')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('items')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('total')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('status')}</th>
                                {can('Sales.Update') && (
                                    <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('actions')}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                                <ShoppingCart size={15} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{order.orderNumber}</p>
                                                <p className="text-xs text-slate-400">{order.notes || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                                                {order.customerName?.[0]}
                                            </div>
                                            <span className="text-sm text-slate-600">{order.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{order.items?.length || 0} {t('items')}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-slate-800">${order.totalAmount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit ${getStatusStyle(order.status)}`}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                    </td>
                                    {can('Sales.Update') && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {order.status === 'Pending' && (
                                                    <>
                                                        <ActionBtn label={t('confirm')} color="blue" onClick={() => handleConfirm(order.id)} />
                                                        <ActionBtn label={t('cancel')} color="red" onClick={() => handleCancel(order.id)} />
                                                    </>
                                                )}
                                                {order.status === 'Confirmed' && (
                                                    <>
                                                        <ActionBtn label={t('deliver')} color="green" onClick={() => handleDeliver(order.id)} />
                                                        <ActionBtn label={t('invoice')} color="purple" onClick={() => setShowCreateInvoice(order)} />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Showing {Math.min(((ordersPage - 1) * pageSize) + 1, ordersTotalCount)}–{Math.min(ordersPage * pageSize, ordersTotalCount)} of {ordersTotalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setOrdersPage(p => p - 1)} disabled={ordersPage === 1}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
                            <span className="text-sm text-slate-600">Page {ordersPage} of {Math.ceil(ordersTotalCount / pageSize)}</span>
                            <button onClick={() => setOrdersPage(p => p + 1)} disabled={ordersPage * pageSize >= ordersTotalCount}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search customers..."
                                value={customersSearch}
                                onChange={e => { setCustomersSearch(e.target.value); setCustomersPage(1); }}
                                className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('customer')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('phone')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('address')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                {customer.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{customer.fullName}</p>
                                                <p className="text-xs text-slate-400">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{customer.phone}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{customer.address || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Showing {Math.min(((customersPage - 1) * pageSize) + 1, customersTotalCount)}–{Math.min(customersPage * pageSize, customersTotalCount)} of {customersTotalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCustomersPage(p => p - 1)} disabled={customersPage === 1}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
                            <span className="text-sm text-slate-600">Page {customersPage} of {Math.ceil(customersTotalCount / pageSize)}</span>
                            <button onClick={() => setCustomersPage(p => p + 1)} disabled={customersPage * pageSize >= customersTotalCount}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search invoices..."
                                value={invoicesSearch}
                                onChange={e => { setInvoicesSearch(e.target.value); setInvoicesPage(1); }}
                                className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('invoices')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('customer')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('amount')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('dueDate')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('status')}</th>
                                {can('Finance.Update') && (
                                    <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('actions')}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
                                                <FileText size={15} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{invoice.invoiceNumber}</p>
                                                <p className="text-xs text-slate-400">{invoice.orderNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{invoice.customerName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={13} className="text-slate-400" />
                                            <span className="text-sm font-semibold text-slate-800">{invoice.amount.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                                            invoice.status === 'Paid' ? 'bg-green-50 text-green-600'
                                            : invoice.status === 'Cancelled' ? 'bg-red-50 text-red-600'
                                            : 'bg-yellow-50 text-yellow-600'
                                        }`}>
                                            {invoice.status === 'Paid' ? <CheckCircle size={11} />
                                                : invoice.status === 'Cancelled' ? <XCircle size={11} />
                                                : <Clock size={11} />}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    {can('Finance.Update') && (
                                        <td className="px-6 py-4">
                                            {invoice.status === 'Unpaid' && (
                                                <ActionBtn label={t('markPaid')} color="green" onClick={() => handleMarkPaid(invoice.id)} />
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Showing {Math.min(((invoicesPage - 1) * pageSize) + 1, invoicesTotalCount)}–{Math.min(invoicesPage * pageSize, invoicesTotalCount)} of {invoicesTotalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setInvoicesPage(p => p - 1)} disabled={invoicesPage === 1}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
                            <span className="text-sm text-slate-600">Page {invoicesPage} of {Math.ceil(invoicesTotalCount / pageSize)}</span>
                            <button onClick={() => setInvoicesPage(p => p + 1)} disabled={invoicesPage * pageSize >= invoicesTotalCount}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateOrder && (
                <CreateOrderModal customers={customers}
                    onClose={() => setShowCreateOrder(false)}
                    onSuccess={() => { setShowCreateOrder(false); fetchData(); }} />
            )}
            {showCreateCustomer && (
                <CreateCustomerModal
                    onClose={() => setShowCreateCustomer(false)}
                    onSuccess={() => { setShowCreateCustomer(false); fetchData(); }} />
            )}
            {showCreateInvoice && (
                <CreateInvoiceModal order={showCreateInvoice}
                    onClose={() => setShowCreateInvoice(null)}
                    onSuccess={() => { setShowCreateInvoice(null); fetchData(); }} />
            )}
        </div>
    );
}
// ===== Create Order Modal =====
function CreateOrderModal({ customers, onClose, onSuccess }: {
    customers: Customer[]; onClose: () => void; onSuccess: () => void;
}) {
    const { t } = useTranslation('sales');
    const { t: tc } = useTranslation('common');
    const [customerId, setCustomerId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<{ productId: string; quantity: number; productName: string; price: number; }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        inventoryApi.getProducts().then(res => setProducts(res.data?.data || []));
    }, []);

    const addItem = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;
        if (items.find(i => i.productId === selectedProduct)) return;
        setItems(prev => [...prev, { productId: product.id, quantity: parseInt(quantity), productName: product.name, price: product.price }]);
        setSelectedProduct(''); setQuantity('1');
    };

    const handleSubmit = async () => {
        if (!customerId) { setError('Please select a customer'); return; }
        if (items.length === 0) { setError('Please add at least one item'); return; }
        setLoading(true); setError('');
        try {
            await salesApi.createOrder({ customerId, notes, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <Modal title={t('createOrder')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('customer')}</label>
                    <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">{t('selectCustomer')}</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('notes')}</label>
                    <input value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('items')}</label>
                    <div className="flex gap-2">
                        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">{t('selectProduct')}</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price.toLocaleString()}</option>)}
                        </select>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1"
                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={addItem} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            <Plus size={15} />
                        </button>
                    </div>
                </div>
                {items.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        {items.map(item => (
                            <div key={item.productId} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item.productName}</p>
                                    <p className="text-xs text-slate-400">{item.quantity} × ${item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-slate-800">${(item.price * item.quantity).toLocaleString()}</span>
                                    <button onClick={() => setItems(prev => prev.filter(i => i.productId !== item.productId))} className="text-slate-400 hover:text-red-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between px-4 py-2.5 bg-slate-50">
                            <span className="text-sm font-semibold text-slate-700">{tc('total')}</span>
                            <span className="text-sm font-bold text-slate-800">${total.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('createOrder')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Create Customer Modal =====
function CreateCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void; }) {
    const { t } = useTranslation('sales');
    const { t: tc } = useTranslation('common');
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true); setError('');
        try {
            await salesApi.createCustomer(form);
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Modal title={t('addCustomer')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
                <Input label={t('fullName')} value={form.fullName} onChange={v => setForm(p => ({ ...p, fullName: v }))} />
                <Input label={tc('email')} value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" />
                <Input label={tc('phone')} value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
                <Input label={tc('address')} value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('addCustomer')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Create Invoice Modal =====
function CreateInvoiceModal({ order, onClose, onSuccess }: {
    order: SalesOrder; onClose: () => void; onSuccess: () => void;
}) {
    const { t } = useTranslation('sales');
    const { t: tc } = useTranslation('common');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!dueDate) { setError('Please select a due date'); return; }
        setLoading(true); setError('');
        try {
            await salesApi.createInvoice(order.id, dueDate);
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Modal title={t('createInvoice')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">{t('orders')}</p>
                    <p className="text-sm font-semibold text-slate-800">{order.orderNumber}</p>
                    <p className="text-sm text-slate-500 mt-2">{t('amount')}</p>
                    <p className="text-lg font-bold text-slate-800">${order.totalAmount.toLocaleString()}</p>
                </div>
                <Input label={t('dueDate')} value={dueDate} onChange={setDueDate} type="date" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('createInvoice')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Reusable Components =====
function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void; }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        green: 'bg-green-50 text-green-600 hover:bg-green-100',
        red: 'bg-red-50 text-red-600 hover:bg-red-100',
        purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    };
    return (
        <button onClick={onClick} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${colors[color]}`}>
            {label}
        </button>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={16} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    );
}