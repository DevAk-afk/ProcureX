import { Vendor, IVendor } from '../models/Vendor.js';

export interface ScoringWeights {
  deliveryWeight: number; // e.g. 0.35
  qualityWeight: number; // e.g. 0.30
  priceWeight: number; // e.g. 0.20
  complianceWeight: number; // e.g. 0.15
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  deliveryWeight: 0.35,
  qualityWeight: 0.30,
  priceWeight: 0.20,
  complianceWeight: 0.15,
};

export const calculateVendorScore = (
  vendor: {
    onTimeDeliveryRate: number;
    qualityScore: number;
    priceCompetitiveness: number;
    complianceScore: number;
    documents?: any[];
  },
  weights: ScoringWeights = DEFAULT_WEIGHTS
): { score: number; riskRating: 'Low' | 'Medium' | 'High'; completeness: number } => {
  // Check data completeness
  let filledMetrics = 0;
  if (vendor.onTimeDeliveryRate > 0) filledMetrics++;
  if (vendor.qualityScore > 0) filledMetrics++;
  if (vendor.priceCompetitiveness > 0) filledMetrics++;
  if (vendor.complianceScore > 0) filledMetrics++;

  const completeness = Math.round((filledMetrics / 4) * 100);

  // Raw weighted score
  const rawScore =
    vendor.onTimeDeliveryRate * weights.deliveryWeight +
    vendor.qualityScore * weights.qualityWeight +
    vendor.priceCompetitiveness * weights.priceWeight +
    vendor.complianceScore * weights.complianceWeight;

  // Apply missing data penalty if completeness is less than 50%
  const penaltyFactor = completeness < 50 ? 0.8 : 1.0;
  const score = Math.round(rawScore * penaltyFactor);

  let riskRating: 'Low' | 'Medium' | 'High' = 'Low';
  if (score < 60) riskRating = 'High';
  else if (score < 80) riskRating = 'Medium';

  return { score: Math.min(100, Math.max(0, score)), riskRating, completeness };
};

export const recalculateAllVendorScores = async (
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Promise<void> => {
  const vendors = await Vendor.find({ status: { $ne: 'archived' } }).sort({ score: -1 });

  for (const v of vendors) {
    const { score, riskRating } = calculateVendorScore(v, weights);
    v.score = score;
    v.riskRating = riskRating;
  }

  // Sort again by new score descending
  vendors.sort((a, b) => b.score - a.score);

  // Assign rankings and trend
  for (let i = 0; i < vendors.length; i++) {
    const newRank = i + 1;
    const oldRank = vendors[i].rank || newRank;
    if (newRank < oldRank) vendors[i].rankTrend = 'up';
    else if (newRank > oldRank) vendors[i].rankTrend = 'down';
    else vendors[i].rankTrend = 'stable';
    vendors[i].rank = newRank;
    await vendors[i].save();
  }
};
