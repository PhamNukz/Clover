import React, { useState } from 'react';
import { Plus, ArrowRightLeft, UserPlus, Printer, Search, ScanBarcode } from 'lucide-react';
import { InventoryItem, Assignment } from '../types';
import StockTable from './StockTable';
import ProductDetailsModal from './ProductDetailsModal';
import BarcodeScannerModal from './BarcodeScannerModal';

interface InventoryProps {
  inventory: InventoryItem[];
  assignments: Assignment[];
  productCategories: string[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: InventoryItem) => void;
  onShowAddProduct: () => void;
  onStartBulkAssignment: () => void;
  onRegisterEntry: () => void;
}

const Inventory: React.FC<InventoryProps> = ({
  inventory,
  assignments,
  productCategories,
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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categories.some(cat => cat.barcode?.includes(searchTerm)); // Search by name or barcode
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleScanResult = (code: string) => {
    setSearchTerm(code);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play failed', e));
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
          <button
            onClick={handlePrintInventory}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-lg"
          >
            <Printer size={20} />
            <span>Imprimir Bodega</span>
          </button>

          <button
            onClick={onRegisterEntry}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-lg"
          >
            <ArrowRightLeft size={20} />
            <span>Control de Stock</span>
          </button>

          <button
            onClick={onStartBulkAssignment}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <UserPlus size={20} />
            <span>Asignar Equipos</span>
          </button>

          <button
            onClick={onShowAddProduct}
            className="flex items-center space-x-2 bg-clover-600 text-white px-4 py-2 rounded-lg hover:bg-clover-700 transition shadow-lg"
          >
            <Plus size={20} />
            <span>Agregar Producto</span>
          </button>
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
