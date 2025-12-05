import { InventoryItem } from '../types';

export const getTotalStock = (item: InventoryItem): number => {
  return item.categories.reduce((sum, cat) => sum + cat.stock, 0);
};

export const getLowStockItems = (inventory: InventoryItem[]): InventoryItem[] => {
  return inventory.filter(item => {
    // Check if ANY category (size) is below its minimum stock
    return item.categories.some(cat => cat.stock < (cat.minStock || 0));
  });
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

export const getExpirationRange = (expirationDate: string): string => {
  if (!expirationDate) return 'N/A';
  const days = getDaysUntilExpiration(expirationDate);

  if (days < 0) return 'Vencido';
  if (days <= 7) return 'Menos de 1 semana';
  if (days <= 14) return '2 semanas';
  if (days <= 30) return '1 mes';
  if (days <= 60) return '2 meses';
  if (days <= 90) return '3 meses';
  if (days <= 180) return '6 meses';
  if (days <= 365) return '1 año';
  return 'Más de 1 año';
};

