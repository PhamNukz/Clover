import React from 'react';
import { Plus, ArrowRightLeft, UserPlus, Printer } from 'lucide-react';
import { InventoryItem, Assignment } from '../types';
import StockTable from './StockTable';
import ProductDetailsModal from './ProductDetailsModal';

interface InventoryProps {
  inventory: InventoryItem[];
  assignments: Assignment[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: InventoryItem) => void;
  onShowAddProduct: () => void;
  onStartBulkAssignment: () => void;
  onRegisterEntry: () => void;
}

const Inventory: React.FC<InventoryProps> = ({
  inventory,
  assignments,
  onDeleteProduct,
  onEditProduct,
  onShowAddProduct,
  onStartBulkAssignment,
  onRegisterEntry
}) => {
  const [selectedProduct, setSelectedProduct] = React.useState<InventoryItem | null>(null);

  const handlePrintInventory = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const totalStock = inventory.reduce((sum, item) =>
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
                <th>Producto</th>
                <th>Talla / Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
              </tr>
            </thead>
            <tbody>
              ${inventory.map(item =>
      item.categories.map((cat, idx) => `
                  <tr>
                    <td>${idx === 0 ? `<strong>${item.name}</strong>` : ''}</td>
                    <td>${cat.name}</td>
                    <td>${cat.stock}</td>
                    <td>${cat.minStock || '-'}</td>
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
        // Allow some time for the print dialog to open before removing, 
        // though removing it might be delayed until after the user interacts in some browsers.
        // A safe bet is a longer timeout or just 10 seconds to ensure the dialog had time to spin up.
        // Or simply wait.
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

      <StockTable
        inventory={inventory}
        onDeleteProduct={onDeleteProduct}
        onEditProduct={(p) => onEditProduct(p)}
        onProductClick={setSelectedProduct}
      />

      <ProductDetailsModal
        product={selectedProduct}
        assignments={assignments}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Inventory;
