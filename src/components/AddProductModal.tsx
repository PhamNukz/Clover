import React, { useRef, useState } from 'react';
import { X, Trash2, ScanLine } from 'lucide-react';
import { NewProduct } from '../types';
import BarcodeScannerModal from './BarcodeScannerModal';

interface AddProductModalProps {
  show: boolean;
  isEditing?: boolean;
  newProduct: NewProduct;
  productCategories: string[];
  onClose: () => void;
  onAddProduct: () => void;
  onUpdateProduct: (product: NewProduct) => void;
  onAddCategory: () => void;
  onUpdateCategory: (index: number, field: 'name' | 'stock' | 'minStock' | 'barcode', value: string | number) => void;
  onRemoveCategory: (index: number) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  show,
  isEditing = false,
  newProduct,
  productCategories,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory
}) => {
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (show) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  const startScanning = (index: number) => {
    setScanningIndex(index);
    setShowScanner(true);
  };

  const handleScanResult = (code: string) => {
    if (scanningIndex !== null) {
      onUpdateCategory(scanningIndex, 'barcode', code);
      // Play a beep sound for feedback
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
      setShowScanner(false);
      setScanningIndex(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
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
            {newProduct.categories.map((cat, index) => (
              <div key={index} className="flex gap-2 mb-2 items-end">
                <div className="flex-[2]">
                  <label className="text-xs text-gray-500 mb-1 block">Variante</label>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => onUpdateCategory(index, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                    placeholder="Ej: S, M"
                  />
                </div>

                <div className="flex-[2]">
                  <label className="text-xs text-gray-500 mb-1 block">Código de Barras</label>
                  <div className="flex relative">
                    <input
                      type="text"
                      value={cat.barcode || ''}
                      onChange={(e) => onUpdateCategory(index, 'barcode', e.target.value)}
                      className="w-full border border-gray-300 rounded-l px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500 pl-8"
                      placeholder="Escanear..."
                    />
                    <ScanLine size={16} className="absolute left-2.5 top-3 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => startScanning(index)}
                      className={`px-3 border border-l-0 border-gray-300 rounded-r hover:bg-gray-50 transition-colors ${scanningIndex === index ? 'bg-clover-100 text-clover-700' : 'text-gray-500'}`}
                      title="Escanear con cámara"
                    >
                      <ScanLine size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                  <input
                    type="number"
                    value={cat.stock}
                    onChange={(e) => onUpdateCategory(index, 'stock', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={cat.minStock}
                    onChange={(e) => onUpdateCategory(index, 'minStock', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
                    placeholder="Min"
                  />
                </div>
                {newProduct.categories.length > 1 && (
                  <button
                    onClick={() => onRemoveCategory(index)}
                    className="text-red-600 hover:text-red-800 transition-colors p-2 mb-0.5"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
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

      <BarcodeScannerModal
        show={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />
    </div>
  );
};

export default AddProductModal;
