import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, Settings, ChevronDown, Upload } from 'lucide-react';
import { PurchaseOrder } from '../types';
import PurchaseOrderModal from './PurchaseOrderModal';
import PDFViewerModal from './PDFViewerModal';
import InvoiceModal from './InvoiceModal';

interface PurchaseOrdersProps {
    orders: PurchaseOrder[];
    onAddOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
    onUpdateOrder: (order: PurchaseOrder) => void;
    onDeleteOrder: (id: number) => void;
}

const AVAILABLE_COLUMNS = [
    { id: 'numeroOrden', label: 'N° Orden' },
    { id: 'anio', label: 'Año' },
    { id: 'fechaOrden', label: 'Fecha O/C' },
    { id: 'emisor', label: 'Emisor O/C' },
    { id: 'proveedor', label: 'Proveedor' },
    { id: 'montoNeto', label: 'Neto' },
    { id: 'iva', label: 'IVA' },
    { id: 'montoTotal', label: 'Total' },
    { id: 'numeroFactura', label: 'N° Factura' },
    { id: 'guiaDespacho', label: 'Guía de Despacho' },
    { id: 'fechaEmisionFactura', label: 'Fecha Emisión Factura' },
    { id: 'fechaPago', label: 'Fecha Pago' },
    { id: 'metodoPago', label: 'Método de Pago' },
    { id: 'observaciones', label: 'Observaciones' },
    { id: 'estado', label: 'Estado' }, // Derived column
    { id: 'acciones', label: 'Acciones' } // Derived column
];

const DEFAULT_VISIBLE_COLUMNS = [
    'numeroOrden', 'fechaOrden', 'proveedor', 'observaciones',
    'montoNeto', 'iva', 'montoTotal', 'numeroFactura', 'estado', 'acciones'
];

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({
    orders,
    onAddOrder,
    onUpdateOrder,
    onDeleteOrder
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfTitle, setPdfTitle] = useState('');

    // Invoice Modal State
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [editingOrderForInvoice, setEditingOrderForInvoice] = useState<PurchaseOrder | null>(null);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        const saved = localStorage.getItem('purchaseOrdersVisibleColumns');
        return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const columnMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem('purchaseOrdersVisibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
                setShowColumnMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumn = (columnId: string) => {
        setVisibleColumns(prev =>
            prev.includes(columnId)
                ? prev.filter(id => id !== columnId)
                : [...prev, columnId]
        );
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.observaciones.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === 'all' || order.anio === selectedYear;
        return matchesSearch && matchesYear;
    }).sort((a, b) => {
        const dateA = new Date(a.fechaOrden).getTime();
        const dateB = new Date(b.fechaOrden).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const toggleSortOrder = () => {
        setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    };

    const handleEdit = (order: PurchaseOrder) => {
        setEditingOrder(order);
        setShowModal(true);
    };

    const handleViewDocument = (numeroOrden: number, type: 'invoice' | 'api' = 'api') => {
        const order = orders.find(o => o.numeroOrden === numeroOrden);
        let path = '';
        let title = '';

        if (order?.documentoUrl) {
            path = order.documentoUrl;
            title = order.documentoNombre || `Documento Orden N° ${numeroOrden}`;
        } else {
            const baseUrl = import.meta.env.BASE_URL;
            const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
            path = `${prefix}ordenes-compra/orden_${numeroOrden}.pdf`;
            title = `Documento Orden N° ${numeroOrden}`;
        }

        if (type === 'invoice') {
            setPdfUrl(path);
            setPdfTitle(`Factura Orden N° ${numeroOrden}`);
        } else {
            setPdfUrl(path);
            setPdfTitle(title);
        }
        setShowPdfModal(true);
    };

    const handleInvoiceSave = (orderId: number, invoiceData: Partial<PurchaseOrder>) => {
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (orderToUpdate) {
            onUpdateOrder({
                ...orderToUpdate,
                ...invoiceData
            });
        }
        setShowInvoiceModal(false);
        setEditingOrderForInvoice(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId);

    return (
        <div className="p-8 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Órdenes de Compra</h2>
                <div className="flex gap-2">
                    {/* Column Toggle Dropdown */}
                    <div className="relative" ref={columnMenuRef}>
                        <button
                            onClick={() => setShowColumnMenu(!showColumnMenu)}
                            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm"
                        >
                            <Settings size={20} />
                            <ChevronDown size={16} />
                        </button>
                        {showColumnMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Columnas Visibles</h4>
                                    <div className="space-y-2">
                                        {AVAILABLE_COLUMNS.map(col => (
                                            <label key={col.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.includes(col.id)}
                                                    onChange={() => toggleColumn(col.id)}
                                                    className="rounded border-gray-300 text-clover-600 focus:ring-clover-500"
                                                />
                                                <span className="text-sm text-gray-700">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setEditingOrder(null);
                            setShowModal(true);
                        }}
                        className="flex items-center space-x-2 bg-clover-600 text-white px-4 py-2 rounded-lg hover:bg-clover-700 transition shadow-lg"
                    >
                        <Plus size={20} />
                        <span>Nueva Orden</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4 flex-wrap items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por proveedor o detalle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedYear(val === 'all' ? 'all' : parseInt(val));
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none bg-white min-w-[140px]"
                    >
                        <option value="all">Todos los años</option>
                        {[2022, 2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <button
                        onClick={toggleSortOrder}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700"
                        title={sortOrder === 'asc' ? 'Más antiguos primero' : 'Más recientes primero'}
                    >
                        <Clock size={20} className={sortOrder === 'asc' ? 'transform rotate-180' : ''} />
                        <span className="hidden sm:inline text-sm font-medium">
                            {sortOrder === 'asc' ? 'Antiguos → Nuevos' : 'Nuevos → Antiguos'}
                        </span>
                    </button>
                </div>
            </div>

            {/* DataGrid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                {isColumnVisible('numeroOrden') && <th className="px-4 py-3 min-w-[80px]">N° Orden</th>}
                                {isColumnVisible('anio') && <th className="px-4 py-3 min-w-[80px]">Año</th>}
                                {isColumnVisible('fechaOrden') && <th className="px-4 py-3 min-w-[100px]">Fecha O/C</th>}
                                {isColumnVisible('emisor') && <th className="px-4 py-3 min-w-[150px]">Emisor O/C</th>}
                                {isColumnVisible('proveedor') && <th className="px-4 py-3 min-w-[200px]">Proveedor</th>}
                                {isColumnVisible('observaciones') && <th className="px-4 py-3 min-w-[250px]">Detalle</th>}
                                {isColumnVisible('montoNeto') && <th className="px-4 py-3 text-right">Neto</th>}
                                {isColumnVisible('iva') && <th className="px-4 py-3 text-right">IVA</th>}
                                {isColumnVisible('montoTotal') && <th className="px-4 py-3 text-right">Total</th>}
                                {isColumnVisible('numeroFactura') && <th className="px-4 py-3">N° Factura</th>}
                                {isColumnVisible('guiaDespacho') && <th className="px-4 py-3">Guía de Despacho</th>}
                                {isColumnVisible('fechaEmisionFactura') && <th className="px-4 py-3">Fecha Emisión</th>}
                                {isColumnVisible('fechaPago') && <th className="px-4 py-3">Fecha Pago</th>}
                                {isColumnVisible('metodoPago') && <th className="px-4 py-3">Método de Pago</th>}
                                {isColumnVisible('estado') && <th className="px-4 py-3 text-center">Estado</th>}
                                {isColumnVisible('acciones') && <th className="px-4 py-3 text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${!order.fechaPago ? 'bg-orange-50/30' : ''}`}>
                                        {isColumnVisible('numeroOrden') && <td className="px-4 py-3 font-medium text-gray-900">#{order.numeroOrden}</td>}
                                        {isColumnVisible('anio') && <td className="px-4 py-3 text-gray-600">{order.anio}</td>}
                                        {isColumnVisible('fechaOrden') && <td className="px-4 py-3 text-gray-600">{new Date(order.fechaOrden).toLocaleDateString()}</td>}
                                        {isColumnVisible('emisor') && <td className="px-4 py-3 text-gray-600">{order.emisor}</td>}
                                        {isColumnVisible('proveedor') && <td className="px-4 py-3 font-medium text-gray-800">{order.proveedor}</td>}
                                        {isColumnVisible('observaciones') && (
                                            <td className="px-4 py-3 text-gray-500 truncate max-w-[250px]" title={order.observaciones}>
                                                {order.observaciones}
                                            </td>
                                        )}
                                        {isColumnVisible('montoNeto') && <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(order.montoNeto)}</td>}
                                        {isColumnVisible('iva') && <td className="px-4 py-3 text-right text-gray-500 text-xs">{formatCurrency(order.iva)}</td>}
                                        {isColumnVisible('montoTotal') && <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(order.montoTotal)}</td>}
                                        {isColumnVisible('numeroFactura') && (
                                            <td className="px-4 py-3 text-gray-600">
                                                {order.numeroFactura ? (
                                                    <button
                                                        onClick={() => handleViewDocument(order.numeroOrden, 'invoice')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-full text-xs font-semibold transition-colors"
                                                        title="Ver Factura"
                                                    >
                                                        <FileText size={14} />
                                                        <span>{order.numeroFactura}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingOrderForInvoice(order);
                                                            setShowInvoiceModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-gray-500 hover:text-clover-600 hover:bg-clover-50 border border-dashed border-gray-300 hover:border-clover-300 rounded-lg text-xs transition-all group"
                                                    >
                                                        <Upload size={14} className="group-hover:scale-110 transition-transform" />
                                                        <span>Agregar</span>
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                        {isColumnVisible('guiaDespacho') && <td className="px-4 py-3 text-gray-600">{order.guiaDespacho || '-'}</td>}
                                        {isColumnVisible('fechaEmisionFactura') && <td className="px-4 py-3 text-gray-600">{order.fechaEmisionFactura ? new Date(order.fechaEmisionFactura).toLocaleDateString() : '-'}</td>}
                                        {isColumnVisible('fechaPago') && <td className="px-4 py-3 text-gray-600">{order.fechaPago ? new Date(order.fechaPago).toLocaleDateString() : '-'}</td>}
                                        {isColumnVisible('metodoPago') && <td className="px-4 py-3 text-gray-600">{order.metodoPago || '-'}</td>}
                                        {isColumnVisible('estado') && (
                                            <td className="px-4 py-3 text-center">
                                                {order.fechaPago ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <CheckCircle size={12} /> Pagado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                        <Clock size={12} /> Pendiente
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {isColumnVisible('acciones') && (
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDocument(order.numeroOrden)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Ver Documento"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteOrder(order.id)}
                                                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-gray-500">
                                        No se encontraron órdenes de compra para el año {selectedYear}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InvoiceModal
                show={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false);
                    setEditingOrderForInvoice(null);
                }}
                onSave={handleInvoiceSave}
                order={editingOrderForInvoice}
            />

            <PurchaseOrderModal
                show={showModal}
                onClose={() => setShowModal(false)}
                existingOrder={editingOrder}
                orders={orders} // Pass all orders for validation
                onSave={onAddOrder}
                onUpdate={onUpdateOrder}
            />

            <PDFViewerModal
                show={showPdfModal}
                onClose={() => setShowPdfModal(false)}
                pdfUrl={pdfUrl}
                title={pdfTitle}
            />
        </div>
    );
};

export default PurchaseOrders;
