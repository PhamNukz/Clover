import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { InventoryItem } from '../types';

interface BulkStockEntryModalProps {
    show: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    onSave: (entries: StockEntry[], type: 'entry' | 'exit') => void;
    onCreateProduct: (name: string) => void;
}

// Flat entry for parent component compatibility
export interface StockEntry {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    isNewProduct?: boolean;
}

// Internal structure for grouping variants
interface ProductEntry {
    id: string;
    productName: string;
    isNewProduct?: boolean;
    variants: VariantEntry[];
}

interface VariantEntry {
    id: string;
    category: string;
    quantity: number;
}

const BulkStockEntryModal: React.FC<BulkStockEntryModalProps> = ({
    show,
    onClose,
    inventory,
    onSave,
    onCreateProduct
}) => {
    const [entries, setEntries] = useState<ProductEntry[]>([]);
    const [mode, setMode] = useState<'entry' | 'exit'>('entry');
    const isEntry = mode === 'entry';
    const themeColor = isEntry ? 'clover' : 'red';
    const ThemeButton = ({ children, onClick, className = '' }: any) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEntry
                ? 'bg-clover-600 hover:bg-clover-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
                } ${className}`}
        >
            {children}
        </button>
    );

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('bulk_entry_draft');
        if (savedDraft && show) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed && parsed.length > 0) {
                    setEntries(parsed);
                    return;
                }
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        }

        // Default initial state
        if (show && entries.length === 0) {
            setMode('entry'); // Reset mode on open
            setEntries([{
                id: Date.now().toString(),
                productName: '',
                variants: [{ id: Date.now().toString() + '-0', category: '', quantity: 0 }]
            }]);
        }
    }, [show]);

    // Save draft to localStorage
    const saveDraft = () => {
        localStorage.setItem('bulk_entry_draft', JSON.stringify(entries));
        onClose();
    };

    // Clear draft
    const clearDraft = () => {
        localStorage.removeItem('bulk_entry_draft');
        setEntries([]);
    };

    if (!show) return null;

    const handleProductChange = (id: string, name: string) => {
        const updatedEntries = entries.map(entry => {
            if (entry.id === id) {
                const exists = inventory.find(p => p.name.toLowerCase() === name.toLowerCase());

                // If product exists and has only one category, pre-fill it in the first variant
                let newVariants = entry.variants;
                if (exists && exists.categories.length === 1 && entry.variants.length === 1 && !entry.variants[0].category) {
                    newVariants = [{ ...entry.variants[0], category: exists.categories[0].name }];
                }

                return {
                    ...entry,
                    productName: name,
                    isNewProduct: !exists && name.length > 0,
                    variants: newVariants
                };
            }
            return entry;
        });
        setEntries(updatedEntries);
    };

    const handleVariantChange = (entryId: string, variantId: string, field: 'category' | 'quantity', value: string | number) => {
        setEntries(entries.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    variants: entry.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
                };
            }
            return entry;
        }));
    };

    const addVariant = (entryId: string) => {
        setEntries(entries.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    variants: [...entry.variants, { id: Date.now().toString(), category: '', quantity: 0 }]
                };
            }
            return entry;
        }));
    };

    const removeVariant = (entryId: string, variantId: string) => {
        setEntries(entries.map(entry => {
            if (entry.id === entryId) {
                if (entry.variants.length > 1) {
                    return {
                        ...entry,
                        variants: entry.variants.filter(v => v.id !== variantId)
                    };
                }
            }
            return entry;
        }));
    };

    const addEntry = () => {
        setEntries([...entries, {
            id: Date.now().toString(),
            productName: '',
            variants: [{ id: Date.now().toString() + '-0', category: '', quantity: 0 }]
        }]);
    };

    const removeEntry = (id: string) => {
        if (entries.length > 1) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const handleSubmit = () => {
        // Flatten entries for onSave
        const flatEntries: StockEntry[] = [];
        let isValid = true;

        entries.forEach(entry => {
            if (!entry.productName) isValid = false;
            entry.variants.forEach(variant => {
                if (variant.quantity <= 0) isValid = false;
                if (!variant.category && !entry.isNewProduct) isValid = false;

                flatEntries.push({
                    id: variant.id,
                    productName: entry.productName,
                    category: variant.category,
                    quantity: variant.quantity,
                    isNewProduct: entry.isNewProduct
                });
            });
        });

        if (!isValid) {
            alert('Por favor complete todos los campos requeridos (Producto, Categoría/Talla, Cantidad > 0)');
            return;
        }

        onSave(flatEntries, mode);
        clearDraft(); // Clear draft after successful save
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Control de Stock</h2>
                        <p className="text-sm text-gray-500">Registra entradas o salidas de inventario</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('entry')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'entry'
                                ? 'bg-white text-clover-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Entrada
                        </button>
                        <button
                            onClick={() => setMode('exit')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'exit'
                                ? 'bg-white text-red-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Salida / Merma
                        </button>
                    </div>

                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="space-y-6">
                        {entries.map((entry, index) => {
                            const product = inventory.find(p => p.name.toLowerCase() === entry.productName.toLowerCase());
                            const isNew = entry.productName.length > 0 && !product;

                            return (
                                <div key={entry.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isEntry ? 'bg-clover-100 text-clover-700' : 'bg-red-100 text-red-700'} font-bold shrink-0`}>
                                            {index + 1}
                                        </div>

                                        <div className="flex-1 relative">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                                            <select
                                                value={entry.productName}
                                                onChange={(e) => handleProductChange(entry.id, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-clover-500 focus:ring-2 focus:ring-clover-200 outline-none font-medium text-gray-900 bg-white"
                                            >
                                                <option value="">Seleccionar producto...</option>
                                                {inventory.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={() => removeEntry(entry.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-4"
                                            title="Eliminar producto"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="pl-12 space-y-3">
                                        {entry.variants.map((variant) => (
                                            <div key={variant.id} className="flex gap-4 items-start">
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Talla / Categoría</label>
                                                        {isNew ? (
                                                            <input
                                                                type="text"
                                                                value={variant.category}
                                                                onChange={(e) => handleVariantChange(entry.id, variant.id, 'category', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-clover-500 focus:ring-2 focus:ring-clover-200 outline-none"
                                                                placeholder="Ej. M, L, Única"
                                                            />
                                                        ) : (
                                                            <select
                                                                value={variant.category}
                                                                onChange={(e) => handleVariantChange(entry.id, variant.id, 'category', e.target.value)}
                                                                className={`w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-${isEntry ? 'clover' : 'red'}-500 focus:ring-2 focus:ring-${isEntry ? 'clover' : 'red'}-200 outline-none bg-white`}
                                                                disabled={!product}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                {product?.categories.map(cat => (
                                                                    <option key={cat.id} value={cat.name}>{cat.name} (Stock: {cat.stock})</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={variant.quantity || ''}
                                                            onChange={(e) => handleVariantChange(entry.id, variant.id, 'quantity', parseInt(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-clover-500 focus:ring-2 focus:ring-clover-200 outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>

                                                {entry.variants.length > 1 && (
                                                    <button
                                                        onClick={() => removeVariant(entry.id, variant.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                                                        title="Eliminar variante"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => addVariant(entry.id)}
                                            className={`text-sm ${isEntry ? 'text-clover-600 hover:text-clover-700' : 'text-red-600 hover:text-red-700'} font-medium flex items-center gap-1 mt-2`}
                                        >
                                            <Plus size={16} /> Agregar otra talla/variante
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={addEntry}
                            className={`flex items-center gap-2 ${isEntry ? 'text-clover-600 hover:text-clover-700' : 'text-red-600 hover:text-red-700'} font-medium transition-colors`}
                        >
                            <Plus size={20} />
                            Agregar otro producto
                        </button>

                        <button
                            onClick={() => onCreateProduct('')}
                            className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Crear Nuevo Producto
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-between gap-3">
                    <button
                        onClick={() => {
                            clearDraft();
                            onClose();
                        }}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={saveDraft}
                            className={`px-4 py-2 border-2 ${isEntry ? 'border-clover-600 text-clover-600 hover:bg-clover-50' : 'border-red-600 text-red-600 hover:bg-red-50'} font-medium rounded-lg transition-colors`}
                        >
                            Guardar Borrador
                        </button>
                        <ThemeButton onClick={handleSubmit}>
                            {isEntry ? 'Registrar Entrada' : 'Registrar Salida'}
                        </ThemeButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkStockEntryModal;
