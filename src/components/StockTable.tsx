import React, { useState } from 'react';
import { Trash2, Edit2, ArrowUpDown } from 'lucide-react';
import { InventoryItem } from '../types';
import { getTotalStock, getExpirationStatus, getRowBgColor } from '../utils/inventory';

interface StockTableProps {
  inventory: InventoryItem[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: InventoryItem) => void;
}

const StockTable: React.FC<StockTableProps> = ({ inventory, onDeleteProduct, onEditProduct }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedInventory = [...inventory].sort((a, b) => {
    return sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-gray-200">
      <table className="min-w-full border-collapse">
        <thead className="bg-clover-100 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
              <button onClick={toggleSort} className="flex items-center gap-1 hover:text-clover-700">
                Producto
                <ArrowUpDown size={14} />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Tallas</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Stock Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Stock Mínimo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Última Compra</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Vencimiento</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Precio Unit.</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedInventory.map(item => (
            <tr key={item.id} className={`${getRowBgColor(item.expirationDate)} hover:bg-clover-50 transition-colors`}>
              <td className="px-4 py-3 border border-gray-200 font-medium text-gray-900">{item.name}</td>
              <td className="px-4 py-3 border border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {item.categories.map(cat => (
                    <span key={cat.id} className="bg-clover-100 border-2 border-clover-500 text-gray-900 px-3 py-1 rounded-md text-xs font-semibold">
                      {cat.name}: {cat.stock}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 border border-gray-200 text-center font-bold text-gray-900">{getTotalStock(item)}</td>
              <td className="px-4 py-3 border border-gray-200 text-center text-gray-700">{item.minStock}</td>
              <td className="px-4 py-3 border border-gray-200 text-gray-700">{item.lastPurchaseDate}</td>
              <td className={`px-4 py-3 border border-gray-200 ${getExpirationStatus(item.expirationDate)}`}>
                {item.expirationDate}
              </td>
              <td className="px-4 py-3 border border-gray-200 text-gray-700">${item.pricePerUnit.toLocaleString()}</td>
              <td className="px-4 py-3 border border-gray-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditProduct(item)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(item.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;

