import React, { useState } from 'react';
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react';

interface CategoriesManagementProps {
    categories: string[];
    onAddCategory: (category: string) => void;
    onUpdateCategory: (oldCategory: string, newCategory: string) => void;
    onDeleteCategory: (category: string) => void;
}

const CategoriesManagement: React.FC<CategoriesManagementProps> = ({
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory
}) => {
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const startEdit = (category: string) => {
        setEditingCategory(category);
        setEditValue(category);
    };

    const saveEdit = () => {
        if (editingCategory && editValue.trim() && editValue.trim() !== editingCategory) {
            onUpdateCategory(editingCategory, editValue.trim());
        }
        setEditingCategory(null);
        setEditValue('');
    };

    return (
        <div className="p-8 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
                <form onSubmit={handleAdd} className="flex gap-4 mb-8">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nueva categoría (ej: Vehículos, Oficina)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newCategory.trim()}
                        className="flex items-center gap-2 bg-clover-600 text-white px-6 py-2 rounded-lg hover:bg-clover-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        <span>Agregar</span>
                    </button>
                </form>

                <div className="space-y-3">
                    {categories.map((category) => (
                        <div
                            key={category}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group"
                        >
                            {editingCategory === category ? (
                                <div className="flex-1 flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-clover-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveEdit}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                        title="Guardar"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => setEditingCategory(null)}
                                        className="p-2 text-gray-500 hover:bg-gray-200 rounded"
                                        title="Cancelar"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-gray-700">{category}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(category)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteCategory(category)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            No hay categorías definidas. Agrega una para comenzar.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesManagement;
