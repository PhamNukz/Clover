import React, { useState } from 'react';
import { InventoryItem, Assignment, NewProduct, BulkAssignment } from './types';
import { initialInventory, initialAssignments } from './data/initialData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import AddProductModal from './components/AddProductModal';
import BulkAssignmentModal from './components/BulkAssignmentModal';

const App = () => {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'inventory'>('dashboard');
  const [activeInventoryTab, setActiveInventoryTab] = useState<'stock' | 'assignments'>('stock');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchEmployee, setSearchEmployee] = useState('');

  // Estado para asignación masiva
  const [bulkAssignmentStep, setBulkAssignmentStep] = useState<'select-people' | 'assign-categories' | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [bulkEquipment, setBulkEquipment] = useState('');
  const [bulkAssignments, setBulkAssignments] = useState<BulkAssignment[]>([]);
  const [bulkDate, setBulkDate] = useState('');

  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    categories: [{ name: '', stock: 0 }],
    minStock: 0,
    lastPurchaseDate: '',
    expirationDate: '',
    pricePerUnit: 0
  });

  // Obtener lista única de empleados
  const allEmployees = Array.from(new Set(assignments.map(a => a.personName))).sort();

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.categories.length === 0) return;

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

  const deleteProduct = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(item => item.id !== id));
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
        category: selectedProduct.categories[0].name
      }));
      setBulkAssignments(newAssignments);
    } else {
      // Inicializar con categorías vacías
      const newAssignments = selectedPeople.map(person => ({
        personName: person,
        category: ''
      }));
      setBulkAssignments(newAssignments);
    }
    
    setBulkAssignmentStep('assign-categories');
  };

  const updateBulkCategory = (personName: string, category: string) => {
    setBulkAssignments(bulkAssignments.map(ba => 
      ba.personName === personName ? { ...ba, category } : ba
    ));
  };

  const completeBulkAssignment = () => {
    if (!bulkDate || bulkAssignments.some(ba => !ba.category)) return;

    const newAssignments: Assignment[] = bulkAssignments.map(ba => ({
      id: `${Date.now()}-${Math.random()}`,
      personName: ba.personName,
      equipment: bulkEquipment,
      category: ba.category,
      assignmentDate: bulkDate
    }));

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeMenu === 'dashboard' && (
          <Dashboard inventory={inventory} assignmentsCount={assignments.length} />
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
            onDeleteAssignment={deleteAssignment}
            onSelectEmployee={setSelectedEmployee}
            onSearchEmployee={setSearchEmployee}
            onShowAddProduct={() => setShowAddProduct(true)}
            onStartBulkAssignment={startBulkAssignment}
          />
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        show={showAddProduct}
        newProduct={newProduct}
        onClose={() => setShowAddProduct(false)}
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
        needsCategorySelection={needsCategorySelection}
        selectedProduct={selectedProduct}
        onClose={closeBulkAssignment}
        onTogglePersonSelection={togglePersonSelection}
        onSetBulkEquipment={setBulkEquipment}
        onProceedToCategories={proceedToCategories}
        onGoBack={() => setBulkAssignmentStep('select-people')}
        onUpdateBulkCategory={updateBulkCategory}
        onSetBulkDate={setBulkDate}
        onCompleteBulkAssignment={completeBulkAssignment}
      />
    </div>
  );
};

export default App;

