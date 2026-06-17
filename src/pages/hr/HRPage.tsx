import { useEffect, useState } from 'react';
import { hrApi } from '../../api/hr';
import type { Employee, Department } from '../../types';
import { Users, Building2, Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from 'react-i18next';

export default function HRPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const pageSize = 10;
    const { can } = usePermissions();
    const { t } = useTranslation('hr');
    const { t: tc } = useTranslation('common');

    const fetchData = async () => {
        try {
            const [empRes, deptRes] = await Promise.all([
                hrApi.getEmployees(currentPage, pageSize, search),
                hrApi.getDepartments(),
            ]);
            setEmployees(empRes.data?.data || []);
            setTotalCount(empRes.data?.totalCount || 0);
            setDepartments(deptRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [currentPage, search]);

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await hrApi.deleteEmployee(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                        <Users size={14} /> {totalCount} {t('employees')}
                    </span>
                    <span className="flex items-center gap-1.5 bg-purple-50 text-purple-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                        <Building2 size={14} /> {departments.length} {t('departments')}
                    </span>
                    {can('HR.Create') && activeTab === 'employees' && (
                        <button onClick={() => setShowAddEmployee(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={15} /> {t('addEmployee')}
                        </button>
                    )}
                    {can('HR.Create') && activeTab === 'departments' && (
                        <button onClick={() => setShowAddDepartment(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={15} /> {t('addDepartment')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {[
                    { key: 'employees', label: t('employees'), icon: Users },
                    { key: 'departments', label: t('departments'), icon: Building2 },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key}
                        onClick={() => setActiveTab(key as 'employees' | 'departments')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}>
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {/* Employees Table */}
            {activeTab === 'employees' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

                    {/* Search */}
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            />
                        </div>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('employees')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('position')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('department')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('salary')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('status')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('hireDate')}</th>
                                {(can('HR.Update') || can('HR.Delete')) && (
                                    <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('actions')}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                {emp.fullName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{emp.fullName}</p>
                                                <p className="text-xs text-slate-500">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{emp.position}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full">{emp.departmentName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">${emp.salary.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {emp.status === 'Active' ? t('active') : t('terminated')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(emp.hireDate).toLocaleDateString()}</td>
                                    {(can('HR.Update') || can('HR.Delete')) && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {can('HR.Update') && (
                                                    <button onClick={() => setEditEmployee(emp)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Pencil size={14} />
                                                    </button>
                                                )}
                                                {can('HR.Delete') && (
                                                    <button onClick={() => handleDeleteEmployee(emp.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Showing {Math.min(((currentPage - 1) * pageSize) + 1, totalCount)}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">
                                Previous
                            </button>
                            <span className="text-sm text-slate-600">Page {currentPage} of {Math.ceil(totalCount / pageSize)}</span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * pageSize >= totalCount}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Departments Table */}
            {activeTab === 'departments' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{t('departments')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{tc('name')}</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Parent</th>
                                <th className="text-start px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Manager</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                                <Building2 size={14} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-800">{dept.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{dept.description || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{dept.parentDepartmentName || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{dept.managerName || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddEmployee && (
                <AddEmployeeModal departments={departments}
                    onClose={() => setShowAddEmployee(false)}
                    onSuccess={() => { setShowAddEmployee(false); fetchData(); }} />
            )}
            {editEmployee && (
                <EditEmployeeModal employee={editEmployee}
                    onClose={() => setEditEmployee(null)}
                    onSuccess={() => { setEditEmployee(null); fetchData(); }} />
            )}
            {showAddDepartment && (
                <AddDepartmentModal departments={departments}
                    onClose={() => setShowAddDepartment(false)}
                    onSuccess={() => { setShowAddDepartment(false); fetchData(); }} />
            )}
        </div>
    );
}

// ===== Add Employee Modal =====
function AddEmployeeModal({ departments, onClose, onSuccess }: {
    departments: Department[]; onClose: () => void; onSuccess: () => void;
}) {
    const { t } = useTranslation('hr');
    const { t: tc } = useTranslation('common');
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        position: '', salary: '', departmentId: '', hireDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true); setError('');
        try {
            await hrApi.createEmployee({ ...form, salary: parseFloat(form.salary) });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Modal title={t('addEmployee')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
                <Input label={t('firstName')} value={form.firstName} onChange={v => setForm(p => ({ ...p, firstName: v }))} />
                <Input label={t('lastName')} value={form.lastName} onChange={v => setForm(p => ({ ...p, lastName: v }))} />
                <Input label={tc('email')} value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" />
                <Input label={tc('phone')} value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
                <Input label={t('position')} value={form.position} onChange={v => setForm(p => ({ ...p, position: v }))} />
                <Input label={t('salary')} value={form.salary} onChange={v => setForm(p => ({ ...p, salary: v }))} type="number" />
                <Input label={t('hireDate')} value={form.hireDate} onChange={v => setForm(p => ({ ...p, hireDate: v }))} type="date" />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('department')}</label>
                    <select value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('addEmployee')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Edit Employee Modal =====
function EditEmployeeModal({ employee, onClose, onSuccess }: {
    employee: Employee; onClose: () => void; onSuccess: () => void;
}) {
    const { t } = useTranslation('hr');
    const { t: tc } = useTranslation('common');
    const nameParts = employee.fullName.split(' ');
    const [form, setForm] = useState({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: employee.phone,
        position: employee.position,
        email: employee.email,
        salary: employee.salary,
        departmentId: employee.departmentId,
        hireDate: employee.hireDate.split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true); setError('');
        try {
            await hrApi.updateEmployee(employee.id, form);
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Modal title={tc('edit')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
                <Input label={t('firstName')} value={form.firstName} onChange={v => setForm(p => ({ ...p, firstName: v }))} />
                <Input label={t('lastName')} value={form.lastName} onChange={v => setForm(p => ({ ...p, lastName: v }))} />
                <Input label={tc('phone')} value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
                <Input label={t('position')} value={form.position} onChange={v => setForm(p => ({ ...p, position: v }))} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : tc('save')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Add Department Modal =====
function AddDepartmentModal({ departments, onClose, onSuccess }: {
    departments: Department[]; onClose: () => void; onSuccess: () => void;
}) {
    const { t } = useTranslation('hr');
    const { t: tc } = useTranslation('common');
    const [form, setForm] = useState({ name: '', description: '', parentDepartmentId: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true); setError('');
        try {
            await hrApi.createDepartment({ ...form, parentDepartmentId: form.parentDepartmentId || null });
            onSuccess();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Modal title={t('addDepartment')} onClose={onClose}>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
                <Input label={tc('name')} value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Input label="Description" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent Department</label>
                    <select value={form.parentDepartmentId} onChange={e => setForm(p => ({ ...p, parentDepartmentId: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">None</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">{tc('cancel')}</button>
                <button onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '...' : t('addDepartment')}
                </button>
            </div>
        </Modal>
    );
}

// ===== Reusable Components =====
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
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