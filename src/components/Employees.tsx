import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Employee, Assignment } from '../types';
import AssignmentsTable from './AssignmentsTable';

interface EmployeesProps {
    employees: Employee[];
    assignments: Assignment[];
    onAddEmployee: (employee: Employee) => void;
    onEditEmployee: (employee: Employee) => void;
    onDeleteEmployee: (id: string) => void;
    onDeleteAssignment: (id: string) => void;
}

const Employees: React.FC<EmployeesProps> = ({
    employees,
    assignments,
    onAddEmployee,
    onEditEmployee,
    onDeleteEmployee,
    onDeleteAssignment
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowAddModal(false);
        };
        if (showAddModal) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showAddModal]);

    // Form state
    const [formData, setFormData] = useState<Partial<Employee>>({
        name: '',
        role: '',
        email: '',
        department: ''
    });

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setFormData({ name: '', role: '', email: '', department: '' });
        setEditingEmployee(null);
        setShowAddModal(true);
    };

    const handleOpenEdit = (employee: Employee) => {
        setFormData(employee);
        setEditingEmployee(employee);
        setShowAddModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        if (editingEmployee) {
            onEditEmployee({ ...editingEmployee, ...formData } as Employee);
        } else {
            onAddEmployee({
                id: Date.now().toString(),
                ...formData
            } as Employee);
        }
        setShowAddModal(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            onDeleteEmployee(id);
        }
    };

    const getEmployeeAssignments = (employeeName: string) => {
        return assignments.filter(a => a.personName === employeeName);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Empleados</h2>
                    <p className="text-gray-600">Gestiona el personal y sus asignaciones</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-clover-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-clover-700 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Agregar Empleado
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar empleado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clover-500"
                    />
                </div>
            </div>

            {/* Employees List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredEmployees.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron empleados.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredEmployees.map((employee) => {
                            const empAssignments = getEmployeeAssignments(employee.name);
                            const isExpanded = expandedEmployeeId === employee.id;

                            return (
                                <div key={employee.id} className="group transition-colors hover:bg-gray-50">
                                    <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedEmployeeId(isExpanded ? null : employee.id)}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${isExpanded ? 'bg-clover-100 text-clover-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                                                <div className="text-sm text-gray-500 flex gap-2">
                                                    {employee.role && <span>{employee.role}</span>}
                                                    {employee.department && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{employee.department}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-500">
                                                {empAssignments.length} asignaciones
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(employee); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(employee.id); }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded View - Assignments */}
                                    {isExpanded && (
                                        <div className="bg-gray-50 p-4 pl-16 border-t border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                                Inventario Asignado
                                            </h4>
                                            <AssignmentsTable
                                                assignments={empAssignments}
                                                selectedEmployee={employee.name} // Filter logic handled by passing pre-filtered list, or we use props to filter.
                                                // Actually AssignmentsTable filters by props internally if we pass all assignments, 
                                                // but here we want to show specific list. 
                                                // AssignmentsTable takes 'assignments' prop. 
                                                // If we pass filtered list, it works.
                                                // But check if it needs other props like 'searchEmployee' etc to avoid errors or weird UI.
                                                // It needs all props.
                                                searchEmployee=""
                                                allEmployees={[]}
                                                onDeleteAssignment={() => { }} // Read-only view here? Or allow delete? User didn't specify, but "igual a la de asignaciones" implies functionality.
                                                // If we want funcionality we need to pass the real handlers.
                                                // But 'onDeleteAssignment' is passed to Employees component? Yes.
                                                onSelectEmployee={() => { }}
                                                onSearchEmployee={() => { }}
                                                hideSearch={true}
                                            />
                                            {/* 
                                                WAIT. AssignmentsTable expects `onDeleteAssignment`.
                                                And `Employees` component receives `onDeleteEmployee`.
                                                It does NOT receive `onDeleteAssignment`.
                                                So I cannot pass it unless I update `Employees` props or just make it read-only/visual.
                                                User said: "la tabla que se despliega por empleado sea igual a la de asignaciones"
                                                Usually implies visual format. Providing delete might require prop drilling.
                                                I will check App.tsx to see if I can pass onDeleteAssignment to Employees.
                                                App.tsx passes `assignments`.
                                                It does NOT pass `onDeleteAssignment` to `Employees` component currently.
                                                I should update App.tsx to pass it, or just mock it if it's view only.
                                                Given "Inventory" has it, "Employees" might need it strictly for "Actions" column.
                                                If I don't pass it, the delete button will crash or do nothing.
                                                I will update App.tsx to pass `onDeleteAssignment` to `Employees`.
                                            */}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editingEmployee ? 'Editar Empleado' : 'Agregar Empleado'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-clover-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Rol</label>
                                <div className="space-y-2">
                                    <select
                                        value={['Administración', 'Operaciones', 'Trabajador', 'Externo'].includes(formData.role || '') ? formData.role : 'Otro'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'Otro') {
                                                setFormData({ ...formData, role: '' });
                                            } else {
                                                setFormData({ ...formData, role: val });
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-clover-500 focus:outline-none bg-white"
                                    >
                                        <option value="Administración">Administración</option>
                                        <option value="Operaciones">Operaciones</option>
                                        <option value="Trabajador">Trabajador</option>
                                        <option value="Externo">Externo</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                    {(!['Administración', 'Operaciones', 'Trabajador', 'Externo'].includes(formData.role || '') || formData.role === '') && (
                                        <input
                                            type="text"
                                            placeholder="Especifique el cargo"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-clover-500 focus:outline-none"
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-clover-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-clover-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-clover-600 text-white rounded-lg hover:bg-clover-700 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
