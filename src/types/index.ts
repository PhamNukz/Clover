export interface Category {
  id: string;
  name: string;
  stock: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  categories: Category[];
  minStock: number;
  lastPurchaseDate: string;
  expirationDate: string;
  pricePerUnit: number;
}

export interface Employee {
  id: string;
  name: string;
  role?: string;
  email?: string;
  department?: string;
}

export interface Assignment {
  id: string;
  personName: string; // This should ideally be linked to Employee ID, but keeping name for now to avoid breaking existing data too much, or we migrate.
  equipment: string;
  category: string;
  assignmentDate: string;
  quantity: number;
}

export interface BulkAssignment {
  personName: string;
  category: string;
  quantity: number;
}

export interface NewProduct {
  name: string;
  categories: { name: string; stock: number }[];
  minStock: number;
  lastPurchaseDate: string;
  expirationDate: string;
  pricePerUnit: number;
}

export interface NewAssignment {
  personName: string;
  equipment: string;
  category: string;
  assignmentDate: string;
  quantity: number;
}

