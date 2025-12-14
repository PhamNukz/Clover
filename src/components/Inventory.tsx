import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowRightLeft, UserPlus, Printer, Search, ScanBarcode, Settings, ChevronDown } from 'lucide-react';
import { InventoryItem, Assignment, Role } from '../types';
import StockTable from './StockTable';
import ProductDetailsModal from './ProductDetailsModal';
import BarcodeScannerModal from './BarcodeScannerModal';

interface InventoryProps {
  inventory: InventoryItem[];
  assignments: Assignment[];
  productCategories: string[];
  userRole: Role;
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: InventoryItem) => void;
  onShowAddProduct: () => void;
  onStartBulkAssignment: () => void;
  onRegisterEntry: () => void;
}

const AVAILABLE_COLUMNS = [
  { id: 'producto', label: 'Producto' },
  { id: 'tallas', label: 'Tallas' },
  { id: 'stock', label: 'Stock Total' },
  { id: 'vencimiento', label: 'Vencimiento' },
  { id: 'codigos', label: 'Códigos de Barras' },
  { id: 'acciones', label: 'Acciones' }
];

const DEFAULT_VISIBLE_COLUMNS = ['producto', 'tallas', 'stock', 'vencimiento', 'acciones'];

const Inventory: React.FC<InventoryProps> = ({
  inventory,
  assignments,
  productCategories,
  userRole,
  onDeleteProduct,
  onEditProduct,
  onShowAddProduct,
  onStartBulkAssignment,
  onRegisterEntry
}) => {
  const [selectedProduct, setSelectedProduct] = React.useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showScanner, setShowScanner] = useState(false);

  const isReadOnly = userRole === 'operator';

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('inventoryVisibleColumns');
    return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('inventoryVisibleColumns', JSON.stringify(visibleColumns));
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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categories.some(cat => cat.barcode?.includes(searchTerm)); // Search by name or barcode
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleScanResult = (code: string) => {
    setSearchTerm(code);
    setShowScanner(false);
  };

  const handlePrintInventory = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Use filtered inventory for print if desired, or all inventory. Let's print visible (filtered) for better utility.
    const itemsToPrint = filteredInventory;
    const totalStock = itemsToPrint.reduce((sum, item) =>
      sum + item.categories.reduce((cSum, cat) => cSum + cat.stock, 0), 0
    );

    const html = `
      <html>
        <head>
          <title>Reporte de Bodega - Clover</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #16a34a; padding-bottom: 10px; }
            .header { margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { font-weight: bold; margin-top: 20px; font-size: 1.2em; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventario General</h1>
            <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Producto</th>
                <th>Talla / Variante</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Código de Barras</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToPrint.map(item =>
      item.categories.map((cat, idx) => `
                  <tr>
                    <td>${idx === 0 ? item.category || '-' : ''}</td>
                    <td>${idx === 0 ? `<strong>${item.name}</strong>` : ''}</td>
                    <td>${cat.name}</td>
                    <td>${cat.stock}</td>
                    <td>${cat.minStock || '-'}</td>
                    <td>${cat.barcode || '-'}</td>
                  </tr>
                `).join('')
    ).join('')}
            </tbody>
          </table>
          <div class="total">
            Total de Unidades en Bodega: ${totalStock}
          </div>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className="p-8 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Inventario</h2>

        <div className="flex gap-3">
          {/* Column Toggle Dropdown */}
          <div className="relative" ref={columnMenuRef}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm h-full"
              title="Configurar columnas"
            >
              <Settings size={20} />
              <ChevronDown size={16} />
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Columnas Visibles</h4>
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
            onClick={handlePrintInventory}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-lg"
          >
            <Printer size={20} />
            <span>Imprimir</span>
          </button>

          {!isReadOnly && (
            <>
              <button
                onClick={onRegisterEntry}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition shadow-lg font-bold"
              >
                <ArrowRightLeft size={20} />
                <span>Control de Stock</span>
              </button>

              <button
                onClick={onStartBulkAssignment}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                <UserPlus size={20} />
                <span>Asignar</span>
              </button>

              <button
                onClick={onShowAddProduct}
                className="flex items-center space-x-2 bg-clover-600 text-white px-4 py-2 rounded-lg hover:bg-clover-700 transition shadow-lg"
              >
                <Plus size={20} />
                <span>Agregar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o escanear código de barras..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Check for exact barcode match as we type (or scan)
              const match = inventory.some(item => item.categories.some(c => c.barcode === e.target.value));
              if (match && e.target.value.length > 3) {
                // Beep handled in onKeyDown for enter, or could be here
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const match = inventory.find(item => item.categories.some(c => c.barcode === searchTerm));
                if (match) {
                  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                  audio.play().catch(() => { });
                }
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => setShowScanner(true)}
              className="text-gray-400 hover:text-clover-600 transition-colors"
              title="Escanear Código de Barras"
            >
              <ScanBarcode size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none bg-white"
          >
            <option value="Todas">Todas</option>
            {productCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <StockTable
        inventory={filteredInventory}
        onDeleteProduct={onDeleteProduct}
        onEditProduct={(p) => onEditProduct(p)}
        onProductClick={setSelectedProduct}
        visibleColumns={visibleColumns}
        readOnly={isReadOnly}
      />

      <ProductDetailsModal
        product={selectedProduct}
        assignments={assignments}
        onClose={() => setSelectedProduct(null)}
      />

      <BarcodeScannerModal
        show={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />
    </div>
  );
};

export default Inventory;
