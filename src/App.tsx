import { useState } from 'react';
import { InventoryItem, Assignment, NewProduct, BulkAssignment, Employee } from './types';
import { initialInventory, initialAssignments } from './data/initialData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Employees from './components/Employees';
import AddProductModal from './components/AddProductModal';
import PageTransition from './components/PageTransition';
import BulkAssignmentModal from './components/BulkAssignmentModal';

const App = () => {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'inventory' | 'employees'>('dashboard');
  const [activeInventoryTab, setActiveInventoryTab] = useState<'stock' | 'assignments'>('stock');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Estado para asignación masiva
  const [bulkAssignmentStep, setBulkAssignmentStep] = useState<'select-people' | 'assign-categories' | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [bulkEquipment, setBulkEquipment] = useState('');
  const [bulkAssignments, setBulkAssignments] = useState<BulkAssignment[]>([]);
  const [bulkDate, setBulkDate] = useState('');

  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  // Initialize employees from existing assignments to prevent data loss
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const uniqueNames = Array.from(new Set(initialAssignments.map(a => a.personName)));
    return uniqueNames.map((name, index) => ({
      id: `emp-${index}`,
      name: name,
      role: 'Empleado',
      department: 'General'
    }));
  });

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    categories: [{ name: '', stock: 0 }],
    minStock: 0,
    lastPurchaseDate: '',
    expirationDate: '',
    pricePerUnit: 0
  });

  // Obtener lista única de empleados
  // Obtener lista única de empleados
  const allEmployees = employees.map(e => e.name).sort();

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.categories.length === 0) return;

    if (editingProductId) {
      // Update existing product
      setInventory(inventory.map(item =>
        item.id === editingProductId
          ? {
            ...item,
            name: newProduct.name,
            categories: newProduct.categories.map((cat, idx) => ({
              id: item.categories[idx]?.id || `${Date.now()}-${idx}`,
              name: cat.name,
              stock: cat.stock
            })),
            minStock: newProduct.minStock,
            lastPurchaseDate: newProduct.lastPurchaseDate,
            expirationDate: newProduct.expirationDate,
            pricePerUnit: newProduct.pricePerUnit
          }
          : item
      ));
      setEditingProductId(null);
    } else {
      // Add new product
      const product: InventoryItem = {
        id: Date.now().toString(),
        name: newProduct.name,
        categories: newProduct.categories.map((cat, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: cat.name,
          stock: cat.stock
        })),
        minStock: newProduct.minStock,
        lastPurchaseDate: newProduct.lastPurchaseDate,
        expirationDate: newProduct.expirationDate,
        pricePerUnit: newProduct.pricePerUnit
      };
      setInventory([...inventory, product]);
    }

    setNewProduct({
      name: '',
      categories: [{ name: '', stock: 0 }],
      minStock: 0,
      lastPurchaseDate: '',
      expirationDate: '',
      pricePerUnit: 0
    });
    setShowAddProduct(false);
  };

  const handleEditProduct = (product: InventoryItem) => {
    setNewProduct({
      name: product.name,
      categories: product.categories.map(c => ({ name: c.name, stock: c.stock })),
      minStock: product.minStock,
      lastPurchaseDate: product.lastPurchaseDate,
      expirationDate: product.expirationDate,
      pricePerUnit: product.pricePerUnit
    });
    setEditingProductId(product.id);
    setShowAddProduct(true);
  };

  const deleteProduct = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(item => item.id !== id));
  };

  const handleAddEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const handleEditEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    // Update assignments if name changed
    const oldEmployee = employees.find(e => e.id === updatedEmployee.id);
    if (oldEmployee && oldEmployee.name !== updatedEmployee.name) {
      setAssignments(assignments.map(a =>
        a.personName === oldEmployee.name ? { ...a, personName: updatedEmployee.name } : a
      ));
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const employeeToDelete = employees.find(e => e.id === id);
    if (employeeToDelete) {
      setEmployees(employees.filter(e => e.id !== id));
      // Optional: Remove assignments or keep them? Keeping them for record but maybe warn user.
      // For now, we keep assignments but they might be orphaned visually if we filter by employee list.
    }
  };

  const addCategory = () => {
    setNewProduct({
      ...newProduct,
      categories: [...newProduct.categories, { name: '', stock: 0 }]
    });
  };

  const updateCategory = (index: number, field: 'name' | 'stock', value: string | number) => {
    const updatedCategories = [...newProduct.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setNewProduct({ ...newProduct, categories: updatedCategories });
  };

  const removeCategory = (index: number) => {
    if (newProduct.categories.length > 1) {
      setNewProduct({
        ...newProduct,
        categories: newProduct.categories.filter((_, i) => i !== index)
      });
    }
  };

  // Funciones para asignación masiva
  const togglePersonSelection = (personName: string) => {
    if (selectedPeople.includes(personName)) {
      setSelectedPeople(selectedPeople.filter(p => p !== personName));
    } else {
      setSelectedPeople([...selectedPeople, personName]);
    }
  };

  const startBulkAssignment = () => {
    setShowAddAssignment(true);
    setBulkAssignmentStep('select-people');
    setSelectedPeople([]);
    setBulkEquipment('');
    setBulkAssignments([]);
    setBulkDate('');
  };

  const proceedToCategories = () => {
    if (selectedPeople.length === 0 || !bulkEquipment) return;

    const selectedProduct = inventory.find(item => item.name === bulkEquipment);
    if (!selectedProduct) return;

    // Si solo tiene una categoría, asignar automáticamente
    if (selectedProduct.categories.length === 1) {
      const newAssignments = selectedPeople.map(person => ({
        personName: person,
        category: selectedProduct.categories[0].name,
        quantity: 1
      }));
      setBulkAssignments(newAssignments);
    } else {
      // Inicializar con categorías vacías
      const newAssignments = selectedPeople.map(person => ({
        personName: person,
        category: '',
        quantity: 1
      }));
      setBulkAssignments(newAssignments);
    }

    setBulkAssignmentStep('assign-categories');
  };

  const updateBulkAssignment = (personName: string, field: 'category' | 'quantity', value: string | number) => {
    setBulkAssignments(bulkAssignments.map(ba =>
      ba.personName === personName ? { ...ba, [field]: value } : ba
    ));
  };

  const completeBulkAssignment = () => {
    if (!bulkDate || bulkAssignments.some(ba => !ba.category)) return;

    // Check stock availability first
    for (const ba of bulkAssignments) {
      const product = inventory.find(p => p.name === bulkEquipment);
      const category = product?.categories.find(c => c.name === ba.category);
      if (category && category.stock < ba.quantity) {
        alert(`No hay suficiente stock para ${ba.personName} (Solicitado: ${ba.quantity}, Disponible: ${category.stock})`);
        return;
      }
    }

    const newAssignments: Assignment[] = bulkAssignments.map(ba => ({
      id: `${Date.now()}-${Math.random()}`,
      personName: ba.personName,
      equipment: bulkEquipment,
      category: ba.category,
      assignmentDate: bulkDate,
      quantity: ba.quantity || 1
    }));

    // Deduct stock
    const updatedInventory = inventory.map(item => {
      if (item.name === bulkEquipment) {
        return {
          ...item,
          categories: item.categories.map(cat => {
            // Calculate total quantity deducted for this category in this bulk assignment
            const totalDeduction = bulkAssignments
              .filter(ba => ba.category === cat.name)
              .reduce((sum, ba) => sum + (ba.quantity || 1), 0);

            return {
              ...cat,
              stock: cat.stock - totalDeduction
            };
          })
        };
      }
      return item;
    });

    setInventory(updatedInventory);
    setAssignments([...assignments, ...newAssignments]);

    // Reset
    setShowAddAssignment(false);
    setBulkAssignmentStep(null);
    setSelectedPeople([]);
    setBulkEquipment('');
    setBulkAssignments([]);
    setBulkDate('');
  };

  const closeBulkAssignment = () => {
    setShowAddAssignment(false);
    setBulkAssignmentStep(null);
    setSelectedPeople([]);
    setBulkEquipment('');
    setBulkAssignments([]);
    setBulkDate('');
  };

  const selectedProduct = bulkEquipment ? inventory.find(item => item.name === bulkEquipment) : null;
  const needsCategorySelection = selectedProduct && selectedProduct.categories.length > 1;

  return (
    <div className="flex h-screen bg-clover-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-clover-50">
        <PageTransition location={activeMenu}>
          {activeMenu === 'dashboard' && (
            <Dashboard inventory={inventory} assignmentsCount={assignments.length} assignments={assignments} />
          )}

          {activeMenu === 'inventory' && (
            <Inventory
              activeInventoryTab={activeInventoryTab}
              setActiveInventoryTab={setActiveInventoryTab}
              inventory={inventory}
              assignments={assignments}
              selectedEmployee={selectedEmployee}
              searchEmployee={searchEmployee}
              allEmployees={allEmployees}
              onDeleteProduct={deleteProduct}
              onEditProduct={handleEditProduct}
              onDeleteAssignment={deleteAssignment}
              onSelectEmployee={setSelectedEmployee}
              onSearchEmployee={setSearchEmployee}
              onShowAddProduct={() => setShowAddProduct(true)}
              onStartBulkAssignment={startBulkAssignment}
            />
          )}

          {activeMenu === 'employees' && (
            <Employees
              employees={employees}
              assignments={assignments}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}
        </PageTransition>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        show={showAddProduct}
        isEditing={!!editingProductId}
        newProduct={newProduct}
        onClose={() => {
          setShowAddProduct(false);
          setEditingProductId(null);
          setNewProduct({
            name: '',
            categories: [{ name: '', stock: 0 }],
            minStock: 0,
            lastPurchaseDate: '',
            expirationDate: '',
            pricePerUnit: 0
          });
        }}
        onAddProduct={handleAddProduct}
        onUpdateProduct={setNewProduct}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onRemoveCategory={removeCategory}
      />

      {/* Bulk Assignment Modal */}
      <BulkAssignmentModal
        show={showAddAssignment}
        bulkAssignmentStep={bulkAssignmentStep}
        selectedPeople={selectedPeople}
        bulkEquipment={bulkEquipment}
        bulkAssignments={bulkAssignments}
        bulkDate={bulkDate}
        allEmployees={allEmployees}
        inventory={inventory}
        needsCategorySelection={!!needsCategorySelection}
        selectedProduct={selectedProduct || undefined}
        onClose={closeBulkAssignment}
        onTogglePersonSelection={togglePersonSelection}
        onSetBulkEquipment={setBulkEquipment}
        onProceedToCategories={proceedToCategories}
        onGoBack={() => setBulkAssignmentStep('select-people')}
        onUpdateBulkAssignment={updateBulkAssignment}
        onSetBulkDate={setBulkDate}
        onCompleteBulkAssignment={completeBulkAssignment}
      />
    </div>
  );
};

export default App;
