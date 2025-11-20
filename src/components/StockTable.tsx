import React from 'react';
import { Trash2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { getTotalStock, getExpirationStatus, getRowBgColor } from '../utils/inventory';

interface StockTableProps {
  inventory: InventoryItem[];
  onDeleteProduct: (id: string) => void;
}

const StockTable: React.FC<StockTableProps> = ({ inventory, onDeleteProduct }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Producto</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Categorías/Tallas</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Stock Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Stock Mínimo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Última Compra</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Vencimiento</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Precio Unit.</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id} className={`${getRowBgColor(item.expirationDate)} hover:opacity-75`}>
              <td className="px-4 py-3 border font-medium">{item.name}</td>
              <td className="px-4 py-3 border">
                <div className="flex flex-wrap gap-1">
                  {item.categories.map(cat => (
                    <span key={cat.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {cat.name}: {cat.stock}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 border text-center font-bold">{getTotalStock(item)}</td>
              <td className="px-4 py-3 border text-center">{item.minStock}</td>
              <td className="px-4 py-3 border">{item.lastPurchaseDate}</td>
              <td className={`px-4 py-3 border ${getExpirationStatus(item.expirationDate)}`}>
                {item.expirationDate}
              </td>
              <td className="px-4 py-3 border">${item.pricePerUnit.toLocaleString()}</td>
              <td className="px-4 py-3 border">
                <button
                  onClick={() => onDeleteProduct(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;

