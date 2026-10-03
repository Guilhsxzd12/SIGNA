import { Client, Expense, Product, Sale, ServiceOrder, Settings } from "./types";

export type SignaData = {
  products: Product[];
  clients: Client[];
  sales: Sale[];
  serviceOrders: ServiceOrder[];
  expenses: Expense[];
  settings: Settings;
};

export const initialData: SignaData = {
  products: [],
  clients: [],
  sales: [],
  serviceOrders: [],
  expenses: [],
  settings: {
    companyName: "Minha Empresa",
    defaultMargin: 30,
    defaultPackagingCost: 1,
    defaultExtraCost: 0,
    paymentFees: {
      pix: 0,
      cash: 0,
      card1: 4.2,
      card2: 6.09,
      card3: 7.01,
      card4: 7.89
    }
  }
};

const KEY = "signa-gestao-v1";

export function loadData(): SignaData {
  if (typeof window === "undefined") return initialData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialData;
    return { ...initialData, ...JSON.parse(raw) };
  } catch {
    return initialData;
  }
}

export function saveData(data: SignaData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}
