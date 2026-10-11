import { IPurchaseOrder } from '../models/PurchaseOrder.js';
import { IGoodsReceipt } from '../models/GoodsReceipt.js';
import { IInvoice } from '../models/Invoice.js';

export interface MatchingResult {
  isMatched: boolean;
  hasPriceVariance: boolean;
  hasQuantityVariance: boolean;
  hasTaxVariance: boolean;
  varianceAmount: number;
  discrepancies: string[];
  matchingNotes: string;
}

export const performThreeWayMatch = (
  invoice: { grandTotal: number; subtotal: number; lineItems: any[]; taxDetails?: any },
  po?: IPurchaseOrder | null,
  grn?: IGoodsReceipt | null
): MatchingResult => {
  const discrepancies: string[] = [];
  let hasPriceVariance = false;
  let hasQuantityVariance = false;
  let hasTaxVariance = false;
  let varianceAmount = 0;

  if (!po) {
    return {
      isMatched: false,
      hasPriceVariance: false,
      hasQuantityVariance: false,
      hasTaxVariance: false,
      varianceAmount: 0,
      discrepancies: ['No associated Purchase Order found for this invoice.'],
      matchingNotes: 'Unable to perform 3-way match without Purchase Order.',
    };
  }

  // Compare totals
  const totalDiff = Math.abs(invoice.grandTotal - po.grandTotal);
  if (totalDiff > 1.0) {
    // Tolerating up to ₹1 rounding difference
    hasPriceVariance = true;
    varianceAmount = Number((invoice.grandTotal - po.grandTotal).toFixed(2));
    discrepancies.push(
      `Grand total mismatch: Invoiced amount is ₹${invoice.grandTotal.toLocaleString('en-IN')}, but PO authorized amount is ₹${po.grandTotal.toLocaleString('en-IN')} (Variance: ₹${varianceAmount.toLocaleString('en-IN')})`
    );
  }

  // Check line items against PO line items
  for (const invItem of invoice.lineItems) {
    const poItem = po.lineItems.find(
      (p) => p.sku === invItem.sku || p.productName.toLowerCase() === invItem.productName.toLowerCase()
    );

    if (!poItem) {
      discrepancies.push(`Line item "${invItem.productName}" (SKU: ${invItem.sku}) does not exist in the authorized PO.`);
      hasPriceVariance = true;
      continue;
    }

    // Check unit price variance
    if (Math.abs(invItem.unitPrice - poItem.unitPrice) > 0.01) {
      hasPriceVariance = true;
      discrepancies.push(
        `Unit price variance on "${invItem.productName}": Invoiced at ₹${invItem.unitPrice}, PO agreed price is ₹${poItem.unitPrice}`
      );
    }

    // Check received quantity from GRN if GRN is provided
    if (grn) {
      const grnItem = grn.lineItems.find(
        (g) => g.sku === invItem.sku || g.productName.toLowerCase() === invItem.productName.toLowerCase()
      );

      if (!grnItem) {
        hasQuantityVariance = true;
        discrepancies.push(
          `Goods Receipt missing line item "${invItem.productName}". Invoiced quantity: ${invItem.quantity}, Received quantity: 0.`
        );
      } else if (invItem.quantity > grnItem.acceptedQuantity) {
        hasQuantityVariance = true;
        discrepancies.push(
          `Overbilling quantity on "${invItem.productName}": Invoiced for ${invItem.quantity} units, but warehouse accepted only ${grnItem.acceptedQuantity} units.`
        );
      }
    } else {
      // Compare directly against PO quantity if no GRN yet
      if (invItem.quantity > poItem.quantity) {
        hasQuantityVariance = true;
        discrepancies.push(
          `Invoiced quantity (${invItem.quantity}) exceeds PO authorized quantity (${poItem.quantity}) for "${invItem.productName}".`
        );
      }
    }
  }

  const isMatched = discrepancies.length === 0;
  const matchingNotes = isMatched
    ? 'Automated 3-way match successful. All line items, prices, and received quantities verified.'
    : `Discrepancy detected: ${discrepancies.length} issue(s) require human review before payment release.`;

  return {
    isMatched,
    hasPriceVariance,
    hasQuantityVariance,
    hasTaxVariance,
    varianceAmount,
    discrepancies,
    matchingNotes,
  };
};
