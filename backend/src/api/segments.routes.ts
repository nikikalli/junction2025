import { Router, Request, Response } from 'express';
import { databaseService } from '../services/database.service';
import { UserSegmentEnriched } from '../types/database';

const router = Router();

interface AudienceSpecification {
  campaignType: 'Standard' | 'Promotional';
  parentGender?: 'F' | 'M' | 'other' | 'any';
  parentAgeMin?: number;
  parentAgeMax?: number;
  babyAgeWeeksMin?: number;
  babyAgeWeeksMax?: number;
  babyCount?: number;
  diaperSize?: string;
  country?: string;
  language?: string;
  lastProductPurchased?: string;
  engagementMin?: number;
  engagementMax?: number;
}

interface SegmentMatchResult {
  matchingSegments: number;
  totalSegments: number;
  specifications: AudienceSpecification;
}

/**
 * POST /segments/filter
 * Filter segments based on audience specification
 */
router.post('/filter', async (req: Request, res: Response) => {
  try {
    const spec: AudienceSpecification = req.body;

    // Get all enriched segments
    const allSegments = await databaseService.getEnrichedSegments();

    // Filter segments based on specification (only using fields that exist in database)
    const matchingSegments = allSegments.filter((segment: UserSegmentEnriched) => {
      // Parent Gender filter
      if (spec.parentGender && spec.parentGender !== 'any') {
        if (segment.parent_gender !== spec.parentGender) {
          return false;
        }
      }

      // Parent Age filter
      if (spec.parentAgeMin !== undefined && segment.parent_age < spec.parentAgeMin) {
        return false;
      }
      if (spec.parentAgeMax !== undefined && segment.parent_age > spec.parentAgeMax) {
        return false;
      }

      // Baby Count filter
      if (spec.babyCount !== undefined && segment.baby_count !== spec.babyCount) {
        return false;
      }

      // Language filter
      if (spec.language && spec.language !== 'any') {
        if (segment.language !== spec.language) {
          return false;
        }
      }

      // Engagement Propensity filter (convert from 0-1 scale to 0-100)
      const engagementPropensityPercent = segment.engagement_propensity * 100;
      if (spec.engagementMin !== undefined && engagementPropensityPercent < spec.engagementMin) {
        return false;
      }
      if (spec.engagementMax !== undefined && engagementPropensityPercent > spec.engagementMax) {
        return false;
      }

      return true;
    });

    const result: SegmentMatchResult = {
      matchingSegments: matchingSegments.length,
      totalSegments: allSegments.length,
      specifications: spec
    };

    res.json(result);
  } catch (error) {
    console.error('Error filtering segments:', error);
    res.status(500).json({
      error: 'Failed to filter segments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router };
