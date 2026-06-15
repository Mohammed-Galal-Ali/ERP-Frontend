import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports';
import type { SalesReport, HRReport, FinanceReport } from '../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Users, DollarSign, ShoppingCart,
    Package, FileText, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
    const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
    const [hrReport, setHRReport] = useState<HRReport | null>(null);
    const [financeReport, setFinanceReport] = useState<FinanceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'sales' | 'hr' | 'finance'>('sales');
    const { t } = useTranslation('reports');
    const { t: tc } = useTranslation('common');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sales, hr, finance] = await Promise.all([
                    reportsApi.getSalesReport(),
                    reportsApi.getHRReport(),
                    reportsApi.getFinanceReport(),
                ]);
                setSalesReport(sales.data);
                setHRReport(hr.data);
                setFinanceReport(finance.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
                <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {[
                    { key: 'sales', label: t('sales'), icon: ShoppingCart },
                    { key: 'hr', label: t('hr'), icon: Users },
                    { key: 'finance', label: t('finance'), icon: DollarSign },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key}
                        onClick={() => setActiveTab(key as 'sales' | 'hr' | 'finance')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}>
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {/* Sales Report */}
            {activeTab === 'sales' && salesReport && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ReportCard title={t('totalRevenue')} value={`$${salesReport.totalRevenue.toLocaleString()}`} icon={DollarSign} color="blue" />
                        <ReportCard title={t('totalOrders')} value={salesReport.totalOrders.toString()} icon={ShoppingCart} color="green" />
                        <ReportCard title={t('delivered')} value={salesReport.deliveredOrders.toString()} icon={CheckCircle} color="purple" />
                        <ReportCard title={t('cancelled')} value={salesReport.cancelledOrders.toString()} icon={AlertCircle} color="red" />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Package size={16} className="text-slate-400" />
                            <h2 className="text-base font-semibold text-slate-800">{t('topProducts')}</h2>
                        </div>
                        {salesReport.topProducts.length ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={salesReport.topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="productName" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Package size={32} className="text-slate-300" />
                                <span className="text-sm">{t('noSalesData')}</span>
                            </div>
                        )}
                    </div>

                    {salesReport.topProducts.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-base font-semibold text-slate-800">{t('topProducts')}</h2>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('name')}</th>
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('totalRevenue')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {salesReport.topProducts.map((p, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-sm font-medium text-slate-800">{p.productName}</td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{p.totalQuantitySold}</td>
                                            <td className="px-6 py-3 text-sm font-semibold text-green-600">${p.totalRevenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* HR Report */}
            {activeTab === 'hr' && hrReport && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <ReportCard title={t('totalEmployees')} value={hrReport.totalEmployees.toString()} icon={Users} color="blue" />
                        <ReportCard title={t('departments')} value={hrReport.totalDepartments.toString()} icon={TrendingUp} color="green" />
                        <ReportCard title={t('totalSalaries')} value={`$${hrReport.totalSalaries.toLocaleString()}`} icon={DollarSign} color="purple" />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Users size={16} className="text-slate-400" />
                            <h2 className="text-base font-semibold text-slate-800">{t('employeesByDept')}</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={hrReport.employeesByDepartment}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="departmentName" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="employeeCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Employees" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-800">{t('deptDetails')}</h2>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('name')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('totalEmployees')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('totalSalaries')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hrReport.employeesByDepartment.map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-sm font-medium text-slate-800">{d.departmentName}</td>
                                        <td className="px-6 py-3 text-sm text-slate-600">{d.employeeCount}</td>
                                        <td className="px-6 py-3 text-sm font-semibold text-purple-600">${d.totalSalaries.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Finance Report */}
            {activeTab === 'finance' && financeReport && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ReportCard title={t('totalPaid')} value={`$${financeReport.totalPaid.toLocaleString()}`} icon={CheckCircle} color="green" />
                        <ReportCard title={t('totalUnpaid')} value={`$${financeReport.totalUnpaid.toLocaleString()}`} icon={AlertCircle} color="red" />
                        <ReportCard title={t('paidInvoices')} value={financeReport.paidInvoices.toString()} icon={FileText} color="blue" />
                        <ReportCard title={t('unpaidInvoices')} value={financeReport.unpaidInvoices.toString()} icon={FileText} color="purple" />
                    </div>

                    {financeReport.unpaidInvoicesList.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                <AlertCircle size={15} className="text-red-400" />
                                <h2 className="text-base font-semibold text-slate-800">{t('unpaidInvoicesList')}</h2>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice</th>
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('name')}</th>
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('total')}</th>
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('date')}</th>
                                        <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {financeReport.unpaidInvoicesList.map((inv, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-sm font-medium text-slate-800">{inv.invoiceNumber}</td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{inv.customerName}</td>
                                            <td className="px-6 py-3 text-sm font-semibold text-slate-800">${inv.amount.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-sm text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-3">
                                                {inv.isOverdue ? (
                                                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-600 w-fit">
                                                        <AlertCircle size={11} /> {t('overdue')}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-50 text-yellow-600 w-fit">
                                                        <Clock size={11} /> {t('pending')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ReportCard({ title, value, icon: Icon, color }: {
    title: string; value: string; icon: React.ElementType; color: string;
}) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    };
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">{title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <Icon size={15} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    );
}