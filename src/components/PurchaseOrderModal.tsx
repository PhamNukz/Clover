import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { PurchaseOrder } from '../types';

interface PurchaseOrderModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (order: Omit<PurchaseOrder, 'id'>) => void;
    onUpdate: (order: PurchaseOrder) => void;
    existingOrder?: PurchaseOrder | null;
    orders: PurchaseOrder[]; // For duplicate validation
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
    show,
    onClose,
    onSave,
    onUpdate,
    existingOrder,
    orders
}) => {
    const [formData, setFormData] = useState<Omit<PurchaseOrder, 'id'>>({
        numeroOrden: 0,
        anio: new Date().getFullYear(),
        fechaOrden: new Date().toISOString().split('T')[0],
        emisor: '',
        proveedor: '',
        montoNeto: 0,
        iva: 0,
        montoTotal: 0,
        observaciones: '',
        numeroFactura: '',
        guiaDespacho: '',
        fechaEmisionFactura: '',
        fechaPago: '',
        metodoPago: ''
    });

    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (show) {
            if (existingOrder) {
                setFormData({ ...existingOrder });
            } else {
                setFormData({
                    numeroOrden: 0,
                    anio: new Date().getFullYear(),
                    fechaOrden: new Date().toISOString().split('T')[0],
                    emisor: '',
                    proveedor: '',
                    montoNeto: 0,
                    iva: 0,
                    montoTotal: 0,
                    observaciones: '',
                    numeroFactura: '',
                    guiaDespacho: '',
                    fechaEmisionFactura: '',
                    fechaPago: '',
                    metodoPago: ''
                });
            }
            setError('');
        }
    }, [show, existingOrder]);

    const handleNetoChange = (value: number) => {
        const neto = value;
        const iva = Math.round(neto * 0.19);
        const total = neto + iva;
        setFormData(prev => ({ ...prev, montoNeto: neto, iva, montoTotal: total }));
    };

    const handleChange = (field: keyof Omit<PurchaseOrder, 'id'>, value: string | number) => {
        if (field === 'montoNeto') {
            handleNetoChange(Number(value));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.numeroOrden || formData.numeroOrden <= 0) {
            setError('El número de orden es inválido.');
            return;
        }

        if (!existingOrder) {
            // Validate duplicate: same number and same year
            const duplicate = orders.find(o => o.numeroOrden === formData.numeroOrden && o.anio === formData.anio);
            if (duplicate) {
                setError(`Ya existe la Orden N° ${formData.numeroOrden} para el año ${formData.anio}.`);
                return;
            }
        }

        if (existingOrder) {
            onUpdate({ ...formData, id: existingOrder.id } as PurchaseOrder);
        } else {
            onSave(formData);
        }
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {existingOrder ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
                        </h2>
                        <p className="text-sm text-gray-500">Complete los detalles de la orden</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="po-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">N° Orden</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.numeroOrden || ''}
                                    onChange={(e) => handleChange('numeroOrden', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                    disabled={!!existingOrder} // Prevent changing ID on edit if desired, or allow if logic permits
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                                <select
                                    value={formData.anio}
                                    onChange={(e) => handleChange('anio', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                >
                                    {[2022, 2023, 2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Orden</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.fechaOrden}
                                    onChange={(e) => handleChange('fechaOrden', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emisor</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.emisor}
                                    onChange={(e) => handleChange('emisor', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                    placeholder="Ej. Paola"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.proveedor}
                                    onChange={(e) => handleChange('proveedor', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                    placeholder="Ej. Ferretería Naval"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Montos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Neto</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.montoNeto || ''}
                                            onChange={(e) => handleChange('montoNeto', parseInt(e.target.value) || 0)}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">IVA (19%)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            readOnly
                                            value={formData.iva}
                                            className="w-full pl-7 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Total</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-900 font-bold">$</span>
                                        <input
                                            type="number"
                                            readOnly
                                            value={formData.montoTotal}
                                            className="w-full pl-7 pr-3 py-2 bg-clover-50 border border-clover-200 rounded-lg text-clover-900 font-bold cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones / Detalle</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.observaciones}
                                onChange={(e) => handleChange('observaciones', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                placeholder="Descripción detallada de los ítems..."
                            />
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Facturación y Pago (Opcional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">N° Factura</label>
                                    <input
                                        type="text"
                                        value={formData.numeroFactura || ''}
                                        onChange={(e) => handleChange('numeroFactura', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                        placeholder="Ej. 123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Guía de Despacho</label>
                                    <input
                                        type="text"
                                        value={formData.guiaDespacho || ''}
                                        onChange={(e) => handleChange('guiaDespacho', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                        placeholder="Ej. 98765"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Emisión Factura</label>
                                    <input
                                        type="date"
                                        value={formData.fechaEmisionFactura || ''}
                                        onChange={(e) => handleChange('fechaEmisionFactura', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Pago</label>
                                    <input
                                        type="date"
                                        value={formData.fechaPago || ''}
                                        onChange={(e) => handleChange('fechaPago', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                    <select
                                        value={formData.metodoPago || ''}
                                        onChange={(e) => handleChange('metodoPago', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Crédito">Crédito</option>
                                        <option value="Débito">Débito</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="po-form"
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-clover-600 text-white font-medium rounded-lg hover:bg-clover-700 transition-colors shadow-sm"
                    >
                        <Save size={18} />
                        Guardar Orden
                    </button>
                </div>
            </div >
        </div >
    );
};

export default PurchaseOrderModal;
