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

export interface Assignment {
  id: string;
  personName: string;
  equipment: string;
  category: string;
  assignmentDate: string;
}

export interface BulkAssignment {
  personName: string;
  category: string;
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
}

