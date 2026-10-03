export type PaymentMethod = "pix" | "card1" | "card2" | "card3" | "card4" | "cash";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  stock: number;
  minStock: number;
  margin?: number;
  packagingCost?: number;
  extraCost?: number;
  active: boolean;
};

export type Client = {
  id: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
};

export type SaleItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
};

export type Sale = {
  id: string;
  code: string;
  createdAt: string;
  clientId?: string;
  clientName?: string;
  payment: PaymentMethod;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "paid" | "pending" | "cancelled";
  type: "sale" | "quote";
};

export type ServiceOrder = {
  id: string;
  code: string;
  createdAt: string;
  clientName: string;
  description: string;
  value: number;
  status: "open" | "in_progress" | "done" | "cancelled";
};

export type Expense = {
  id: string;
  description: string;
  dueDate: string;
  value: number;
  status: "pending" | "paid";
};

export type Settings = {
  companyName: string;
  defaultMargin: number;
  defaultPackagingCost: number;
  defaultExtraCost: number;
  paymentFees: Record<PaymentMethod, number>;
};
