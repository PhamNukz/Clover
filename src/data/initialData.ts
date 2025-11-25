import { InventoryItem, Assignment } from '../types';

export const initialInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'PANTALÓN SEGURIDAD REFLECTANTE',
    categories: [
      { id: '1-1', name: 'S', stock: 12 },
      { id: '1-2', name: 'M', stock: 18 },
      { id: '1-3', name: 'L', stock: 15 },
      { id: '1-4', name: 'XL', stock: 8 },
      { id: '1-5', name: 'XXL', stock: 5 }
    ],
    minStock: 15,
    lastPurchaseDate: '2025-09-15',
    expirationDate: '2027-09-15',
    pricePerUnit: 35000
  },
  {
    id: '2',
    name: 'CASCO BLANCO',
    categories: [
      { id: '2-1', name: 'Ajustable', stock: 45 }
    ],
    minStock: 20,
    lastPurchaseDate: '2025-10-01',
    expirationDate: '2028-10-01',
    pricePerUnit: 25000
  },
  {
    id: '3',
    name: 'POLERAS NEGRAS',
    categories: [
      { id: '3-1', name: 'S', stock: 22 },
      { id: '3-2', name: 'M', stock: 30 },
      { id: '3-3', name: 'L', stock: 25 },
      { id: '3-4', name: 'XL', stock: 18 },
      { id: '3-5', name: 'XXL', stock: 10 }
    ],
    minStock: 25,
    lastPurchaseDate: '2025-10-20',
    expirationDate: '2026-10-20',
    pricePerUnit: 12000
  },
  {
    id: '4',
    name: 'GUANTES CABRITILLA CORTOS',
    categories: [
      { id: '4-1', name: 'Único', stock: 60 }
    ],
    minStock: 30,
    lastPurchaseDate: '2025-11-01',
    expirationDate: '2026-05-01',
    pricePerUnit: 8500
  },
  {
    id: '5',
    name: 'GUANTES ALBAÑIL',
    categories: [
      { id: '5-1', name: 'Único', stock: 55 }
    ],
    minStock: 30,
    lastPurchaseDate: '2025-11-01',
    expirationDate: '2026-05-01',
    pricePerUnit: 7500
  },
  {
    id: '6',
    name: 'ANTIPARRAS',
    categories: [
      { id: '6-1', name: 'Estándar', stock: 40 }
    ],
    minStock: 20,
    lastPurchaseDate: '2025-10-15',
    expirationDate: '2027-10-15',
    pricePerUnit: 15000
  },
  {
    id: '7',
    name: 'LENTES PARA POLVO',
    categories: [
      { id: '7-1', name: 'Estándar', stock: 35 }
    ],
    minStock: 20,
    lastPurchaseDate: '2025-10-15',
    expirationDate: '2027-10-15',
    pricePerUnit: 12000
  },
  {
    id: '8',
    name: 'LEGIONARIOS',
    categories: [
      { id: '8-1', name: 'Único', stock: 28 }
    ],
    minStock: 15,
    lastPurchaseDate: '2025-09-20',
    expirationDate: '2026-09-20',
    pricePerUnit: 6000
  },
  {
    id: '9',
    name: 'CHAQUETA GEÓLOGO POPLIN NARANJA',
    categories: [
      { id: '9-1', name: 'S', stock: 8 },
      { id: '9-2', name: 'M', stock: 12 },
      { id: '9-3', name: 'L', stock: 10 },
      { id: '9-4', name: 'XL', stock: 6 },
      { id: '9-5', name: 'XXL', stock: 4 }
    ],
    minStock: 10,
    lastPurchaseDate: '2025-08-10',
    expirationDate: '2027-08-10',
    pricePerUnit: 45000
  },
  {
    id: '10',
    name: 'FAJA LUMBAR',
    categories: [
      { id: '10-1', name: 'S', stock: 10 },
      { id: '10-2', name: 'M', stock: 15 },
      { id: '10-3', name: 'L', stock: 12 },
      { id: '10-4', name: 'XL', stock: 8 }
    ],
    minStock: 12,
    lastPurchaseDate: '2025-10-05',
    expirationDate: '2027-10-05',
    pricePerUnit: 18000
  },
  {
    id: '11',
    name: 'BUZOS TYVEK',
    categories: [
      { id: '11-1', name: 'M', stock: 20 },
      { id: '11-2', name: 'L', stock: 18 },
      { id: '11-3', name: 'XL', stock: 15 }
    ],
    minStock: 15,
    lastPurchaseDate: '2025-10-25',
    expirationDate: '2026-04-25',
    pricePerUnit: 22000
  },
  {
    id: '12',
    name: 'CARETAS PROTECCIÓN',
    categories: [
      { id: '12-1', name: 'Estándar', stock: 32 }
    ],
    minStock: 20,
    lastPurchaseDate: '2025-11-10',
    expirationDate: '2027-11-10',
    pricePerUnit: 16000
  },
  {
    id: '13',
    name: 'MÁSCARA DE PROTECCIÓN DE PARTÍCULAS',
    categories: [
      { id: '13-1', name: 'N95', stock: 150 },
      { id: '13-2', name: 'KN95', stock: 120 }
    ],
    minStock: 100,
    lastPurchaseDate: '2025-11-15',
    expirationDate: '2026-02-15',
    pricePerUnit: 3500
  },
  {
    id: '14',
    name: 'FILTRO PROTECCIÓN DE PARTICULAS',
    categories: [
      { id: '14-1', name: 'P100', stock: 80 },
      { id: '14-2', name: 'P95', stock: 70 }
    ],
    minStock: 50,
    lastPurchaseDate: '2025-11-15',
    expirationDate: '2026-05-15',
    pricePerUnit: 12000
  },
  {
    id: '15',
    name: 'TRAJES IMPERMEABLES',
    categories: [
      { id: '15-1', name: 'M', stock: 14 },
      { id: '15-2', name: 'L', stock: 16 },
      { id: '15-3', name: 'XL', stock: 10 }
    ],
    minStock: 12,
    lastPurchaseDate: '2025-09-30',
    expirationDate: '2027-09-30',
    pricePerUnit: 38000
  },
  {
    id: '16',
    name: 'ZAPATO SEGURIDAD',
    categories: [
      { id: '16-1', name: '38', stock: 8 },
      { id: '16-2', name: '39', stock: 10 },
      { id: '16-3', name: '40', stock: 12 },
      { id: '16-4', name: '41', stock: 14 },
      { id: '16-5', name: '42', stock: 16 },
      { id: '16-6', name: '43', stock: 12 },
      { id: '16-7', name: '44', stock: 8 }
    ],
    minStock: 15,
    lastPurchaseDate: '2025-10-10',
    expirationDate: '2028-10-10',
    pricePerUnit: 55000
  },
  {
    id: '17',
    name: 'BOTELLA BLOQUEADOR SOLAR',
    categories: [
      { id: '17-1', name: '200ml', stock: 45 }
    ],
    minStock: 30,
    lastPurchaseDate: '2025-11-05',
    expirationDate: '2026-05-05',
    pricePerUnit: 8000
  },
  {
    id: '18',
    name: 'ARNÉS DE SEGURIDAD',
    categories: [
      { id: '18-1', name: 'Ajustable', stock: 25 }
    ],
    minStock: 15,
    lastPurchaseDate: '2025-09-25',
    expirationDate: '2028-09-25',
    pricePerUnit: 75000
  },
  {
    id: '19',
    name: 'PALAS CARBONERAS CON MANGO',
    categories: [
      { id: '19-1', name: 'Estándar', stock: 18 }
    ],
    minStock: 10,
    lastPurchaseDate: '2025-08-20',
    expirationDate: '2030-08-20',
    pricePerUnit: 15000
  },
  {
    id: '20',
    name: 'ESCOBAS FISCALES',
    categories: [
      { id: '20-1', name: 'Estándar', stock: 22 }
    ],
    minStock: 10,
    lastPurchaseDate: '2025-08-20',
    expirationDate: '2030-08-20',
    pricePerUnit: 8000
  }
];

export const initialAssignments: Assignment[] = [
  { id: '1', personName: 'Juan Pérez', equipment: 'CASCO BLANCO', category: 'Ajustable', assignmentDate: '2025-10-20', quantity: 1 },
  { id: '2', personName: 'Juan Pérez', equipment: 'POLERAS NEGRAS', category: 'M', assignmentDate: '2025-10-20', quantity: 1 },
  { id: '3', personName: 'Juan Pérez', equipment: 'ZAPATO SEGURIDAD', category: '42', assignmentDate: '2025-10-20', quantity: 1 },
  { id: '4', personName: 'María González', equipment: 'CASCO BLANCO', category: 'Ajustable', assignmentDate: '2025-10-22', quantity: 1 },
  { id: '5', personName: 'María González', equipment: 'GUANTES CABRITILLA CORTOS', category: 'Único', assignmentDate: '2025-10-22', quantity: 1 },
  { id: '6', personName: 'Carlos Rodríguez', equipment: 'CASCO BLANCO', category: 'Ajustable', assignmentDate: '2025-11-05', quantity: 1 },
  { id: '7', personName: 'Carlos Rodríguez', equipment: 'ARNÉS DE SEGURIDAD', category: 'Ajustable', assignmentDate: '2025-11-05', quantity: 1 },
  { id: '8', personName: 'Ana Martínez', equipment: 'POLERAS NEGRAS', category: 'S', assignmentDate: '2025-11-08', quantity: 1 },
  { id: '9', personName: 'Ana Martínez', equipment: 'ANTIPARRAS', category: 'Estándar', assignmentDate: '2025-11-08', quantity: 1 },
  { id: '10', personName: 'Pedro Silva', equipment: 'CASCO BLANCO', category: 'Ajustable', assignmentDate: '2025-11-10', quantity: 1 }
];

