import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { InventoryItem } from '../types';

interface HealthProductSelectionModalProps {
    show: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    selectedProductIds: string[];
    onSave: (selectedIds: string[]) => void;
}

const HealthProductSelectionModal: React.FC<HealthProductSelectionModalProps> = ({
    show,
    onClose,
    inventory,
    selectedProductIds,
    onSave,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState<string[]>([]);

    useEffect(() => {
        if (show) {
            setTempSelected(selectedProductIds);
            setSearchTerm('');
        }
    }, [show, selectedProductIds]);

    if (!show) return null;

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        if (tempSelected.includes(id)) {
            setTempSelected(tempSelected.filter(pid => pid !== id));
        } else {
            if (tempSelected.length >= 5) {
                alert('Máximo 5 productos seleccionados');
                return;
            }
            setTempSelected([...tempSelected, id]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-900">Seleccionar Productos</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-clover-500 focus:ring-2 focus:ring-clover-200 outline-none transition-all"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Seleccionados: <span className="font-bold text-clover-600">{tempSelected.length}/5</span>
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredInventory.map(item => {
                        const isSelected = tempSelected.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                onClick={() => toggleSelection(item.id)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-clover-50 border border-clover-100' : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                <span className={`font-medium ${isSelected ? 'text-clover-900' : 'text-gray-700'}`}>
                                    {item.name}
                                </span>
                                {isSelected && <Check size={20} className="text-clover-600" />}
                            </div>
                        );
                    })}
                    {filteredInventory.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No se encontraron productos</p>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onSave(tempSelected);
                            onClose();
                        }}
                        className="px-6 py-2 bg-clover-600 text-white font-medium rounded-lg hover:bg-clover-700 transition-colors shadow-sm shadow-clover-200"
                    >
                        Guardar Selección
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthProductSelectionModal;
