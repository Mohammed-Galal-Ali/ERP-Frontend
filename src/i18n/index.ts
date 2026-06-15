import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './en/common.json';
import enHR from './en/hr.json';
import enInventory from './en/inventory.json';
import enSales from './en/sales.json';
import enPurchasing from './en/purchasing.json';
import enReports from './en/reports.json';
import enDashboard from './en/dashboard.json';

import arCommon from './ar/common.json';
import arHR from './ar/hr.json';
import arInventory from './ar/inventory.json';
import arSales from './ar/sales.json';
import arPurchasing from './ar/purchasing.json';
import arReports from './ar/reports.json';
import arDashboard from './ar/dashboard.json';

i18n.use(initReactI18next).init({
    resources: {
        en: {
            common: enCommon,
            hr: enHR,
            inventory: enInventory,
            sales: enSales,
            purchasing: enPurchasing,
            reports: enReports,
            dashboard: enDashboard,
        },
        ar: {
            common: arCommon,
            hr: arHR,
            inventory: arInventory,
            sales: arSales,
            purchasing: arPurchasing,
            reports: arReports,
            dashboard: arDashboard,
        },
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;