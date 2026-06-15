import { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports';
import type { SalesReport, HRReport, FinanceReport } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, ShoppingCart, Users, FileText,
    TrendingUp, TrendingDown, Package, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function DashboardPage() {
    const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
    const [hrReport, setHRReport] = useState<HRReport | null>(null);
    const [financeReport, setFinanceReport] = useState<FinanceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation('dashboard');
    const fullName = localStorage.getItem('fullName');

    useEffect(() => {
        const fetchReports = async () => {
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
        fetchReports();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('loading', { ns: 'common' })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {t('welcome')}, {fullName}
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">{t('subtitle')}</p>
                </div>
                <div className="text-sm text-slate-400">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title={t('totalRevenue')}
                    value={`$${salesReport?.totalRevenue.toLocaleString() || 0}`}
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                    icon={DollarSign}
                    fromLastMonth={t('fromLastMonth')}
                />
                <StatCard
                    title={t('totalOrders')}
                    value={salesReport?.totalOrders.toString() || '0'}
                    trend="+5%"
                    trendUp={true}
                    color="green"
                    icon={ShoppingCart}
                    fromLastMonth={t('fromLastMonth')}
                />
                <StatCard
                    title={t('totalEmployees')}
                    value={hrReport?.totalEmployees.toString() || '0'}
                    trend="0%"
                    trendUp={true}
                    color="purple"
                    icon={Users}
                    fromLastMonth={t('fromLastMonth')}
                />
                <StatCard
                    title={t('unpaidInvoices')}
                    value={financeReport?.unpaidInvoices.toString() || '0'}
                    trend="-3%"
                    trendUp={false}
                    color="red"
                    icon={FileText}
                    fromLastMonth={t('fromLastMonth')}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Package size={16} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">{t('topProducts')}</h2>
                    </div>
                    {salesReport?.topProducts.length ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={salesReport.topProducts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="productName" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="totalQuantitySold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Package size={32} className="text-slate-300" />
                            <span className="text-sm">{t('noSalesData', { ns: 'reports' })}</span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Users size={16} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">{t('employeesByDept')}</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={hrReport?.employeesByDepartment}
                                dataKey="employeeCount"
                                nameKey="departmentName"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {hrReport?.employeesByDepartment.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingCart size={16} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">{t('ordersSummary')}</h2>
                    </div>
                    <div className="space-y-3">
                        <SummaryRow label={t('pending')} value={salesReport?.pendingOrders || 0} icon={<Clock size={13} className="text-yellow-500" />} />
                        <SummaryRow label={t('delivered')} value={salesReport?.deliveredOrders || 0} icon={<CheckCircle size={13} className="text-green-500" />} />
                        <SummaryRow label={t('cancelled')} value={salesReport?.cancelledOrders || 0} icon={<XCircle size={13} className="text-red-500" />} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign size={16} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">{t('financeSummary')}</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-sm text-slate-500">{t('totalPaid')}</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                                ${financeReport?.totalPaid.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <span className="text-sm text-slate-500">{t('totalUnpaid')}</span>
                            </div>
                            <span className="text-sm font-semibold text-red-600">
                                ${financeReport?.totalUnpaid.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">{t('hrSummary')}</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                            <span className="text-sm text-slate-500">{t('departments', { ns: 'reports' })}</span>
                            <span className="text-sm font-semibold text-slate-800">{hrReport?.totalDepartments || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                            <span className="text-sm text-slate-500">{t('totalEmployees')}</span>
                            <span className="text-sm font-semibold text-slate-800">{hrReport?.totalEmployees || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                            <span className="text-sm text-slate-500">{t('totalSalaries', { ns: 'reports' })}</span>
                            <span className="text-sm font-semibold text-slate-800">${hrReport?.totalSalaries.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, trendUp, color, icon: Icon, fromLastMonth }: {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    color: string;
    icon: React.ElementType;
    fromLastMonth: string;
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
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <Icon size={17} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{trend} {fromLastMonth}</span>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, icon }: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm text-slate-500">{label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{value}</span>
        </div>
    );
}