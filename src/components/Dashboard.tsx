import React from 'react';
import { ShoppingCart, Package, Users, AlertTriangle, Calendar, Activity, Plus, ArrowRight } from 'lucide-react';
import { InventoryItem, Assignment } from '../types';
import { getTotalStock, getLowStockItems, getExpiringItems, getTotalInvestment } from '../utils/inventory';

interface DashboardProps {
  inventory: InventoryItem[];
  assignmentsCount: number;
  assignments: Assignment[];
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, assignmentsCount, assignments }) => {
  const lowStockItems = getLowStockItems(inventory);
  const expiringItems = getExpiringItems(inventory);
  const totalInvestment = getTotalInvestment(inventory);

  // Get recent assignments (last 5)
  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime())
    .slice(0, 5);

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h1>
        <p className="text-gray-600 capitalize">{currentDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+2.5%</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Inversión Total</h3>
          <p className="text-3xl font-bold text-gray-900">${totalInvestment.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Productos en Inventario</h3>
          <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Asignaciones Totales</h3>
          <p className="text-3xl font-bold text-gray-900">{assignmentsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Content Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-clover-600 to-clover-800 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Acciones Rápidas</h3>
                <p className="text-clover-100">Gestiona tu inventario eficientemente</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg transition-colors font-medium">
                <Plus size={20} />
                Nuevo Producto
              </button>
              <button className="flex items-center gap-2 bg-white text-clover-900 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-sm">
                <Activity size={20} />
                Ver Reportes
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
              <button className="text-clover-600 text-sm font-medium hover:text-clover-700 flex items-center gap-1">
                Ver todo <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {recentAssignments.length > 0 ? (
                recentAssignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-clover-100 flex items-center justify-center text-clover-700 font-bold">
                        {assignment.personName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{assignment.personName}</p>
                        <p className="text-sm text-gray-500">Asignado: {assignment.equipment} ({assignment.quantity || 1})</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{assignment.assignmentDate}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-8">
          {/* Stock Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Salud del Inventario</h3>
            <div className="space-y-4">
              {inventory.slice(0, 5).map(item => {
                const totalStock = getTotalStock(item);
                const percentage = Math.min((totalStock / (item.minStock * 3)) * 100, 100);
                const colorClass = totalStock < item.minStock ? 'bg-red-500' : totalStock < item.minStock * 1.5 ? 'bg-yellow-500' : 'bg-green-500';

                return (
                  <div key={item.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="text-gray-500">{totalStock} / {item.minStock} min</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          {(lowStockItems.length > 0 || expiringItems.length > 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas</h3>
              <div className="space-y-3">
                {lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-red-900">Stock Bajo: {item.name}</p>
                      <p className="text-xs text-red-700">Quedan {getTotalStock(item)} unidades</p>
                    </div>
                  </div>
                ))}
                {expiringItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <Calendar className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Vence pronto: {item.name}</p>
                      <p className="text-xs text-yellow-700">{item.expirationDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

