import React from 'react';
import { X, Trash2, ScanLine, AlertTriangle, Plus } from 'lucide-react';
import { NewProduct, InventoryItem } from '../types';

interface AddProductModalProps {
  show: boolean;
  isEditing?: boolean;
  newProduct: NewProduct;
  productCategories: string[];
  inventory: InventoryItem[];
  onClose: () => void;
  onAddProduct: () => void;
  onUpdateProduct: (product: NewProduct) => void;
  onAddCategory: () => void;
  onUpdateCategory: (index: number, field: 'name' | 'stock' | 'minStock', value: string | number) => void;
  onRemoveCategory: (index: number) => void;
  onAddBarcode: (categoryIndex: number) => void;
  onUpdateBarcode: (categoryIndex: number, barcodeIndex: number, value: string) => void;
  onRemoveBarcode: (categoryIndex: number, barcodeIndex: number) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  show,
  isEditing = false,
  newProduct,
  productCategories,
  inventory,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onAddBarcode,
  onUpdateBarcode,
  onRemoveBarcode
}) => {
  // Removed scanner state as we rely on external "Barcode to PC" app (keyboard emulation)

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (show) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  const checkDuplicate = (code: string): string | null => {
    if (!code) return null;
    for (const prod of inventory) {
      // Skip current product if editing (based on name match, roughly, since we don't have ID here easily efficiently without more props, but good enough for now. Actually name match is risky if name changed. Ideally we'd compare ID but NewProduct doesn't have it.
      // However, duplication check is GLOBAL. If I edit "Helmet" and keep its barcode, it will find "Helmet".
      // We should simplisticly check: if found, return product name.
      // But if we are editing, we don't want to warn about ITSELF.
      // Since NewProduct doesn't have ID, we rely on name? Or we just warn anyway?
      // Let's warn if found product name !== newProduct.name (assuming name hasn't changed yet?? No.)
      // It's safer to just warn "Used by [Product Name]". If it's the same product, user knows.

      // More robust: compare to all products except the one being edited (if we could).
      // For now: find any product that uses this barcode.
      const foundCat = prod.categories.find(c => c.barcodes?.includes(code));
      if (foundCat) {
        // If we are editing and the found product has the SAME name as current input, ignore it (it's itself).
        if (isEditing && prod.name === newProduct.name) continue;
        return `${prod.name} (${foundCat.name})`;
      }
    }
    return null;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre del Producto</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => onUpdateProduct({ ...newProduct, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                placeholder="Ej: Casco de Seguridad"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Categoría Principal</label>
              <select
                value={newProduct.category}
                onChange={(e) => onUpdateProduct({ ...newProduct, category: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
              >
                {productCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Tallas / Variantes</label>
              <button
                onClick={onAddCategory}
                className="text-clover-600 hover:text-clover-800 text-sm font-semibold transition-colors"
              >
                + Agregar Talla
              </button>
            </div>
            {newProduct.categories.map((cat, catIndex) => (
              <div key={catIndex} className="flex flex-col mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-2 items-end mb-3">
                  <div className="flex-[2]">
                    <label className="text-xs text-gray-500 mb-1 block">Variante</label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => onUpdateCategory(catIndex, 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                      placeholder="Ej: S, M"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                    <input
                      type="number"
                      value={cat.stock}
                      onChange={(e) => onUpdateCategory(catIndex, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Min</label>
                    <input
                      type="number"
                      value={cat.minStock}
                      onChange={(e) => onUpdateCategory(catIndex, 'minStock', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                      placeholder="Min"
                    />
                  </div>
                  {newProduct.categories.length > 1 && (
                    <button
                      onClick={() => onRemoveCategory(catIndex)}
                      className="text-red-600 hover:text-red-800 transition-colors p-2 mb-0.5"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                {/* Barcodes Section */}
                <div className="pl-2 space-y-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Códigos de Barras</label>
                  {(cat.barcodes || ['']).map((barcode, barcodeIndex) => {
                    const duplicateInfo = checkDuplicate(barcode);
                    return (
                      <div key={barcodeIndex}>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 relative">
                            <ScanLine size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                              type="text"
                              value={barcode}
                              onChange={(e) => onUpdateBarcode(catIndex, barcodeIndex, e.target.value)}
                              className={`w-full border ${duplicateInfo ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-clover-500'} rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 pl-9`}
                              placeholder="Click y escanear..."
                            />
                          </div>
                          {(cat.barcodes?.length || 0) > 1 && (
                            <button
                              onClick={() => onRemoveBarcode(catIndex, barcodeIndex)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-2"
                              title="Eliminar código"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                        {duplicateInfo && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1 ml-1">
                            <AlertTriangle size={12} />
                            <span>Código duplicado: En uso por <strong>{duplicateInfo}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => onAddBarcode(catIndex)}
                    className="text-clover-600 hover:text-clover-800 text-xs font-medium flex items-center gap-1 mt-1"
                  >
                    <Plus size={14} /> Agregar código adicional
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Stock Mínimo (Global)</label>
              <input
                type="number"
                value={newProduct.minStock}
                onChange={(e) => onUpdateProduct({ ...newProduct, minStock: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Precio Unitario</label>
              <input
                type="number"
                value={newProduct.pricePerUnit}
                onChange={(e) => onUpdateProduct({ ...newProduct, pricePerUnit: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Última Compra</label>
              <input
                type="date"
                value={newProduct.lastPurchaseDate}
                onChange={(e) => onUpdateProduct({ ...newProduct, lastPurchaseDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha Vencimiento</label>
              <input
                type="date"
                value={newProduct.expirationDate}
                onChange={(e) => onUpdateProduct({ ...newProduct, expirationDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onAddProduct}
              className="px-4 py-2 bg-clover-600 text-white rounded-lg hover:bg-clover-700 transition-colors shadow-lg"
            >
              {isEditing ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
