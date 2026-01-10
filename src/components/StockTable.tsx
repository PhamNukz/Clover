import React from 'react';
import { Trash2, Edit2, ArrowUpDown } from 'lucide-react';
import { InventoryItem } from '../types';

interface StockTableProps {
  inventory: InventoryItem[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: InventoryItem) => void;
  onProductClick: (product: InventoryItem) => void;
  visibleColumns: string[]; /* ['producto', 'tallas', 'stock', 'vencimiento', 'acciones'] */
  readOnly?: boolean;
}

const StockTable: React.FC<StockTableProps> = ({
  inventory,
  onDeleteProduct,
  onEditProduct,
  onProductClick,
  visibleColumns,
  readOnly = false
}) => {
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof InventoryItem | 'stock', direction: 'asc' | 'desc' } | null>(null);

  const isVisible = (columnId: string) => visibleColumns.includes(columnId);

  const getRowBgColor = (expiryDate: string) => {
    if (!expiryDate) return 'bg-white';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-50'; // Vencido
    if (diffDays <= 30) return 'bg-orange-50'; // Por vencer
    return 'bg-white';
  };

  const sortedInventory = React.useMemo(() => {
    let sortableItems = [...inventory];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof InventoryItem];
        let bValue: any = b[sortConfig.key as keyof InventoryItem];

        if (sortConfig.key === 'stock') {
          aValue = a.categories.reduce((sum, cat) => sum + cat.stock, 0);
          bValue = b.categories.reduce((sum, cat) => sum + cat.stock, 0);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [inventory, sortConfig]);

  const requestSort = (key: keyof InventoryItem | 'stock') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getRelativeExpiration = (expiryDate: string) => {
    if (!expiryDate) return 'Sin estimación';
    const today = new Date();
    const expiry = new Date(expiryDate);

    // Calculate difference in months
    let months = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());

    // Adjust for day difference if needed (e.g. if today is 20th and expiry is 10th of next month, it's not quite a full month difference in some contexts, but simple month diff is usually good enough for estimates)
    // Let's stick to simple month diff for "estimates"

    if (expiry < today) return 'Vencido';

    if (months < 1) {
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} días`;
    }

    if (months < 6) return `${months} mes${months > 1 ? 'es' : ''}`;
    if (months >= 6 && months < 12) return 'Más de 6 meses';
    if (months >= 12 && months < 18) return '1 año'; // 12-17 months
    if (months >= 18 && months < 24) return 'Más de 1 año';
    if (months >= 24) return `${Math.floor(months / 12)} años`; // 2+ years

    return `${months} meses`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-gray-200">
      <table className="min-w-full border-collapse">
        <thead className="bg-clover-100 sticky top-0">
          <tr>
            {isVisible('producto') && (
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200 cursor-pointer hover:bg-clover-200 transition-colors"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center gap-1">
                  Producto
                  <ArrowUpDown size={14} className="text-gray-500" />
                </div>
              </th>
            )}
            {isVisible('tallas') && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
                Tallas / Variantes (Stock)
              </th>
            )}
            {isVisible('stock') && (
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200 cursor-pointer hover:bg-clover-200 transition-colors"
                onClick={() => requestSort('stock')}
              >
                <div className="flex items-center gap-1">
                  Stock Total
                  <ArrowUpDown size={14} className="text-gray-500" />
                </div>
              </th>
            )}
            {isVisible('vencimiento') && (
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200 cursor-pointer hover:bg-clover-200 transition-colors"
                onClick={() => requestSort('expirationDate')}
              >
                <div className="flex items-center gap-1">
                  Vencimiento (Estimado)
                  <ArrowUpDown size={14} className="text-gray-500" />
                </div>
              </th>
            )}
            {isVisible('codigos') && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
                Códigos de Barras
              </th>
            )}
            {isVisible('acciones') && !readOnly && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedInventory.map(item => (
            <tr
              key={item.id}
              className={`${getRowBgColor(item.expirationDate)} hover:bg-clover-50 transition-colors cursor-pointer`}
              onClick={() => { if (!readOnly) onProductClick(item); }}
            >
              {isVisible('producto') && (
                <td className="px-4 py-3 border border-gray-200">
                  <div>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </div>
                </td>
              )}
              {isVisible('tallas') && (
                <td className="px-4 py-3 border border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.filter(c => (c.inTransit || 0) > 0).map((cat, idx) => (
                      <span key={`transit-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-purple-100 border-purple-500 text-purple-900">
                        {cat.name} (En Tránsito): {cat.inTransit}
                      </span>
                    ))}
                    {item.categories.map((cat, idx) => {
                      const min = cat.minStock || 0;
                      let colorClass = "bg-clover-100 border-clover-500 text-clover-900"; // Green (Above Min + 5)

                      if (cat.stock < min) {
                        colorClass = "bg-red-100 border-red-500 text-red-900"; // Red (Below Min)
                      } else if (cat.stock >= min && cat.stock <= min + 5) {
                        colorClass = "bg-yellow-100 border-yellow-500 text-yellow-900"; // Yellow (Within 0-5 of Min)
                      }

                      return (
                        <span key={idx} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
                          {cat.name}: {cat.stock} (Mín: {min})
                        </span>
                      );
                    })}
                  </div>
                </td>
              )}
              {isVisible('stock') && (
                <td className="px-4 py-3 border border-gray-200 font-medium text-gray-900">
                  {item.categories.reduce((sum, cat) => sum + cat.stock, 0)}
                </td>
              )}
              {isVisible('vencimiento') && (
                <td className="px-4 py-3 border border-gray-200 text-sm text-gray-600 font-medium">
                  {getRelativeExpiration(item.expirationDate)}
                </td>
              )}
              {isVisible('codigos') && (
                <td className="px-4 py-3 border border-gray-200 text-xs text-gray-500">
                  <div className="flex flex-col gap-1">
                    {item.categories.filter(c => c.barcodes && c.barcodes.length > 0 && c.barcodes[0] !== '').map((cat, idx) => (
                      <span key={idx} className="bg-gray-100 px-1 rounded truncate max-w-[120px]" title={`${cat.name}: ${cat.barcodes?.join(', ')}`}>
                        {cat.name}: {cat.barcodes?.[0]}
                      </span>
                    ))}
                    {!item.categories.some(c => c.barcodes && c.barcodes.length > 0 && c.barcodes[0] !== '') && '-'}
                  </div>
                </td>
              )}

              {isVisible('acciones') && !readOnly && (
                <td className="px-4 py-3 border border-gray-200">
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onProductClick(item); }} className="text-clover-600 hover:text-clover-800 transition-colors text-sm font-medium mr-2">Ver Detalle</button>
                    <button onClick={(e) => { e.stopPropagation(); onEditProduct(item); }} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteProduct(item.id); }} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
