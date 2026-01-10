import React from 'react';
import { X, Package, Activity, AlertTriangle } from 'lucide-react';
import { InventoryItem, Assignment } from '../types';
import { getTotalStock } from '../utils/inventory';

interface ProductDetailsModalProps {
    product: InventoryItem | null;
    assignments: Assignment[];
    onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, assignments, onClose }) => {
    if (!product) return null;

    const productAssignments = assignments.filter(a => a.equipment === product.name);
    const totalStock = getTotalStock(product);

    // Close on ESC
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fadeIn">
            {/* Click inside stops propagation so backdrop click works on the outer div */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 rounded-t-xl">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 bg-clover-100 rounded-lg text-clover-700">
                            <Package size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                            <p className="text-gray-500 text-sm">ID: {product.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Base Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 font-semibold mb-1">Stock Total</p>
                            <p className="text-3xl font-bold text-blue-900">{totalStock}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-sm text-green-600 font-semibold mb-1">Precio Unitario</p>
                            <p className="text-3xl font-bold text-green-900">${product.pricePerUnit.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-sm text-purple-600 font-semibold mb-1">Vencimiento</p>
                            <p className="text-xl font-bold text-purple-900 mt-2">{product.expirationDate || 'N/A'}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <p className="text-sm text-orange-600 font-semibold mb-1">Categorías/Tallas</p>
                            <p className="text-3xl font-bold text-orange-900">{product.categories.length}</p>
                        </div>
                    </div>

                    {/* Sizes and Stock Detail */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-clover-600" />
                            Detalle por Talla
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talla</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código de Barras</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {product.categories.map((cat, idx) => {
                                        const isLowStock = cat.stock < (cat.minStock || 0);
                                        return (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cat.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">{cat.barcodes?.join(', ') || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cat.stock}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cat.minStock || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isLowStock ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 gap-1">
                                                            <AlertTriangle size={12} /> Bajo Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Normal
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Movements / Assignments */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-blue-600" />
                            Historial de Movimientos (Asignaciones)
                        </h3>
                        {productAssignments.length > 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talla</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {productAssignments.map((a) => (
                                            <tr key={a.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{a.personName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{a.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{a.quantity || 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{a.assignmentDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 italic border border-gray-200">
                                No hay movimientos registrados para este producto.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
