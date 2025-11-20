import React from 'react';
import { ShoppingCart, Package, Users, AlertTriangle, Calendar } from 'lucide-react';
import { InventoryItem } from '../types';
import { getTotalStock, getLowStockItems, getExpiringItems, getTotalInvestment, getDaysUntilExpiration } from '../utils/inventory';

interface DashboardProps {
  inventory: InventoryItem[];
  assignmentsCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, assignmentsCount }) => {
  const lowStockItems = getLowStockItems(inventory);
  const expiringItems = getExpiringItems(inventory);
  const totalInvestment = getTotalInvestment(inventory);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600">Inversión Total</h3>
            <ShoppingCart className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold">${totalInvestment.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600">Productos</h3>
            <Package className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold">{inventory.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600">Asignaciones</h3>
            <Users className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold">{assignmentsCount}</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-xl font-bold">Stock Bajo</h3>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock actual: {getTotalStock(item)} | Mínimo: {item.minStock}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay productos con stock bajo</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="text-yellow-600" size={24} />
            <h3 className="text-xl font-bold">Próximos a Vencer</h3>
          </div>
          {expiringItems.length > 0 ? (
            <div className="space-y-2">
              {expiringItems.map(item => {
                const diffDays = getDaysUntilExpiration(item.expirationDate);
                return (
                  <div key={item.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Vence en {diffDays} días ({item.expirationDate})
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay productos próximos a vencer</p>
          )}
        </div>
      </div>

      {/* Stock Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Estadísticas de Inventario</h3>
        <div className="space-y-4">
          {inventory.map(item => (
            <div key={item.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{item.name}</span>
                <span className="text-gray-600">Total: {getTotalStock(item)} unidades</span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {item.categories.map(cat => (
                  <div key={cat.id} className="text-center p-2 bg-gray-100 rounded min-w-[80px]">
                    <div className="font-semibold">{cat.name}</div>
                    <div className="text-gray-600">{cat.stock}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

