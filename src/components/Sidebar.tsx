import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

interface SidebarProps {
  activeMenu: 'dashboard' | 'inventory';
  setActiveMenu: (menu: 'dashboard' | 'inventory') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  return (
    <div className="w-64 bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">Sistema EPP</h1>
      <nav className="space-y-2">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
            activeMenu === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'
          }`}
        >
          <TrendingUp size={20} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveMenu('inventory')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
            activeMenu === 'inventory' ? 'bg-blue-600' : 'hover:bg-gray-800'
          }`}
        >
          <Package size={20} />
          <span>Inventario</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

