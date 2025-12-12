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
import BulkStockEntryModal, { StockEntry } from './components/BulkStockEntryModal';
import PurchaseOrders from './components/PurchaseOrders';
import { PurchaseOrder } from './types';

const App = () => {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'inventory' | 'employees' | 'purchaseOrder'>('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
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

  // Purchase Orders State with Mock Data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 41,
      numeroOrden: 41,
      anio: 2022,
      fechaOrden: '2022-07-05',
      emisor: 'Sistema',
      proveedor: 'Representaciones Somercan',
      montoNeto: 738680, // Reverse calculated approx
      iva: 140349,
      montoTotal: 879029,
      numeroFactura: '',
      metodoPago: 'Transferencia',
      fechaPago: '2022-07-06',
      observaciones: 'Compra histórica.'
    },
    {
      id: 1,
      numeroOrden: 1,
      anio: 2024,
      fechaOrden: '2024-01-09',
      emisor: 'Paola',
      proveedor: 'Ferretería Naval',
      montoNeto: 226000,
      iva: 42940,
      montoTotal: 268940,
      numeroFactura: '',
      observaciones: '10 Buzo Overall talla L / 5 Buzo Overall M'
    },
    {
      id: 50,
      numeroOrden: 50,
      anio: 2025,
      fechaOrden: '2025-10-16',
      emisor: 'Paola',
      proveedor: 'Full Epp SpA',
      montoNeto: 57900,
      iva: 11001,
      montoTotal: 68901,
      numeroFactura: '31798',
      observaciones: '01 par de zapatos anticlavos N°38'
    }
  ]);

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    categories: [{ name: '', stock: 0, minStock: 0 }],
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
              stock: cat.stock,
              minStock: cat.minStock || 0
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
          stock: cat.stock,
          minStock: cat.minStock || 0
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
      categories: [{ name: '', stock: 0, minStock: 0 }],
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
      categories: product.categories.map(c => ({ name: c.name, stock: c.stock, minStock: c.minStock || 0 })),
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
      categories: [...newProduct.categories, { name: '', stock: 0, minStock: 0 }]
    });
  };

  const updateCategory = (index: number, field: 'name' | 'stock' | 'minStock', value: string | number) => {
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

  const handleBulkStockEntry = (entries: StockEntry[], type: 'entry' | 'exit') => {
    const updatedInventory = [...inventory];
    const newAssignments: Assignment[] = [];
    const dateStr = new Date().toLocaleDateString('es-ES');

    // Validation for exits first
    if (type === 'exit') {
      let possible = true;
      entries.forEach(entry => {
        const product = updatedInventory.find(p => p.name === entry.productName);
        const cat = product?.categories.find(c => c.name === entry.category);
        if (!product || !cat || cat.stock < entry.quantity) {
          possible = false;
          // Ideally we show specific error but alert is fine for now
        }
      });

      if (!possible) {
        alert("Error: No hay suficiente stock para realizar algunas de las salidas solicitadas.");
        return;
      }
    }

    entries.forEach(entry => {
      if (entry.isNewProduct && type === 'entry') {
        // Create new product logic
        // For now, we'll just open the add product modal pre-filled or handle it simply
        // Since the requirement says "create one right there", we might need to add it directly if we have enough info
        // But we only have name and category/size name. We need minStock, price, etc.
        // So maybe we just add it with defaults or redirect to add product.
        // Let's add it with defaults for now to satisfy "create one right there"
        const newProduct: InventoryItem = {
          id: Date.now().toString() + Math.random(),
          name: entry.productName,
          categories: [{ id: Date.now().toString(), name: entry.category || 'General', stock: entry.quantity, minStock: 10 }],
          minStock: 10, // Default
          lastPurchaseDate: new Date().toISOString().split('T')[0],
          expirationDate: '',
          pricePerUnit: 0
        };
        updatedInventory.push(newProduct);
      } else {
        // Update existing
        const productIndex = updatedInventory.findIndex(p => p.name === entry.productName);
        if (productIndex >= 0) {
          const product = updatedInventory[productIndex];
          const categoryIndex = product.categories.findIndex(c => c.name === entry.category);

          if (categoryIndex >= 0) {
            if (type === 'entry') {
              product.categories[categoryIndex].stock += entry.quantity;
            } else {
              product.categories[categoryIndex].stock = Math.max(0, product.categories[categoryIndex].stock - entry.quantity);

              // Log waste assignment
              newAssignments.push({
                id: `${Date.now()}-${Math.random()}`,
                personName: 'MERMA / SALIDA',
                equipment: entry.productName,
                category: entry.category,
                assignmentDate: dateStr,
                quantity: entry.quantity
              });
            }
          } else {
            // Add new category if it doesn't exist (though modal usually selects existing)
            // If user typed a new category in modal (if we allowed it), we'd add it here
            if (type === 'entry') {
              product.categories.push({
                id: Date.now().toString(),
                name: entry.category,
                stock: entry.quantity,
                minStock: 10
              });
            }
          }
        }
      }
    });

    setInventory(updatedInventory);
    if (newAssignments.length > 0) {
      setAssignments([...assignments, ...newAssignments]);
    }
  };

  const handleAddOrder = (order: Omit<PurchaseOrder, 'id'>) => {
    const newId = Math.max(...purchaseOrders.map(o => o.id), 0) + 1;
    setPurchaseOrders([...purchaseOrders, { ...order, id: newId }]);
  };

  const handleUpdateOrder = (updatedOrder: PurchaseOrder) => {
    setPurchaseOrders(purchaseOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleDeleteOrder = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta orden?')) {
      setPurchaseOrders(purchaseOrders.filter(o => o.id !== id));
    }
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
            <Dashboard
              inventory={inventory}
              assignmentsCount={assignments.length}
              assignments={assignments}
              onRegisterEntry={() => {
                setShowBulkEntry(true);
              }}
            />
          )}

          {activeMenu === 'inventory' && (
            <Inventory
              inventory={inventory}
              assignments={assignments}
              onDeleteProduct={deleteProduct}
              onEditProduct={handleEditProduct}
              onShowAddProduct={() => setShowAddProduct(true)}
              onStartBulkAssignment={startBulkAssignment}
              onRegisterEntry={() => setShowBulkEntry(true)}
            />
          )}

          {activeMenu === 'employees' && (
            <Employees
              employees={employees}
              assignments={assignments}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onDeleteAssignment={deleteAssignment}
            />
          )}

          {activeMenu === 'purchaseOrder' && (
            <PurchaseOrders
              orders={purchaseOrders}
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
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
            categories: [{ name: '', stock: 0, minStock: 0 }],
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

      <BulkStockEntryModal
        show={showBulkEntry}
        onClose={() => setShowBulkEntry(false)}
        inventory={inventory}
        onSave={handleBulkStockEntry}
        onCreateProduct={(name) => {
          // Don't close bulk entry, just open add product
          // setShowBulkEntry(false); 
          setNewProduct({ ...newProduct, name });
          setShowAddProduct(true);
        }}
      />
    </div>
  );
};

export default App;
