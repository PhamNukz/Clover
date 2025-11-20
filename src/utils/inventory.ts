import { InventoryItem } from '../types';

export const getTotalStock = (item: InventoryItem): number => {
  return item.categories.reduce((sum, cat) => sum + cat.stock, 0);
};

export const getLowStockItems = (inventory: InventoryItem[]): InventoryItem[] => {
  return inventory.filter(item => getTotalStock(item) < item.minStock);
};

export const getExpiringItems = (inventory: InventoryItem[]): InventoryItem[] => {
  return inventory.filter(item => {
    const now = new Date();
    const expDate = new Date(item.expirationDate);
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  });
};

export const getTotalInvestment = (inventory: InventoryItem[]): number => {
  return inventory.reduce((sum, item) => {
    const totalUnits = getTotalStock(item);
    return sum + (totalUnits * item.pricePerUnit);
  }, 0);
};

export const getExpirationStatus = (expirationDate: string): string => {
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 5) return 'text-red-600 font-semibold';
  if (diffDays <= 30) return 'text-yellow-600 font-semibold';
  return 'text-green-600';
};

export const getRowBgColor = (expirationDate: string): string => {
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 5) return 'bg-red-50';
  if (diffDays <= 30) return 'bg-yellow-50';
  return 'bg-white';
};

export const getDaysUntilExpiration = (expirationDate: string): number => {
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

