export interface AudienceSpecification {
  campaignType: "Standard" | "Promotional";

  // Demographics
  parentAgeMin?: number;
  parentAgeMax?: number;
  parentGender?: "M" | "F" | "other" | "any";

  // Baby information
  babyAgeWeeksMin?: number;
  babyAgeWeeksMax?: number;
  babyCount?: number;
  diaperSize?: string;

  // Location
  country?: string;
  language?: string;

  // Behavioral
  lastProductPurchased?: string;

  // Engagement
  engagementMin?: number; // 0-100
  engagementMax?: number; // 0-100
}

export interface SegmentMatchResult {
  matchingSegments: number;
  totalSegments: number;
  specifications: AudienceSpecification;
}
