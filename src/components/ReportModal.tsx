import React, { useRef } from 'react';
import { X, Download, TrendingUp, TrendingDown, Calendar, DollarSign, Package, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PurchaseOrder, Assignment, InventoryItem } from '../types';

interface ReportModalProps {
    show: boolean;
    onClose: () => void;
    purchaseOrders: PurchaseOrder[];
    assignments: Assignment[];
    inventory: InventoryItem[];
}

const ReportModal: React.FC<ReportModalProps> = ({ show, onClose, purchaseOrders, assignments, inventory }) => {
    const reportRef = useRef<HTMLDivElement>(null);

    if (!show) return null;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // === YEARLY COMPARISONS ===
    const getYearlyData = () => {
        const years = [currentYear - 2, currentYear - 1, currentYear];
        return years.map(year => {
            const yearOrders = purchaseOrders.filter(o => o.anio === year);
            const total = yearOrders.reduce((sum, o) => sum + o.montoTotal, 0);
            const count = yearOrders.length;
            return { year: year.toString(), total, count };
        });
    };

    const yearlyData = getYearlyData();
    const currentYearTotal = yearlyData[2]?.total || 0;
    const lastYearTotal = yearlyData[1]?.total || 0;
    const yearlyGrowth = lastYearTotal > 0 ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

    // === MONTHLY COMPARISONS (Current Year) ===
    const getMonthlyData = () => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return months.map((name, index) => {
            const monthOrders = purchaseOrders.filter(o => {
                const orderDate = new Date(o.fechaOrden);
                return o.anio === currentYear && orderDate.getMonth() === index;
            });
            const total = monthOrders.reduce((sum, o) => sum + o.montoTotal, 0);
            const count = monthOrders.length;
            return { month: name, total, count };
        });
    };

    const monthlyData = getMonthlyData();
    const currentMonthTotal = monthlyData[currentMonth]?.total || 0;
    const lastMonthTotal = monthlyData[currentMonth - 1]?.total || 0;
    const monthlyGrowth = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // === ASSIGNMENTS BY MONTH ===
    const getAssignmentsByMonth = () => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const counts = new Array(12).fill(0);
        assignments.forEach(a => {
            const date = new Date(a.assignmentDate);
            if (date.getFullYear() === currentYear && !isNaN(date.getTime())) {
                counts[date.getMonth()] += a.quantity;
            }
        });
        return months.map((name, index) => ({ month: name, assignments: counts[index] }));
    };

    const assignmentMonthlyData = getAssignmentsByMonth();

    // === INVENTORY DISTRIBUTION ===
    const getCategoryDistribution = () => {
        const categoryMap: Record<string, number> = {};
        inventory.forEach(item => {
            const cat = item.category || 'Otros';
            const totalStock = item.categories.reduce((sum, c) => sum + c.stock, 0);
            categoryMap[cat] = (categoryMap[cat] || 0) + totalStock;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    };

    const categoryData = getCategoryDistribution();
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

    // === TOP SUPPLIERS ===
    const getTopSuppliers = () => {
        const supplierMap: Record<string, number> = {};
        purchaseOrders.forEach(o => {
            if (o.anio === currentYear) {
                supplierMap[o.proveedor] = (supplierMap[o.proveedor] || 0) + o.montoTotal;
            }
        });
        return Object.entries(supplierMap)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    };

    const topSuppliers = getTopSuppliers();

    // === PDF GENERATION ===
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Reporte_${currentYear}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Por favor, intente nuevamente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-7xl shadow-2xl overflow-hidden animate-scaleIn my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-clover-600 to-clover-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Reporte Ejecutivo {currentYear}</h2>
                        <p className="text-clover-100 text-sm">Análisis Comparativo de Compras e Inventario</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 bg-white text-clover-700 px-4 py-2 rounded-lg font-semibold hover:bg-clover-50 transition-colors shadow-lg"
                        >
                            <Download size={20} />
                            Descargar PDF
                        </button>
                        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div ref={reportRef} className="p-8 bg-gray-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="text-clover-600" size={24} />
                                <span className={`text-sm font-semibold ${yearlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {yearlyGrowth >= 0 ? <TrendingUp size={16} className="inline" /> : <TrendingDown size={16} className="inline" />}
                                    {Math.abs(yearlyGrowth).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">Inversión {currentYear}</p>
                            <p className="text-2xl font-bold text-gray-900">${currentYearTotal.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar className="text-blue-600" size={24} />
                                <span className={`text-sm font-semibold ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {monthlyGrowth >= 0 ? <TrendingUp size={16} className="inline" /> : <TrendingDown size={16} className="inline" />}
                                    {Math.abs(monthlyGrowth).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">Mes Actual</p>
                            <p className="text-2xl font-bold text-gray-900">${currentMonthTotal.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <Package className="text-purple-600" size={24} />
                            </div>
                            <p className="text-gray-500 text-sm">Total Productos</p>
                            <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="text-orange-600" size={24} />
                            </div>
                            <p className="text-gray-500 text-sm">Asignaciones {currentYear}</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignments.filter(a => new Date(a.assignmentDate).getFullYear() === currentYear).length}
                            </p>
                        </div>
                    </div>

                    {/* Yearly Comparison */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Comparación Anual de Inversión</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yearlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="year" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total']}
                                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="total" fill="#10B981" name="Inversión Total" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Inversión Mensual {currentYear}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total']}
                                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} name="Inversión" dot={{ fill: '#3B82F6', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Asignaciones Mensuales {currentYear}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={assignmentMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                                    <Legend />
                                    <Bar dataKey="assignments" fill="#F59E0B" name="Cantidad Asignada" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribution & Suppliers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Inventario</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Proveedores {currentYear}</h3>
                            <div className="space-y-4">
                                {topSuppliers.map((supplier, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white`}
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-900">{supplier.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">${supplier.total.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>Reporte generado el {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="mt-1">Sistema de Gestión de Inventario - Clover</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
