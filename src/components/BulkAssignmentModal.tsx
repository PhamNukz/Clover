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
  onUpdateBulkAssignment: (personName: string, field: 'category' | 'quantity' | 'renewalPeriod', value: string | number) => void;
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
  onUpdateBulkAssignment,
  onSetBulkDate,
  onCompleteBulkAssignment
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            {bulkAssignmentStep === 'select-people' && 'Paso 1: Seleccionar Personas y Equipo'}
            {bulkAssignmentStep === 'assign-categories' && 'Paso 2: Asignar Detalles'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {bulkAssignmentStep === 'select-people' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Seleccionar Equipo</label>
              <select
                value={bulkEquipment}
                onChange={(e) => onSetBulkEquipment(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
              >
                <option value="">Seleccionar equipo</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Seleccionar Personas (puede seleccionar múltiples)</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2 bg-gray-50">
                {allEmployees.map(emp => (
                  <label key={emp} className="flex items-center space-x-2 p-2 hover:bg-clover-50 rounded cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPeople.includes(emp)}
                      onChange={() => onTogglePersonSelection(emp)}
                      className="w-4 h-4 text-clover-600"
                    />
                    <span className="text-gray-900">{emp}</span>
                  </label>
                ))}
              </div>

              {selectedPeople.length > 0 && (
                <div className="mt-3 p-3 bg-clover-50 rounded-lg border border-clover-200">
                  <p className="text-sm font-semibold text-clover-900 mb-2">
                    Personas seleccionadas ({selectedPeople.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPeople.map(person => (
                      <span key={person} className="bg-clover-600 text-white px-3 py-1 rounded-full text-sm">
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onProceedToCategories}
                disabled={selectedPeople.length === 0 || !bulkEquipment}
                className="px-4 py-2 bg-clover-600 text-black rounded-lg hover:bg-clover-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {bulkAssignmentStep === 'assign-categories' && (
          <div className="space-y-4">
            <div className="bg-clover-50 border border-clover-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-clover-900">Equipo: {bulkEquipment}</p>
              <p className="text-sm text-clover-700">Personas seleccionadas: {selectedPeople.length}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Fecha de Entrega</label>
                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => onSetBulkDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Renovación</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500 hidden" // Hidden for now, deciding structure
                >
                  <option value="0">Sin renovación</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Define el periodo de renovación para cada asignación abajo.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Detalles de Asignación</label>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-600 px-3">
                  <div className="col-span-3">Persona</div>
                  <div className="col-span-4">Talla/Categoría</div>
                  <div className="col-span-3">Renovación</div>
                  <div className="col-span-2">Cantidad</div>
                </div>
                {bulkAssignments.map((ba, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50 items-center">
                    <div className="col-span-3 font-medium text-gray-900 truncate" title={ba.personName}>
                      {ba.personName}
                    </div>
                    <div className="col-span-4">
                      {needsCategorySelection ? (
                        <select
                          value={ba.category}
                          onChange={(e) => onUpdateBulkAssignment(ba.personName, 'category', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500 text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {selectedProduct?.categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name} (Stock: {cat.stock})</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700 text-sm">{ba.category}</span>
                      )}
                    </div>
                    <div className="col-span-3">
                      <select
                        value={ba.renewalPeriod || 0}
                        onChange={(e) => onUpdateBulkAssignment(ba.personName, 'renewalPeriod', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500 text-sm"
                      >
                        <option value="0">No aplica</option>
                        <option value="6">6 Meses</option>
                        <option value="12">1 Año</option>
                        <option value="24">2 Años</option>
                        <option value="36">3 Años</option>
                        <option value="48">4 Años</option>
                        <option value="60">5 Años</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={ba.quantity || 1}
                        onChange={(e) => onUpdateBulkAssignment(ba.personName, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onGoBack}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={onCompleteBulkAssignment}
                disabled={!bulkDate || (needsCategorySelection && bulkAssignments.some(ba => !ba.category))}
                className="px-4 py-2 bg-clover-600 text-black rounded-lg hover:bg-clover-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
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

