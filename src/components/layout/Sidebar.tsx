import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Package, ShoppingCart,
    Truck, BarChart3, LogOut, Building2, Languages
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { can } = usePermissions();
    const { t, i18n } = useTranslation('common');

    const allMenuItems = [
        { path: '/', label: t('dashboard'), icon: LayoutDashboard, permission: null },
        { path: '/hr', label: t('hr'), icon: Users, permission: 'HR.View' },
        { path: '/inventory', label: t('inventory'), icon: Package, permission: 'Inventory.View' },
        { path: '/sales', label: t('sales'), icon: ShoppingCart, permission: 'Sales.View' },
        { path: '/purchasing', label: t('purchasing'), icon: Truck, permission: 'Purchasing.View' },
        { path: '/reports', label: t('reports'), icon: BarChart3, permission: 'Reports.View' },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.permission === null || can(item.permission)
    );

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
        document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        localStorage.removeItem('permissions');
        localStorage.removeItem('roles');
        navigate('/login');
    };

    return (
        <div className="w-64 bg-slate-900 min-h-screen text-white flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Building2 size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">ERP System</h1>
                        <p className="text-xs text-slate-500">Management Portal</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Icon size={17} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {localStorage.getItem('fullName')?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                            {localStorage.getItem('fullName')}
                        </p>
                        <p className="text-xs text-slate-500">
                            {JSON.parse(localStorage.getItem('roles') || '[]')[0] || 'User'}
                        </p>
                    </div>
                </div>

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors mb-1"
                >
                    <Languages size={17} />
                    <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-lg transition-colors"
                >
                    <LogOut size={17} />
                    <span>{t('logout')}</span>
                </button>
            </div>
        </div>
    );
}