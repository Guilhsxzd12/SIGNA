import { PaymentMethod, Product, Settings } from "./types";

export function baseSalePrice(product: Product, settings: Settings) {
  const margin = product.margin ?? settings.defaultMargin;
  const packaging = product.packagingCost ?? settings.defaultPackagingCost;
  const extra = product.extraCost ?? settings.defaultExtraCost;
  const totalCost = product.cost + packaging + extra;

  if (margin >= 100) return totalCost;
  return totalCost / (1 - margin / 100);
}

export function priceForPayment(product: Product, settings: Settings, method: PaymentMethod) {
  const base = baseSalePrice(product, settings);
  const fee = settings.paymentFees[method] ?? 0;
  if (fee <= 0) return base;
  return base / (1 - fee / 100);
}

export function contribution(product: Product, settings: Settings, method: PaymentMethod) {
  const price = priceForPayment(product, settings, method);
  const packaging = product.packagingCost ?? settings.defaultPackagingCost;
  const extra = product.extraCost ?? settings.defaultExtraCost;
  const totalCost = product.cost + packaging + extra;
  const fee = price * ((settings.paymentFees[method] ?? 0) / 100);
  return price - totalCost - fee;
}
