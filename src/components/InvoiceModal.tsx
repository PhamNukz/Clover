import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { PurchaseOrder } from '../types';

interface InvoiceModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (orderId: number, invoiceData: Partial<PurchaseOrder>) => void;
    order: PurchaseOrder | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ show, onClose, onSave, order }) => {
    const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
        numeroFactura: '',
        fechaEmisionFactura: '',
        fechaPago: '',
        metodoPago: '',
        documentoUrl: '',
        documentoNombre: ''
    });

    useEffect(() => {
        if (show && order) {
            setFormData({
                numeroFactura: order.numeroFactura || '',
                fechaEmisionFactura: order.fechaEmisionFactura || '',
                fechaPago: order.fechaPago || '',
                metodoPago: order.metodoPago || '',
                documentoUrl: order.documentoUrl || '',
                documentoNombre: order.documentoNombre || ''
            });
        }
    }, [show, order]);

    const handleChange = (field: keyof PurchaseOrder, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (order) {
            onSave(order.id, formData);
        }
        onClose();
    };

    if (!show || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Información de Factura
                        </h2>
                        <p className="text-sm text-gray-500">Orden N° {order.numeroOrden}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">N° Factura</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.numeroFactura || ''}
                                    onChange={(e) => handleChange('numeroFactura', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Emisión</label>
                                <input
                                    type="date"
                                    value={formData.fechaEmisionFactura || ''}
                                    onChange={(e) => handleChange('fechaEmisionFactura', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Pago</label>
                                <input
                                    type="date"
                                    value={formData.fechaPago || ''}
                                    onChange={(e) => handleChange('fechaPago', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Metodo Pago</label>
                                <select
                                    value={formData.metodoPago || ''}
                                    onChange={(e) => handleChange('metodoPago', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Crédito">Crédito</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Documento Adjunto</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subir Factura / PDF</label>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            setFormData(prev => ({
                                                ...prev,
                                                documentoUrl: url,
                                                documentoNombre: file.name
                                            }));
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-clover-50 file:text-clover-700 hover:file:bg-clover-100"
                                />
                                {formData.documentoNombre && (
                                    <p className="mt-1 text-xs text-green-600 font-medium">
                                        Archivo seleccionado: {formData.documentoNombre}
                                    </p>
                                )}
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
                        form="invoice-form"
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-clover-600 text-white font-medium rounded-lg hover:bg-clover-700 transition-colors shadow-sm"
                    >
                        <Save size={18} />
                        Guardar Información
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
