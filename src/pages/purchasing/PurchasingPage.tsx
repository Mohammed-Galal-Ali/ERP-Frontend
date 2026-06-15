import { useEffect, useState } from 'react';
import { purchasingApi } from '../../api/purchasing';
import { inventoryApi } from '../../api/inventory';
import type { Product } from '../../types';
import {
    Truck, Building2, CheckCircle, Clock,
    XCircle, Package, Plus, X
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from 'react-i18next';

interface Supplier {
    id: string; name: string; contactPerson: string;
    email: string; phone: string; address: string;
}

interface PurchaseOrderItem {
    id: string; productId: string; quantity: number;
    unitCost: number; totalCost: number;
}

interface PurchaseOrder {
    id: string; orderNumber: string; status: string;
    totalAmount: number; notes: string;
    supplierId: string; supplierName: string;
    items: PurchaseOrderItem[];
}

export default function PurchasingPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [showCreateSupplier, setShowCreateSupplier] = useState(false);
    const { can } = usePermissions();
    const { t } = useTranslation('purchasing');
    const { t: tc } = useTranslation('common');

    const fetchData = async () => {
        try {
            const [ordersRes, suppliersRes] = await Promise.all([
                purchasingApi.getOrders(),
                purchasingApi.getSuppliers(),
            ]);
            setOrders(ordersRes.data?.data || []);
            setSuppliers(suppliersRes.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, []);

    const handleConfirm = async (id: string) => {
        try { await purchasingApi.confirmOrder(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const handleReceive = async (id: string) => {
        try { await purchasingApi.receiveOrder(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Cancel this order?')) return;
        try { await purchasingApi.cancelOrder(id); fetchData(); }
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-600';
            case 'Confirmed': return 'bg-blue-50 text-blue-600';
            case 'Received': return 'bg-green-50 text-green-600';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock size={11} />;
            case 'Confirmed': return <CheckCircle size={11} />;
            case 'Received': return <CheckCircle size={11} />;
            case 'Cancelled': return <XCircle size={11} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                        <Truck size={14} /> {orders.length} {t('orders')}
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-50 text-purple-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                        <Building2 size={14} /> {suppliers.length} {t('suppliers')}
                    </div>
                    {can('Purchasing.Create') && activeTab === 'orders' && (
                        <button onClick={() => setShowCreateOrder(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={15} /> {t('newOrder')}
                        </button>
                    )}
                    {can('Purchasing.Create') && activeTab === 'suppliers' && (
                        <button onClick={() => setShowCreateSupplier(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={15} /> {t('addSupplier')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {[
                    { key: 'orders', label: t('orders'), icon: Truck },
                    { key: 'suppliers', label: t('suppliers'), icon: Building2 },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key}
                        onClick={() => setActiveTab(key as 'orders' | 'suppliers')}
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
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('orders')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('supplier')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('total')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('status')}</th>
                                {can('Purchasing.Update') && (
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
                                                <Truck size={15} />
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
                                                {order.supplierName?.[0]}
                                            </div>
                                            <span className="text-sm text-slate-600">{order.supplierName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Package size={13} className="text-slate-400" />
                                            {order.items?.length || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-slate-800">${order.totalAmount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit ${getStatusStyle(order.status)}`}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                    </td>
                                    {can('Purchasing.Update') && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {order.status === 'Pending' && (
                                                    <>
                                                        <ActionBtn label={t('confirm')} color="blue" onClick={() => handleConfirm(order.id)} />
                                                        <ActionBtn label={t('cancel')} color="red" onClick={() => handleCancel(order.id)} />
                                                    </>
                                                )}
                                                {order.status === 'Confirmed' && (
                                                    <ActionBtn label={t('receive')} color="green" onClick={() => handleReceive(order.id)} />
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('suppliers')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('contactPerson')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('phone')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('address')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center">
                                                <Building2 size={15} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{supplier.name}</p>
                                                <p className="text-xs text-slate-400">{supplier.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{supplier.contactPerson}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{supplier.phone}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{supplier.address || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateOrder && (
                <CreateOrderModal suppliers={suppliers}
                    onClose={() => setShowCreateOrder(false)}
                    onSuccess={() => { setShowCreateOrder(false); fetchData(); }} />
            )}
            {showCreateSupplier && (
                <CreateSupplierModal
                    onClose={() => setShowCreateSupplier(false)}
                    onSuccess={() => { setShowCreateSupplier(false); fetchData(); }} />
            )}
        </div>
    );
}

// ===== Create Order Modal =====
function CreateOrderModal({ suppliers, onClose, onSuccess }: {
    suppliers: Supplier[]; onClose: () => void; onSuccess: () => void;
}) {
    const { t } = useTranslation('purchasing');
    const { t: tc } = useTranslation('common');
    const [supplierId, setSupplierId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: number; productName: string; }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitCost, setUnitCost] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        inventoryApi.getProducts().then(res => setProducts(res.data?.data || []));
    }, []);

    const addItem = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product || !unitCost) return;
        if (items.find(i => i.productId === selectedProduct)) return;
        setItems(prev => [...prev, {
            productId: product.id, quantity: parseInt(quantity),
            unitCost: parseFloat(unitCost), productName: product.name,
        }]);
        setSelectedProduct(''); setQuantity('1'); setUnitCost('');
    };

    const handleSubmit = async () => {
        if (!supplierId) { setError('Please select a supplier'); return; }
        if (items.length === 0) { setError('Please add at least one item'); return; }
        setLoading(true); setError('');
        try {
            await purchasingApi.createOrder({
                supplierId, notes,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost })),
            });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    const total = items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);

    return (
        <Modal title={t('createOrder')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('supplier')}</label>
                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">{t('selectSupplier')}</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{tc('name')}</label>
                    <input value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Items</label>
                    <div className="flex gap-2">
                        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" placeholder="Qty"
                            className="w-16 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder={t('unitCost')}
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                                    <p className="text-xs text-slate-400">{item.quantity} × ${item.unitCost.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-slate-800">${(item.unitCost * item.quantity).toLocaleString()}</span>
                                    <button onClick={() => setItems(prev => prev.filter(i => i.productId !== item.productId))}
                                        className="text-slate-400 hover:text-red-500">
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
                <button onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('createOrder')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Create Supplier Modal =====
function CreateSupplierModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void; }) {
    const { t } = useTranslation('purchasing');
    const { t: tc } = useTranslation('common');
    const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true); setError('');
        try {
            await purchasingApi.createSupplier(form);
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Modal title={t('addSupplier')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
                <Input label={tc('name')} value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Input label={t('contactPerson')} value={form.contactPerson} onChange={v => setForm(p => ({ ...p, contactPerson: v }))} />
                <Input label={tc('email')} value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" />
                <Input label={tc('phone')} value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
                <Input label={tc('address')} value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('addSupplier')}
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