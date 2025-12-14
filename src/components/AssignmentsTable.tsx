import React, { useState } from 'react';
import { Trash2, UserCheck, Search, ArrowUpDown } from 'lucide-react';
import { Assignment } from '../types';

interface AssignmentsTableProps {
  assignments: Assignment[];
  selectedEmployee: string;
  searchEmployee: string;
  allEmployees: string[];
  onDeleteAssignment: (id: string) => void;
  onSelectEmployee: (employee: string) => void;
  onSearchEmployee: (search: string) => void;
  hideSearch?: boolean;
  showSummary?: boolean;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  assignments,
  selectedEmployee,
  searchEmployee,
  allEmployees,
  onDeleteAssignment,
  onSelectEmployee,
  onSearchEmployee,
  hideSearch = false,
  showSummary = true
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Assignment; direction: 'asc' | 'desc' } | null>({ key: 'assignmentDate', direction: 'desc' });

  const handleSort = (key: keyof Assignment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAssignments = selectedEmployee
    ? assignments.filter(a => a.personName === selectedEmployee)
    : assignments.filter(a =>
      a.personName.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      a.equipment.toLowerCase().includes(searchEmployee.toLowerCase())
    );

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    const aValue = a[key] ?? '';
    const bValue = b[key] ?? '';

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getEmployeeSummary = (employeeName: string) => {
    const employeeAssignments = assignments.filter(a => a.personName === employeeName);
    return employeeAssignments.length;
  };

  return (
    <div>
      {!hideSearch && (
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex gap-4 flex-1">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchEmployee}
                onChange={(e) => {
                  onSearchEmployee(e.target.value);
                  onSelectEmployee('');
                }}
                placeholder="Buscar por colaborador o equipo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-clover-500"
              />
            </div>

            {/* Filtro por empleado */}
            <select
              value={selectedEmployee}
              onChange={(e) => {
                onSelectEmployee(e.target.value);
                onSearchEmployee('');
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-clover-500"
            >
              <option value="">Todos los colaboradores</option>
              {allEmployees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Resumen por empleado seleccionado */}
      {selectedEmployee && showSummary && (
        <div className="bg-clover-50 border border-clover-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-clover-600" size={24} />
            <h3 className="text-lg font-bold text-clover-900">{selectedEmployee}</h3>
          </div>
          <p className="text-clover-700">
            Total de asignaciones: <span className="font-bold">{getEmployeeSummary(selectedEmployee)}</span>
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-clover-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
                <button onClick={() => handleSort('personName')} className="flex items-center gap-1 hover:text-clover-700">
                  Persona
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Equipo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Categoría/Talla</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Cantidad</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
                <button onClick={() => handleSort('assignmentDate')} className="flex items-center gap-1 hover:text-clover-700">
                  Fecha Entrega
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Renovación</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.map(assignment => (
              <tr key={assignment.id} className="hover:bg-clover-50 transition-colors">
                <td className="px-4 py-3 border border-gray-200 font-medium text-gray-900">{assignment.personName}</td>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">{assignment.equipment}</td>
                <td className="px-4 py-3 border border-gray-200">
                  <span className="bg-clover-100 border-2 border-clover-500 text-gray-900 px-3 py-1 rounded-md text-sm font-semibold">
                    {assignment.category}
                  </span>
                </td>
                <td className="px-4 py-3 border border-gray-200 text-center font-semibold text-gray-900">{assignment.quantity || 1}</td>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">{assignment.assignmentDate}</td>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  {assignment.renewalDate ? assignment.renewalDate : '-'}
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <button
                    onClick={() => onDeleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron asignaciones
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsTable;

