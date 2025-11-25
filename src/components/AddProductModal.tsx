import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { NewProduct } from '../types';

interface AddProductModalProps {
  show: boolean;
  isEditing?: boolean;
  newProduct: NewProduct;
  onClose: () => void;
  onAddProduct: () => void;
  onUpdateProduct: (product: NewProduct) => void;
  onAddCategory: () => void;
  onUpdateCategory: (index: number, field: 'name' | 'stock', value: string | number) => void;
  onRemoveCategory: (index: number) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  show,
  isEditing = false,
  newProduct,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Tallas</label>
              <button
                onClick={onAddCategory}
                className="text-clover-600 hover:text-clover-800 text-sm font-semibold transition-colors"
              >
                + Agregar Talla
              </button>
            </div>
            {newProduct.categories.map((cat, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => onUpdateCategory(index, 'name', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                  placeholder="Nombre (ej: S, M, L, 42, 44)"
                />
                <input
                  type="number"
                  value={cat.stock}
                  onChange={(e) => onUpdateCategory(index, 'stock', parseInt(e.target.value) || 0)}
                  className="w-24 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                  placeholder="Stock"
                />
                {newProduct.categories.length > 1 && (
                  <button
                    onClick={() => onRemoveCategory(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Stock Mínimo</label>
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

