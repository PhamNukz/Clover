import React from 'react';
import { Plus } from 'lucide-react';
import { InventoryItem, Assignment } from '../types';
import StockTable from './StockTable';
import AssignmentsTable from './AssignmentsTable';

interface InventoryProps {
  activeInventoryTab: 'stock' | 'assignments';
  setActiveInventoryTab: (tab: 'stock' | 'assignments') => void;
  inventory: InventoryItem[];
  assignments: Assignment[];
  selectedEmployee: string;
  searchEmployee: string;
  allEmployees: string[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: InventoryItem) => void;
  onDeleteAssignment: (id: string) => void;
  onSelectEmployee: (employee: string) => void;
  onSearchEmployee: (search: string) => void;
  onShowAddProduct: () => void;
  onStartBulkAssignment: () => void;
}

const Inventory: React.FC<InventoryProps> = ({
  activeInventoryTab,
  setActiveInventoryTab,
  inventory,
  assignments,
  selectedEmployee,
  searchEmployee,
  allEmployees,
  onDeleteProduct,
  onEditProduct,
  onDeleteAssignment,
  onSelectEmployee,
  onSearchEmployee,
  onShowAddProduct,
  onStartBulkAssignment
}) => {
  return (
    <div className="p-8 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Inventario</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveInventoryTab('stock')}
          className={`px-4 py-2 font-semibold transition ${activeInventoryTab === 'stock'
              ? 'border-b-2 border-clover-600 text-clover-600'
              : 'text-gray-600 hover:text-clover-600'
            }`}
        >
          Control de Stock
        </button>
        <button
          onClick={() => setActiveInventoryTab('assignments')}
          className={`px-4 py-2 font-semibold transition ${activeInventoryTab === 'assignments'
              ? 'border-b-2 border-clover-600 text-clover-600'
              : 'text-gray-600 hover:text-clover-600'
            }`}
        >
          Asignaciones
        </button>
      </div>

      {/* Stock Tab */}
      {activeInventoryTab === 'stock' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={onShowAddProduct}
              className="flex items-center space-x-2 bg-clover-600 text-white px-4 py-2 rounded-lg hover:bg-clover-700 transition shadow-lg"
            >
              <Plus size={20} />
              <span>Agregar Producto</span>
            </button>
          </div>

          <StockTable
            inventory={inventory}
            onDeleteProduct={onDeleteProduct}
            onEditProduct={onEditProduct}
          />
        </div>
      )}

      {/* Assignments Tab */}
      {activeInventoryTab === 'assignments' && (
        <div>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="flex-1"></div>
            <button
              onClick={onStartBulkAssignment}
              className="flex items-center space-x-2 bg-clover-600 text-black px-4 py-2 rounded-lg hover:bg-clover-700 transition shadow-lg"
            >
              <Plus size={20} />
              <span>Asignar Equipos</span>
            </button>
          </div>

          <AssignmentsTable
            assignments={assignments}
            selectedEmployee={selectedEmployee}
            searchEmployee={searchEmployee}
            allEmployees={allEmployees}
            onDeleteAssignment={onDeleteAssignment}
            onSelectEmployee={onSelectEmployee}
            onSearchEmployee={onSearchEmployee}
          />
        </div>
      )}
    </div>
  );
};

export default Inventory;
