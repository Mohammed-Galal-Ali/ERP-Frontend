import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HRPage from './pages/hr/HRPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SalesPage from './pages/sales/SalesPage';
import PurchasingPage from './pages/purchasing/PurchasingPage';
import ReportsPage from './pages/reports/ReportsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');
    return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<DashboardPage />} />
                    <Route path="hr" element={<HRPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="sales" element={<SalesPage />} />
                    <Route path="purchasing" element={<PurchasingPage />} />
                    <Route path="reports" element={<ReportsPage />} />

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;