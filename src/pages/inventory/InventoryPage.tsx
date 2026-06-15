import { useEffect, useState } from 'react';
import { inventoryApi } from '../../api/inventory';
import type { Product } from '../../types';
import { Package, AlertTriangle, CheckCircle, Tag, Plus, Pencil, Trash2, X, PlusCircle } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from 'react-i18next';
interface Category { id: string; name: string; }

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [addStockProduct, setAddStockProduct] = useState<Product | null>(null);
    const { can } = usePermissions();
const { t } = useTranslation('inventory');
const { t: tc } = useTranslation('common');
    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                inventoryApi.getProducts(),
                inventoryApi.getCategories(),
            ]);
            setProducts(prodRes.data?.data || []);
            setCategories(catRes.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await inventoryApi.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
        }
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

    const lowStockCount = products.filter(p => p.isLowStock).length;

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
                        <Package size={14} /> {products.length} {t('products')}
                    </div>
                    {lowStockCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-red-50 text-red-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                            <AlertTriangle size={14} /> {lowStockCount} {t('lowStock')}
                        </div>
                    )}
                    {can('Inventory.Create') && (
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={15} /> {t('addProduct')}
                        </button>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('productName')}</th>
                            <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                            <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('category')}</th>
                            <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('price')}</th>
                            <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stock')}</th>
                            <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('status')}</th>
                            {(can('Inventory.Update') || can('Inventory.Delete')) && (
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('actions')}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                                            <Package size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{product.name}</p>
                                            <p className="text-xs text-slate-400 truncate max-w-xs">{product.description || '—'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">
                                        {product.sku}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Tag size={12} className="text-blue-400" />
                                        <span className="text-sm text-slate-600">{product.categoryName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-semibold text-slate-800">${product.price.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400">Cost: ${product.costPrice.toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className={`text-sm font-semibold ${product.isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                        {product.stockQuantity}
                                    </p>
                                    <p className="text-xs text-slate-400">Min: {product.minStockLevel}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {product.isLowStock ? (
                                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-600 w-fit">
                                            <AlertTriangle size={11} /> {t('lowStock')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600 w-fit">
                                            <CheckCircle size={11} /> {t('inStock')}
                                        </span>
                                    )}
                                </td>
                                {(can('Inventory.Update') || can('Inventory.Delete')) && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {can('Inventory.Update') && (
                                                <>
                                                    <button
                                                        onClick={() => setAddStockProduct(product)}
                                                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Add Stock"
                                                    >
                                                        <PlusCircle size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditProduct(product)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {can('Inventory.Delete') && (
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showAddProduct && (
                <AddProductModal
                    categories={categories}
                    onClose={() => setShowAddProduct(false)}
                    onSuccess={() => { setShowAddProduct(false); fetchData(); }}
                />
            )}
            {editProduct && (
                <EditProductModal
                    product={editProduct}
                    onClose={() => setEditProduct(null)}
                    onSuccess={() => { setEditProduct(null); fetchData(); }}
                />
            )}
            {addStockProduct && (
                <AddStockModal
                    product={addStockProduct}
                    onClose={() => setAddStockProduct(null)}
                    onSuccess={() => { setAddStockProduct(null); fetchData(); }}
                />
            )}
        </div>
    );
}

// ===== Add Product Modal =====

function AddProductModal({ categories, onClose, onSuccess }: {
    categories: Category[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        name: '', sku: '', description: '', price: '',
        costPrice: '', minStockLevel: '10', categoryId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('inventory');
    const { t: tc } = useTranslation('common');
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await inventoryApi.createProduct({
                ...form,
                price: parseFloat(form.price),
                costPrice: parseFloat(form.costPrice),
                minStockLevel: parseInt(form.minStockLevel),
            });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={t('addProduct')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
                <Input label={t('productName')} value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Input label={t('sku')} value={form.sku} onChange={v => setForm(p => ({ ...p, sku: v }))} />
                <Input label={t('price')} value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} type="number" />
                <Input label={t('costPrice')} value={form.costPrice} onChange={v => setForm(p => ({ ...p, costPrice: v }))} type="number" />
                <Input label={t('minStockLevel')} value={form.minStockLevel} onChange={v => setForm(p => ({ ...p, minStockLevel: v }))} type="number" />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
                    <select
                        value={form.categoryId}
                        onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <Input label={t('description')} value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Add Product'}
                </button>
            </div>
        </Modal>
    );
}

// ===== Edit Product Modal =====
function EditProductModal({ product, onClose, onSuccess }: {
    product: Product;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        minStockLevel: product.minStockLevel.toString(),
        sku: product.sku,
        costPrice: product.costPrice.toString(),
        categoryId: product.categoryId,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('inventory');
    const { t: tc } = useTranslation('common');
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await inventoryApi.updateProduct(product.id, {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                minStockLevel: parseInt(form.minStockLevel),
                sku: form.sku,
                costPrice: parseFloat(form.costPrice),
                categoryId: form.categoryId,
            });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={tc('edit')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
                <Input label={t('productName')} value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Input label={t('price')} value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} type="number" />
                <Input label={t('minStockLevel')} value={form.minStockLevel} onChange={v => setForm(p => ({ ...p, minStockLevel: v }))} type="number" />
                <div className="col-span-2">
                    <Input label={t('description')} value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Saving...' : tc('save')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Add Stock Modal =====
function AddStockModal({ product, onClose, onSuccess }: {
    product: Product;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('inventory');
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await inventoryApi.addStock(product.id, parseInt(quantity));
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={`${t('addStock')}— ${product.name}`} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="mb-2 text-sm text-slate-500">
                {t('currentStock')}: <span className="font-semibold text-slate-800">{product.stockQuantity}</span>
            </div>
            <Input label={t('quantityToAdd')} value={quantity} onChange={setQuantity} type="number" />
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {loading ? 'Adding...' : 'Add Stock'}
                </button>
            </div>
        </Modal>
    );
}

// ===== Reusable Components =====
function Modal({ title, onClose, children }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
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
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}