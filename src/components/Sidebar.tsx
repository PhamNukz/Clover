import { Package, Users, Tag, TrendingUp, LogOut } from 'lucide-react';
import logo from '../assets/cropped-logo-clover-integral-.svg';
import { Role } from '../types';

interface SidebarProps {
  activeMenu: 'dashboard' | 'inventory' | 'employees' | 'purchaseOrder' | 'categories';
  setActiveMenu: (menu: 'dashboard' | 'inventory' | 'employees' | 'purchaseOrder' | 'categories') => void;
  userRole: Role;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu, userRole, onLogout }) => {
  const canAccessPurchaseOrders = userRole === 'admin';
  const canAccessEmployees = userRole === 'admin' || userRole === 'warehouse';
  const canAccessCategories = userRole === 'admin' || userRole === 'warehouse';

  return (
    <div className="w-64 bg-white border-r border-gray-200 text-gray-900 p-6 shadow-lg flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-8">
        <img src={logo} alt="Logo CIS" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-gray-900">Clover Integral Services SpA®</h1>
      </div>

      <nav className="space-y-2 flex-1">
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

        {canAccessEmployees && (
          <button
            onClick={() => setActiveMenu('employees')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeMenu === 'employees'
              ? 'bg-clover-100 border-2 border-clover-600 text-gray-900 shadow-lg font-semibold'
              : 'text-gray-900 hover:bg-clover-50 font-medium'
              }`}
          >
            <Users size={20} className="text-gray-900" />
            <span>Colaboradores</span>
          </button>
        )}

        {canAccessPurchaseOrders && (
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
        )}

        {canAccessCategories && (
          <button
            onClick={() => setActiveMenu('categories')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeMenu === 'categories'
              ? 'bg-clover-600 text-white shadow-lg shadow-clover-200'
              : 'text-gray-600 hover:bg-clover-50 hover:text-clover-700'
              }`}
          >
            <Tag size={20} className={`transition-transform duration-200 ${activeMenu === 'categories' ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium">Categorías</span>
          </button>
        )}
      </nav>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-medium"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

