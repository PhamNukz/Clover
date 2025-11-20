import React from 'react';
import { X } from 'lucide-react';
import { InventoryItem, BulkAssignment } from '../types';

interface BulkAssignmentModalProps {
  show: boolean;
  bulkAssignmentStep: 'select-people' | 'assign-categories' | null;
  selectedPeople: string[];
  bulkEquipment: string;
  bulkAssignments: BulkAssignment[];
  bulkDate: string;
  allEmployees: string[];
  inventory: InventoryItem[];
  needsCategorySelection: boolean;
  selectedProduct: InventoryItem | undefined;
  onClose: () => void;
  onTogglePersonSelection: (personName: string) => void;
  onSetBulkEquipment: (equipment: string) => void;
  onProceedToCategories: () => void;
  onGoBack: () => void;
  onUpdateBulkCategory: (personName: string, category: string) => void;
  onSetBulkDate: (date: string) => void;
  onCompleteBulkAssignment: () => void;
}

const BulkAssignmentModal: React.FC<BulkAssignmentModalProps> = ({
  show,
  bulkAssignmentStep,
  selectedPeople,
  bulkEquipment,
  bulkAssignments,
  bulkDate,
  allEmployees,
  inventory,
  needsCategorySelection,
  selectedProduct,
  onClose,
  onTogglePersonSelection,
  onSetBulkEquipment,
  onProceedToCategories,
  onGoBack,
  onUpdateBulkCategory,
  onSetBulkDate,
  onCompleteBulkAssignment
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">
            {bulkAssignmentStep === 'select-people' && 'Paso 1: Seleccionar Personas y Equipo'}
            {bulkAssignmentStep === 'assign-categories' && 'Paso 2: Asignar Categorías'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {bulkAssignmentStep === 'select-people' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Seleccionar Equipo</label>
              <select
                value={bulkEquipment}
                onChange={(e) => onSetBulkEquipment(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar equipo</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Seleccionar Personas (puede seleccionar múltiples)</label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {allEmployees.map(emp => (
                  <label key={emp} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPeople.includes(emp)}
                      onChange={() => onTogglePersonSelection(emp)}
                      className="w-4 h-4"
                    />
                    <span>{emp}</span>
                  </label>
                ))}
              </div>
              
              {selectedPeople.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Personas seleccionadas ({selectedPeople.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPeople.map(person => (
                      <span key={person} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={onProceedToCategories}
                disabled={selectedPeople.length === 0 || !bulkEquipment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {bulkAssignmentStep === 'assign-categories' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900">Equipo: {bulkEquipment}</p>
              <p className="text-sm text-blue-700">Personas seleccionadas: {selectedPeople.length}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Fecha de Entrega</label>
              <input
                type="date"
                value={bulkDate}
                onChange={(e) => onSetBulkDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {needsCategorySelection ? (
              <div>
                <label className="block text-sm font-semibold mb-2">Asignar categoría para cada persona</label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bulkAssignments.map((ba, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <span className="font-medium min-w-[150px]">{ba.personName}</span>
                      <select
                        value={ba.category}
                        onChange={(e) => onUpdateBulkCategory(ba.personName, e.target.value)}
                        className="flex-1 border rounded px-3 py-2"
                      >
                        <option value="">Seleccionar categoría</option>
                        {selectedProduct?.categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">
                  Este equipo tiene una sola categoría: <span className="font-bold">{selectedProduct?.categories[0].name}</span>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Se asignará automáticamente a todas las personas seleccionadas.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onGoBack}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Atrás
              </button>
              <button
                onClick={onCompleteBulkAssignment}
                disabled={!bulkDate || (needsCategorySelection && bulkAssignments.some(ba => !ba.category))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Registrar Entregas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAssignmentModal;

