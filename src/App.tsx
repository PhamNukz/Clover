import { useState, useEffect } from 'react';
import { InventoryItem, Assignment, NewProduct, BulkAssignment, Employee, PurchaseOrder } from './types';
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
import CategoriesManagement from './components/CategoriesManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';

const AuthenticatedApp = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'inventory' | 'employees' | 'purchaseOrder' | 'categories'>('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // States
  const [productCategories, setProductCategories] = useState<string[]>([
    'EPP',
    'Insumos',
    'Material Trabajo',
    'Productos de Limpieza',
    'Generales'
  ]);

  // Migrate initial inventory if needed or ensure typed correctly
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    return initialInventory.map(item => ({
      ...item,
      category: item.category || 'Generales' // Default category if missing
    }));
  });

  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  // Initialize employees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const uniqueNames = Array.from(new Set(initialAssignments.map(a => a.personName)));
    return uniqueNames.map((name, index) => ({
      id: `emp-${index}`,
      name: name,
      role: 'Colaborador',
      department: 'General'
    }));
  });

  // Purchase Orders State
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
    category: 'Generales',
    categories: [{ name: '', stock: 0, minStock: 0, barcode: '' }],
    minStock: 0,
    lastPurchaseDate: '',
    expirationDate: '',
    pricePerUnit: 0
  });

  // Estado para asignación masiva
  const [bulkAssignmentStep, setBulkAssignmentStep] = useState<'select-people' | 'assign-categories' | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [bulkEquipment, setBulkEquipment] = useState('');
  const [bulkAssignments, setBulkAssignments] = useState<BulkAssignment[]>([]);
  const [bulkDate, setBulkDate] = useState('');

  // Obtener lista única de empleados
  // Obtener lista única de empleados
  const allEmployees = employees.map(e => e.name).sort();

  // Categories Management Handlers
  const handleAddCategory = (category: string) => {
    if (!productCategories.includes(category)) {
      setProductCategories([...productCategories, category]);
    }
  };

  const handleUpdateCategory = (oldCategory: string, newCategory: string) => {
    if (productCategories.includes(newCategory)) {
      alert('Esa categoría ya existe');
      return;
    }
    setProductCategories(productCategories.map(c => c === oldCategory ? newCategory : c));
    // Update products using this category
    setInventory(inventory.map(item => item.category === oldCategory ? { ...item, category: newCategory } : item));
  };

  const handleDeleteCategory = (category: string) => {
    if (confirm(`¿Eliminar categoría "${category}"? Los productos asignados pasarán a "Generales".`)) {
      setProductCategories(productCategories.filter(c => c !== category));
      setInventory(inventory.map(item => item.category === category ? { ...item, category: 'Generales' } : item));
    }
  };


  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.categories.length === 0) return;

    if (editingProductId) {
      // Update existing product
      setInventory(inventory.map(item =>
        item.id === editingProductId
          ? {
            ...item,
            name: newProduct.name,
            category: newProduct.category,
            categories: newProduct.categories.map((cat, idx) => ({
              id: item.categories[idx]?.id || `${Date.now()}-${idx}`,
              name: cat.name,
              stock: cat.stock,
              minStock: cat.minStock || 0,
              barcode: cat.barcode
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
        category: newProduct.category || 'Generales',
        categories: newProduct.categories.map((cat, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: cat.name,
          stock: cat.stock,
          minStock: cat.minStock || 0,
          barcode: cat.barcode
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
      category: 'Generales',
      categories: [{ name: '', stock: 0, minStock: 0, barcode: '' }],
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
      category: product.category || 'Generales',
      categories: product.categories.map(c => ({
        name: c.name,
        stock: c.stock,
        minStock: c.minStock || 0,
        barcode: c.barcode || ''
      })),
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
      categories: [...newProduct.categories, { name: '', stock: 0, minStock: 0, barcode: '' }]
    });
  };

  const updateCategory = (index: number, field: 'name' | 'stock' | 'minStock' | 'barcode', value: string | number) => {
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

  const updateBulkAssignment = (personName: string, field: 'category' | 'quantity' | 'renewalPeriod', value: string | number) => {
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

    const newAssignments: Assignment[] = bulkAssignments.map(ba => {
      let renewalDateStr = undefined;
      // Calculate Renewal Date if period is set
      if (ba.renewalPeriod && ba.renewalPeriod > 0) {
        const date = new Date(bulkDate); // format is YYYY-MM-DD
        // Add months
        date.setMonth(date.getMonth() + ba.renewalPeriod);
        renewalDateStr = date.toISOString().split('T')[0];
      }

      return {
        id: `${Date.now()}-${Math.random()}`,
        personName: ba.personName,
        equipment: bulkEquipment,
        category: ba.category,
        assignmentDate: bulkDate,
        renewalDate: renewalDateStr,
        quantity: ba.quantity || 1
      };
    });

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
    closeBulkAssignment();
  };

  const closeBulkAssignment = () => {
    setShowAddAssignment(false);
    setBulkAssignmentStep(null);
    setSelectedPeople([]);
    setBulkEquipment('');
    setBulkAssignments([]);
    setBulkDate('');
  };

  const handleBulkStockEntry = (entries: StockEntry[], type: 'entry' | 'exit' | 'transit_out' | 'transit_return') => {
    const updatedInventory = [...inventory];
    const newAssignments: Assignment[] = [];
    const dateStr = new Date().toLocaleDateString('es-ES');

    // Validation for exits first
    if (type === 'exit' || type === 'transit_out') {
      let possible = true;
      entries.forEach(entry => {
        const product = updatedInventory.find(p => p.name === entry.productName);
        const cat = product?.categories.find(c => c.name === entry.category);
        if (!product || !cat || cat.stock < entry.quantity) {
          possible = false;
        }
      });

      if (!possible) {
        alert("Error: No hay suficiente stock para realizar algunas de las salidas o tránsitos solicitados.");
        return;
      }
    }

    if (type === 'transit_return') {
      let possible = true;
      entries.forEach(entry => {
        const product = updatedInventory.find(p => p.name === entry.productName);
        const cat = product?.categories.find(c => c.name === entry.category);
        const inTransit = cat?.inTransit || 0;
        if (!product || !cat || inTransit < entry.quantity) {
          possible = false;
        }
      });
      if (!possible) {
        alert("Error: No hay suficiente stock en tránsito para realizar el retorno.");
        return;
      }
    }

    entries.forEach(entry => {
      if (entry.isNewProduct && type === 'entry') {
        const newProduct: InventoryItem = {
          id: Date.now().toString() + Math.random(),
          name: entry.productName,
          category: 'Generales',
          categories: [{ id: Date.now().toString(), name: entry.category || 'General', stock: entry.quantity, minStock: 10, barcode: '', inTransit: 0 }],
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
            const cat = product.categories[categoryIndex];

            if (type === 'entry') {
              cat.stock += entry.quantity;
            } else if (type === 'exit') {
              cat.stock = Math.max(0, cat.stock - entry.quantity);
              // Log waste
              newAssignments.push({
                id: `${Date.now()}-${Math.random()}`,
                personName: 'MERMA / SALIDA',
                equipment: entry.productName,
                category: entry.category,
                assignmentDate: dateStr,
                quantity: entry.quantity
              });
            } else if (type === 'transit_out') {
              cat.stock = Math.max(0, cat.stock - entry.quantity);
              cat.inTransit = (cat.inTransit || 0) + entry.quantity;
            } else if (type === 'transit_return') {
              cat.inTransit = Math.max(0, (cat.inTransit || 0) - entry.quantity);
              cat.stock += entry.quantity;
            }

          } else {
            if (type === 'entry') {
              product.categories.push({
                id: Date.now().toString(),
                name: entry.category,
                stock: entry.quantity,
                minStock: 10,
                inTransit: 0
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


  if (!user) {
    return <LoginPage />;
  }

  // RBAC Routing Logic
  // If user is operator, restrict to Dashboard, Inventory
  // If user is warehouse, restrict to all EXCEPT PurchaseOrder
  const canAccessPurchaseOrders = user.role === 'admin';
  const canAccessEmployees = user.role === 'admin' || user.role === 'warehouse';
  const canAccessCategories = user.role === 'admin' || user.role === 'warehouse';

  return (
    <div className="flex h-screen bg-clover-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        userRole={user.role}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-clover-50">
        <PageTransition location={activeMenu}>
          {activeMenu === 'dashboard' && (
            <Dashboard
              inventory={inventory}
              assignmentsCount={assignments.length}
              assignments={assignments}
              purchaseOrders={purchaseOrders}
              userRole={user.role}
              onRegisterEntry={() => {
                setShowBulkEntry(true);
              }}
            />
          )}

          {activeMenu === 'inventory' && (
            <Inventory
              inventory={inventory}
              assignments={assignments}
              productCategories={productCategories}
              userRole={user.role}
              onDeleteProduct={deleteProduct}
              onEditProduct={handleEditProduct}
              onShowAddProduct={() => setShowAddProduct(true)}
              onStartBulkAssignment={startBulkAssignment}
              onRegisterEntry={() => setShowBulkEntry(true)}
            />
          )}

          {activeMenu === 'employees' && canAccessEmployees && (
            <Employees
              employees={employees}
              assignments={assignments}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onDeleteAssignment={deleteAssignment}
            />
          )}

          {activeMenu === 'purchaseOrder' && canAccessPurchaseOrders && (
            <PurchaseOrders
              orders={purchaseOrders}
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeMenu === 'categories' && canAccessCategories && (
            <CategoriesManagement
              categories={productCategories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </PageTransition>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        show={showAddProduct}
        isEditing={!!editingProductId}
        newProduct={newProduct}
        productCategories={productCategories}
        inventory={inventory}
        onClose={() => {
          setShowAddProduct(false);
          setEditingProductId(null);
          setNewProduct({
            name: '',
            category: 'Generales',
            categories: [{ name: '', stock: 0, minStock: 0, barcode: '' }],
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
          setNewProduct({ ...newProduct, name, category: 'Generales', categories: [{ name: '', stock: 0, minStock: 0, barcode: '' }] });
          setShowAddProduct(true);
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
