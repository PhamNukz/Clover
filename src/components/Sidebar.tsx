import React from 'react';
import { Package, TrendingUp, Users } from 'lucide-react';
import logo from '../assets/cropped-logo-clover-integral-.svg';

interface SidebarProps {
  activeMenu: 'dashboard' | 'inventory' | 'employees' | 'purchaseOrder';
  setActiveMenu: (menu: 'dashboard' | 'inventory' | 'employees' | 'purchaseOrder') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 text-gray-900 p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-8">
        <img src={logo} alt="Logo CIS" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-gray-900">Clover Integral Services SpA®</h1>
      </div>

      <nav className="space-y-2">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeMenu === 'dashboard'
            ? 'bg-clover-100 border-2 border-clover-600 text-gray-900 shadow-lg font-semibold'
            : 'text-gray-900 hover:bg-clover-50 font-medium'
            }`}
        >
          <TrendingUp size={20} className="text-gray-900" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveMenu('inventory')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeMenu === 'inventory'
            ? 'bg-clover-100 border-2 border-clover-600 text-gray-900 shadow-lg font-semibold'
            : 'text-gray-900 hover:bg-clover-50 font-medium'
            }`}
        >
          <Package size={20} className="text-gray-900" />
          <span>Inventario</span>
        </button>
        <button
          onClick={() => setActiveMenu('employees')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeMenu === 'employees'
            ? 'bg-clover-100 border-2 border-clover-600 text-gray-900 shadow-lg font-semibold'
            : 'text-gray-900 hover:bg-clover-50 font-medium'
            }`}
        >
          <Users size={20} className="text-gray-900" />
          <span>Empleados</span>
        </button>
        <button
          onClick={() => setActiveMenu('purchaseOrder')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeMenu === 'purchaseOrder'
            ? 'bg-clover-100 border-2 border-clover-600 text-gray-900 shadow-lg font-semibold'
            : 'text-gray-900 hover:bg-clover-50 font-medium'
            }`}
        >
          <Package size={20} className="text-gray-900" />
          <span>Ordenes compra</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

