import React from 'react';
import { ShoppingCart, Package, Users, AlertTriangle, Calendar, Activity, ArrowRight, Eye, EyeOff, Settings, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import HealthProductSelectionModal from './HealthProductSelectionModal';
import { InventoryItem, Assignment, Role } from '../types';
import { getTotalStock, getLowStockItems, getExpiringItems } from '../utils/inventory';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DashboardProps {
  inventory: InventoryItem[];
  assignmentsCount: number;
  assignments: Assignment[];
  purchaseOrders: any[];
  userRole: Role;
  onRegisterEntry: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, assignmentsCount, assignments, purchaseOrders, userRole, onRegisterEntry }) => {
  // --- State & Config ---
  const [showTotalInvestment, setShowTotalInvestment] = React.useState(() => {
    const saved = localStorage.getItem('dashboard_show_investment');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showHealthModal, setShowHealthModal] = React.useState(false);
  const [selectedHealthProducts, setSelectedHealthProducts] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_health_products');
    return saved ? JSON.parse(saved) : inventory.slice(0, 5).map(i => i.id);
  });

  const toggleInvestment = () => {
    const newValue = !showTotalInvestment;
    setShowTotalInvestment(newValue);
    localStorage.setItem('dashboard_show_investment', JSON.stringify(newValue));
  };

  const handleSaveHealthSelection = (ids: string[]) => {
    setSelectedHealthProducts(ids);
    localStorage.setItem('dashboard_health_products', JSON.stringify(ids));
  };

  const handleGenerateReport = () => {
    const currentYear = new Date().getFullYear();
    const currentTotal = purchaseOrders.filter(o => o.anio === currentYear).reduce((acc, curr) => acc + curr.montoTotal, 0);
    const lastYear = currentYear - 1;
    const lastYearTotal = purchaseOrders.filter(o => o.anio === lastYear).reduce((acc, curr) => acc + curr.montoTotal, 0);
    alert(`Reporte Comparativo:\n\nAño ${currentYear}: $${currentTotal.toLocaleString()}\nAño ${lastYear}: $${lastYearTotal.toLocaleString()}\n\nDiferencia: $${(currentTotal - lastYearTotal).toLocaleString()}`);
  };

  // --- Data Calculations ---
  const currentYear = new Date().getFullYear();
  const totalInvestment = purchaseOrders
    ? purchaseOrders.filter(o => o.anio === currentYear).reduce((sum, order) => sum + order.montoTotal, 0)
    : 0;

  const displayedHealthProducts = inventory.filter(item => selectedHealthProducts.includes(item.id));
  const lowStockItems = getLowStockItems(inventory);
  const expiringItems = getExpiringItems(inventory);

  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime())
    .slice(0, 5);

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Chart Data: Inventory by Category (Donut)
  const categoryDataMap = inventory.reduce((acc, item) => {
    const cat = item.category || 'Otros';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoryDataMap).map(key => ({ name: key, value: categoryDataMap[key] }));
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']; // Clover colorsish

  // Chart Data: Assignments History (Mock/Real Mix for Demo)
  const processAssignmentHistory = () => {
    if (assignments.length === 0) return [
      { name: 'Jan', count: 40 }, { name: 'Feb', count: 30 }, { name: 'Mar', count: 20 },
      { name: 'Apr', count: 27 }, { name: 'May', count: 18 }, { name: 'Jun', count: 23 },
    ];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const counts = new Array(12).fill(0);
    assignments.forEach(a => {
      const d = new Date(a.assignmentDate);
      if (!isNaN(d.getTime())) counts[d.getMonth()]++;
    });
    return months.map((m, i) => ({ name: m, count: counts[i] }));
  };

  const areaData = processAssignmentHistory();

  // --- Render ---
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Bienvenido de nuevo!</h1>
          <p className="text-gray-600 capitalize">{currentDate}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateReport} className="flex items-center gap-2 bg-white text-clover-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm font-medium">
            <Activity size={18} />
            Reportes
          </button>
          {userRole !== 'operator' && (
            <button
              onClick={onRegisterEntry}
              className="flex items-center gap-2 bg-clover-600 hover:bg-clover-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md shadow-clover-200"
            >
              <Plus size={18} />
              Nueva Entrada
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Revenue/Investment */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <button onClick={toggleInvestment} className="text-gray-400 hover:text-gray-600">
              {showTotalInvestment ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Inversión Total (Año)</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {showTotalInvestment ? `$${totalInvestment.toLocaleString()}` : '****'}
          </p>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-emerald-600 flex items-center gap-0.5"><TrendingUp size={12} /> +12%</span>
            <span className="text-gray-400">vs año anterior</span>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Productos Totales</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{inventory.length}</p>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-emerald-600 flex items-center gap-0.5"><TrendingUp size={12} /> +5</span>
            <span className="text-gray-400">nuevos este mes</span>
          </div>
        </div>

        {/* Card 3: Total Assignments */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Asignaciones</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{assignmentsCount}</p>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-red-600 flex items-center gap-0.5"><TrendingDown size={12} /> -2%</span>
            <span className="text-gray-400">vs mes anterior</span>
          </div>
        </div>

        {/* Card 4: Low Stock (Stock Health substitute) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Alertas Stock</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{lowStockItems.length + expiringItems.length}</p>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-gray-400">{lowStockItems.length} bajos, {expiringItems.length} por vencer</span>
          </div>
        </div>
      </div>

      {/* Charts & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Flow/Area Chart (Now 1/3) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col mb-4">
            <h3 className="text-lg font-bold text-gray-900">Flujo Asignaciones</h3>
            <p className="text-sm text-gray-500">Actividad anual</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={1} />
                <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#E5E7EB' }}
                />
                <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution & Alerts (Now 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-slideUp" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Estado de Inventario & Alertas</h3>
            <button className="text-gray-400 hover:text-gray-600"><Settings size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Donut */}
            <div className="h-64 w-full flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-bold text-gray-900">{inventory.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Productos</span>
              </div>
            </div>

            {/* Right: Alerts List */}
            <div className="h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-1 z-10 flex items-center justify-between">
                Alertas Activas
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{lowStockItems.length + expiringItems.length}</span>
              </h4>

              {lowStockItems.length === 0 && expiringItems.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <div className="bg-green-50 p-3 rounded-full mb-2">
                    <TrendingUp size={20} className="text-green-500" />
                  </div>
                  <p className="text-sm">Todo en orden</p>
                </div>
              )}

              {lowStockItems.map(item => (
                <div key={`low-${item.id}`} className="flex items-start gap-3 p-3 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100 transition-colors group">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-red-600 font-medium">Stock Crítico o Agotado</p>
                    <div className="mt-1 flex gap-2">
                      {item.categories.filter(c => c.stock < (c.minStock || 0)).map((c, i) => (
                        <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-red-200 text-red-700">
                          {c.name}: {c.stock}/{c.minStock}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {expiringItems.map(item => (
                <div key={`exp-${item.id}`} className="flex items-start gap-3 p-3 bg-yellow-50/50 hover:bg-yellow-50 rounded-xl border border-yellow-100 transition-colors group">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-500 group-hover:scale-110 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-yellow-700 font-medium">Vencimiento Próximo</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.expirationDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Table & Stock Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
            <div className="relative">
              {/* Search bar could go here */}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3 pl-2">Colaborador</th>
                  <th className="pb-3">Equipo</th>
                  <th className="pb-3">Cantidad</th>
                  <th className="pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentAssignments.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                    <td className="py-4 pl-2 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-clover-100 flex items-center justify-center text-xs font-bold text-clover-700">
                        {a.personName.charAt(0)}
                      </div>
                      {a.personName}
                    </td>
                    <td className="py-4 text-gray-600">{a.equipment}</td>
                    <td className="py-4 text-gray-600">{a.quantity || 1}</td>
                    <td className="py-4 text-gray-400">{a.assignmentDate}</td>
                  </tr>
                ))}
                {recentAssignments.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">Sin actividad reciente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Health Widget */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Stock Destacado</h3>
            <button onClick={() => setShowHealthModal(true)} className="text-gray-400 hover:text-clover-600"><Settings size={18} /></button>
          </div>
          <div className="space-y-6">
            {displayedHealthProducts.map(item => {
              const totalStock = getTotalStock(item);
              const percentage = Math.min((totalStock / (item.minStock || 1)) * 100, 100);
              const colorClass = totalStock < item.minStock ? 'bg-red-500' : totalStock < item.minStock * 1.5 ? 'bg-yellow-500' : 'bg-emerald-500';

              return (
                <div key={item.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-500 text-xs">{totalStock} / {item.minStock} Min</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colorClass} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
            {displayedHealthProducts.length === 0 && <p className="text-gray-400 text-center py-4">Sin productos configurados</p>}
          </div>
        </div>
      </div>

      <HealthProductSelectionModal
        show={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        inventory={inventory}
        selectedProductIds={selectedHealthProducts}
        onSave={handleSaveHealthSelection}
      />
    </div>
  );
};

export default Dashboard;
