import React from 'react';
import { Trash2, UserCheck, Search } from 'lucide-react';
import { Assignment } from '../types';

interface AssignmentsTableProps {
  assignments: Assignment[];
  selectedEmployee: string;
  searchEmployee: string;
  allEmployees: string[];
  onDeleteAssignment: (id: string) => void;
  onSelectEmployee: (employee: string) => void;
  onSearchEmployee: (search: string) => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  assignments,
  selectedEmployee,
  searchEmployee,
  allEmployees,
  onDeleteAssignment,
  onSelectEmployee,
  onSearchEmployee
}) => {
  const filteredAssignments = selectedEmployee 
    ? assignments.filter(a => a.personName === selectedEmployee)
    : assignments.filter(a => 
        a.personName.toLowerCase().includes(searchEmployee.toLowerCase()) ||
        a.equipment.toLowerCase().includes(searchEmployee.toLowerCase())
      );

  const getEmployeeSummary = (employeeName: string) => {
    const employeeAssignments = assignments.filter(a => a.personName === employeeName);
    return employeeAssignments.length;
  };

  return (
    <div>
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
              placeholder="Buscar por empleado o equipo..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          
          {/* Filtro por empleado */}
          <select
            value={selectedEmployee}
            onChange={(e) => {
              onSelectEmployee(e.target.value);
              onSearchEmployee('');
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Todos los empleados</option>
            {allEmployees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen por empleado seleccionado */}
      {selectedEmployee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-blue-900">{selectedEmployee}</h3>
          </div>
          <p className="text-blue-700">
            Total de asignaciones: <span className="font-bold">{getEmployeeSummary(selectedEmployee)}</span>
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Persona</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Equipo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Categoría/Talla</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Fecha Entrega</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map(assignment => (
              <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border font-medium">{assignment.personName}</td>
                <td className="px-4 py-3 border">{assignment.equipment}</td>
                <td className="px-4 py-3 border">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                    {assignment.category}
                  </span>
                </td>
                <td className="px-4 py-3 border">{assignment.assignmentDate}</td>
                <td className="px-4 py-3 border">
                  <button
                    onClick={() => onDeleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-800"
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

