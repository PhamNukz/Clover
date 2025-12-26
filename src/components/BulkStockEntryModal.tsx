import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { InventoryItem } from '../types';

interface BulkStockEntryModalProps {
    show: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    onSave: (entries: StockEntry[], type: 'entry' | 'exit' | 'transit_out' | 'transit_return') => void;
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
    const [mode, setMode] = useState<'entry' | 'exit' | 'transit'>('entry');
    const [transitSubMode, setTransitSubMode] = useState<'send' | 'return'>('send');

    // New State for Quantity Confirmation
    const [askQuantity, setAskQuantity] = useState<boolean | null>(null);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [pendingScanData, setPendingScanData] = useState<{ productName: string, category: string, isNew: boolean } | null>(null);
    const [quantityInputValue, setQuantityInputValue] = useState('');
    const scanInputRef = useRef<HTMLInputElement>(null);

    const theme = mode === 'entry' ? 'clover' : mode === 'exit' ? 'red' : 'purple';

    // Helper to get button style based on mode
    const getButtonStyle = () => {
        if (mode === 'entry') return 'bg-clover-600 hover:bg-clover-700 text-white';
        if (mode === 'exit') return 'bg-red-600 hover:bg-red-700 text-white';
        return 'bg-purple-600 hover:bg-purple-700 text-white'; // transit
    };

    const ThemeButton = ({ children, onClick, className = '', disabled = false }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : getButtonStyle()
                } ${className}`}
        >
            {children}
        </button>
    );

    // Initial load and reset
    useEffect(() => {
        if (show) {
            const savedDraft = localStorage.getItem('stock_entry_draft');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setEntries(parsed.entries);
                    setMode(parsed.mode);
                    if (parsed.transitSubMode) setTransitSubMode(parsed.transitSubMode);
                    // Load setting
                    if (parsed.askQuantity !== undefined) setAskQuantity(parsed.askQuantity);
                } catch (e) {
                    console.error("Error loading draft", e);
                    setEntries([{
                        id: Date.now().toString(),
                        productName: '',
                        variants: [{ id: Date.now().toString() + '-0', category: '', quantity: 0 }]
                    }]);
                    setAskQuantity(null);
                }
            } else if (entries.length === 0) {
                setMode('entry');
                setTransitSubMode('send');
                setEntries([{
                    id: Date.now().toString(),
                    productName: '',
                    variants: [{ id: Date.now().toString() + '-0', category: '', quantity: 0 }]
                }]);
                setAskQuantity(null);
            }
        }
    }, [show]);

    if (!show) return null;

    // --- Helper to Add/Merge Entry ---
    const addOrMergeEntry = (productName: string, category: string, quantityToAdd: number) => {
        setEntries(prev => {
            const existingEntryIndex = prev.findIndex(entry => entry.productName === productName);
            const isInitialBlank = prev.length === 1 && !prev[0].productName;

            if (existingEntryIndex >= 0) {
                const updatedEntries = [...prev];
                const existingEntry = { ...updatedEntries[existingEntryIndex] };
                const existingVariantIndex = existingEntry.variants.findIndex(v => v.category === category);

                if (existingVariantIndex >= 0) {
                    const updatedVariants = [...existingEntry.variants];
                    updatedVariants[existingVariantIndex] = {
                        ...updatedVariants[existingVariantIndex],
                        quantity: updatedVariants[existingVariantIndex].quantity + quantityToAdd
                    };
                    existingEntry.variants = updatedVariants;
                } else {
                    existingEntry.variants = [
                        ...existingEntry.variants,
                        { id: Date.now().toString() + '-new', category: category, quantity: quantityToAdd }
                    ];
                }
                updatedEntries[existingEntryIndex] = existingEntry;
                return updatedEntries;
            } else if (isInitialBlank) {
                return [{
                    id: Date.now().toString(),
                    productName: productName,
                    variants: [{ id: Date.now().toString() + '-0', category: category, quantity: quantityToAdd }]
                }];
            } else {
                return [...prev, {
                    id: Date.now().toString(),
                    productName: productName,
                    variants: [{ id: Date.now().toString() + '-0', category: category, quantity: quantityToAdd }]
                }];
            }
        });
    };

    // --- Handle Quantity Input Confirm ---
    const handleConfirmQuantity = () => {
        if (pendingScanData && quantityInputValue) {
            const qty = parseInt(quantityInputValue);
            if (!isNaN(qty) && qty > 0) {
                addOrMergeEntry(pendingScanData.productName, pendingScanData.category, qty);
                setShowQuantityModal(false);
                setPendingScanData(null);
                setQuantityInputValue('');
                // Use setTimeout to ensure the modal is closed and state updated before focusing
                setTimeout(() => {
                    if (scanInputRef.current) {
                        scanInputRef.current.focus();
                    }
                }, 50);
            }
        }
    };

    const handleProductChange = (id: string, name: string) => {
        const updatedEntries = entries.map(entry => {
            if (entry.id === id) {
                const exists = inventory.find(p => p.name.toLowerCase() === name.toLowerCase());
                let newVariants = entry.variants;
                if (exists && exists.categories.length === 1 && entry.variants.length === 1 && !entry.variants[0].category) {
                    newVariants = [{ ...entry.variants[0], category: exists.categories[0].name }];
                }
                return { ...entry, productName: name, isNewProduct: !exists && name.length > 0, variants: newVariants };
            }
            return entry;
        });
        setEntries(updatedEntries);
    };

    const handleVariantChange = (entryId: string, variantId: string, field: 'category' | 'quantity', value: string | number) => {
        setEntries(entries.map(entry => {
            if (entry.id === entryId) {
                return { ...entry, variants: entry.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v) };
            }
            return entry;
        }));
    };

    const addVariant = (entryId: string) => {
        setEntries(entries.map(e => e.id === entryId ? { ...e, variants: [...e.variants, { id: Date.now().toString(), category: '', quantity: 0 }] } : e));
    };

    const removeVariant = (entryId: string, variantId: string) => {
        setEntries(entries.map(e => e.id === entryId && e.variants.length > 1 ? { ...e, variants: e.variants.filter(v => v.id !== variantId) } : e));
    };

    const addEntry = () => {
        setEntries([...entries, { id: Date.now().toString(), productName: '', variants: [{ id: Date.now().toString() + '-0', category: '', quantity: 0 }] }]);
    };

    const removeEntry = (id: string) => {
        if (entries.length > 1) setEntries(entries.filter(e => e.id !== id));
    };

    const handleCancel = () => {
        localStorage.removeItem('stock_entry_draft');
        setEntries([]);
        setAskQuantity(null); // Reset choice
        onClose();
    };

    const handleSaveDraft = () => {
        const draft = {
            entries,
            mode,
            transitSubMode,
            askQuantity // Save setting
        };
        localStorage.setItem('stock_entry_draft', JSON.stringify(draft));
        onClose();
    };

    const handleSubmit = () => {
        const flatEntries: StockEntry[] = [];
        let isValid = true;
        let errorMsg = '';

        entries.forEach(entry => {
            if (!entry.productName) isValid = false;
            entry.variants.forEach(variant => {
                if (variant.quantity <= 0) isValid = false;
                if (!variant.category && !entry.isNewProduct) isValid = false;

                // Validation for Transit-Return or Exit or Transit-Send(stock check)
                const product = inventory.find(p => p.name === entry.productName);
                if (product) {
                    const cat = product.categories.find(c => c.name === variant.category);
                    if (cat) {
                        if (mode === 'exit' || (mode === 'transit' && transitSubMode === 'send')) {
                            if (cat.stock < variant.quantity) {
                                isValid = false;
                                errorMsg = `Stock insuficiente para ${entry.productName} (${variant.category}). Stock actual: ${cat.stock}`;
                            }
                        }
                        if (mode === 'transit' && transitSubMode === 'return') {
                            const inTransit = cat.inTransit || 0;
                            if (inTransit < variant.quantity) {
                                isValid = false;
                                errorMsg = `Solo hay ${inTransit} en tránsito para ${entry.productName} (${variant.category}).`;
                            }
                        }
                    }
                }

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
            alert(errorMsg || 'Por favor complete todos los campos y verifique el stock/tránsito disponible.');
            return;
        }

        // Map mode to save type
        // onSave expects 'entry' | 'exit' ... we need to extend it or map it.
        // Let's pass the specific string and let App.tsx handle it. We'll strict-type it later or cast it now.
        // Cast to any to bypass strict check for now if interface isn't updated, but we should update interface on App refactor.
        let saveType: 'entry' | 'exit' | 'transit_out' | 'transit_return';
        if (mode === 'transit') {
            saveType = transitSubMode === 'send' ? 'transit_out' : 'transit_return';
        } else {
            saveType = mode;
        }

        onSave(flatEntries, saveType);
        localStorage.removeItem('stock_entry_draft');
        setEntries([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className={`bg-white rounded-2xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 animate-scaleIn ${mode === 'transit' && transitSubMode === 'return' ? 'max-w-6xl' : 'max-w-4xl'}`}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Control de Stock</h2>
                        <p className="text-sm text-gray-500">Gestión de inventario y tránsito</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setMode('entry')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'entry' ? 'bg-white text-clover-700 shadow-sm' : 'text-gray-500'}`}>Entrada</button>
                        <button onClick={() => setMode('exit')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'exit' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'}`}>Salida</button>
                        <button onClick={() => setMode('transit')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'transit' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}>Tránsito</button>
                    </div>

                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Form Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {mode === 'transit' && (
                            <div className="mb-6 flex justify-center">
                                <div className="flex bg-purple-50 p-1 rounded-lg border border-purple-100">
                                    <button
                                        onClick={() => setTransitSubMode('send')}
                                        className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${transitSubMode === 'send' ? 'bg-purple-600 text-white shadow' : 'text-purple-600 hover:bg-purple-100'}`}
                                    >
                                        Enviar a Tránsito
                                    </button>
                                    <button
                                        onClick={() => setTransitSubMode('return')}
                                        className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${transitSubMode === 'return' ? 'bg-purple-600 text-white shadow' : 'text-purple-600 hover:bg-purple-100'}`}
                                    >
                                        Retorno de Tránsito
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quick Scan - Available for all modes including Transit Return */}
                        {true && (
                            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Escaneo Rápido (Barcode to PC)</label>
                                <input
                                    ref={scanInputRef}
                                    type="text"
                                    placeholder="Escanea código..."
                                    className="w-full px-4 py-2 border border-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const code = e.currentTarget.value.trim();
                                            if (!code) return;

                                            const foundP = inventory.find(p => p.categories.some(c => c.barcodes?.includes(code)));

                                            if (foundP) {
                                                const cat = foundP.categories.find(c => c.barcodes?.includes(code));
                                                if (cat) {
                                                    if (askQuantity) {
                                                        // Ask for quantity
                                                        setPendingScanData({ productName: foundP.name, category: cat.name, isNew: false });
                                                        setQuantityInputValue('');
                                                        setShowQuantityModal(true);
                                                    } else {
                                                        // Auto increment
                                                        addOrMergeEntry(foundP.name, cat.name, 1);
                                                    }
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}

                        <div className="space-y-6">
                            {entries.map((entry, index) => {
                                const product = inventory.find(p => p.name.toLowerCase() === entry.productName.toLowerCase());
                                return (
                                    <div key={entry.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${theme}-100 text-${theme}-700 font-bold shrink-0`}>{index + 1}</div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500">Producto</label>
                                                <select value={entry.productName} onChange={e => handleProductChange(entry.id, e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                                                    <option value="">Seleccionar...</option>
                                                    {inventory.map(p => {
                                                        const isSelected = entries.some(e => e.productName === p.name && e.id !== entry.id);
                                                        return (
                                                            <option key={p.id} value={p.name} disabled={isSelected}>
                                                                {p.name} {isSelected ? '(Ya seleccionado)' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <button onClick={() => removeEntry(entry.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
                                        </div>
                                        <div className="pl-12 space-y-3">
                                            {entry.variants.map(v => (
                                                <div key={v.id} className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500">Categoría / Talla</label>
                                                        <select value={v.category} onChange={e => handleVariantChange(entry.id, v.id, 'category', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                                                            <option value="">Seleccionar...</option>
                                                            {product?.categories.map(c => <option key={c.id} value={c.name}>{c.name} {
                                                                mode === 'transit' && transitSubMode === 'return'
                                                                    ? `(En tránsito: ${c.inTransit || 0})`
                                                                    : `(Stock: ${c.stock})`
                                                            }</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="text-xs text-gray-500">Cant.</label>
                                                        <input type="number" value={v.quantity} onChange={e => handleVariantChange(entry.id, v.id, 'quantity', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                                                    </div>
                                                    {entry.variants.length > 1 && <button onClick={() => removeVariant(entry.id, v.id)}><X size={16} /></button>}
                                                </div>
                                            ))}
                                            <button onClick={() => addVariant(entry.id)} className={`text-sm text-${theme}-600 font-medium flex items-center gap-1`}><Plus size={16} /> Variante</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button onClick={addEntry} className={`flex items-center gap-2 text-${theme}-600 font-medium`}><Plus size={20} /> Otro producto</button>
                            {!(mode === 'transit' && transitSubMode === 'return') && (
                                <button onClick={() => onCreateProduct('')} className="flex items-center gap-2 text-blue-600 font-medium"><Plus size={20} /> Crear Nuevo</button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar for Transit Returns */}
                    {mode === 'transit' && transitSubMode === 'return' && (
                        <div className="w-80 bg-purple-50 border-l border-purple-100 flex flex-col">
                            <div className="p-4 border-b border-purple-100 bg-purple-100/50">
                                <h3 className="font-bold text-purple-900 flex items-center gap-2">
                                    <Package size={18} /> En Tránsito
                                </h3>
                                <p className="text-xs text-purple-700">Doble clic para agregar a devolución</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {inventory.map(item => {
                                    const transitCats = item.categories.filter(c => (c.inTransit || 0) > 0);
                                    if (transitCats.length === 0) return null;

                                    return (
                                        <div key={item.id} className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                                            <p className="font-medium text-gray-900 text-sm mb-2">{item.name}</p>
                                            <div className="space-y-1">
                                                {transitCats.map(cat => (
                                                    <div
                                                        key={cat.id}
                                                        className="flex justify-between items-center text-xs p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100 transition-colors border border-transparent hover:border-purple-300"
                                                        onDoubleClick={() => {
                                                            setEntries(prev => [...prev, {
                                                                id: Date.now().toString(),
                                                                productName: item.name,
                                                                variants: [{ id: Date.now().toString() + '-0', category: cat.name, quantity: cat.inTransit || 0 }]
                                                            }]);
                                                        }}
                                                    >
                                                        <span className="font-medium">{cat.name}</span>
                                                        <span className="font-bold text-purple-700">{cat.inTransit} unds.</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {inventory.every(i => i.categories.every(c => !c.inTransit || c.inTransit === 0)) && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No hay productos en tránsito.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 z-10 relative">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <div className="flex gap-2">
                        <button onClick={handleSaveDraft} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                            Guardar
                        </button>
                        <ThemeButton onClick={handleSubmit}>
                            {mode === 'entry' ? 'Registrar Entrada' : mode === 'exit' ? 'Registrar Salida' : transitSubMode === 'send' ? 'Enviar a Tránsito' : 'Retorno de Tránsito'}
                        </ThemeButton>
                    </div>
                </div>
            </div>

            {/* Quantity Confirmation Setup Modal */}
            {askQuantity === null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] animate-fadeIn">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center animate-scaleIn">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Configuración de Escaneo</h3>
                        <p className="text-gray-600 mb-6">¿Desea ingresar la cantidad manualmente después de cada confirmación?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setAskQuantity(false)} className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">No</button>
                            <button onClick={() => setAskQuantity(true)} className="px-6 py-2 bg-clover-600 text-white rounded-xl font-bold hover:bg-clover-700 shadow-lg shadow-clover-200">Sí</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quantity Input Modal */}
            {showQuantityModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] animate-fadeIn">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full animate-scaleIn relative">
                        <div className="mb-4 text-center">
                            <span className="text-sm font-bold text-clover-600 tracking-wider uppercase mb-1 block">Confirmar Cantidad</span>
                            <h3 className="text-xl font-bold text-gray-900">{pendingScanData?.productName}</h3>
                            <p className="text-gray-500">{pendingScanData?.category}</p>
                        </div>
                        <input
                            type="number"
                            value={quantityInputValue}
                            onChange={(e) => setQuantityInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirmQuantity();
                            }}
                            autoFocus
                            className="w-full text-center text-4xl font-bold border-b-2 border-clover-500 focus:outline-none py-4 mb-6"
                            placeholder=""
                        />
                        <div className="flex gap-3">
                            <button onClick={() => { setShowQuantityModal(false); setPendingScanData(null); }} className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl">Cancelar</button>
                            <button onClick={handleConfirmQuantity} className="flex-1 py-3 bg-clover-600 text-white font-bold rounded-xl hover:bg-clover-700 shadow-lg shadow-clover-200">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkStockEntryModal;
