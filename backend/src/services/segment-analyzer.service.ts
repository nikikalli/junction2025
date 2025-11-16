import type { AnalyzedSegment, AnalyzedSegmentsResponse } from '../types/segment';
import { databaseService } from './database.service';

class SegmentAnalyzerService {
  /**
   * Get analyzed segments from the database
   * @param count - Maximum number of segments to return (default: all segments)
   */
  async getAnalyzedSegments(count?: number): Promise<AnalyzedSegmentsResponse> {
    const segments = await databaseService.getEnrichedSegments(count);
    
    // Transform database segments to API format with calculated boolean preferences
    const analyzedSegments: AnalyzedSegment[] = segments.map(seg => {
      // Convert 0-1 scale to 0-100 scale and round
      const toPercentage = (val: number) => Math.round(val * 100);
      
      // Determine channel preferences based on performance scores
      // A channel is "preferred" if its performance is above 0.5
      const prefers_email = seg.channel_perf_email > 0.5;
      const prefers_push = seg.channel_perf_push > 0.5;
      const prefers_inapp = seg.channel_perf_inapp > 0.5;

      return {
        segment_id: `SEG-${seg.segment_id}`,
        language: seg.language,
        parent_age: Math.round(seg.parent_age),
        parent_gender: seg.parent_gender,
        baby_count: Math.round(seg.baby_count),
        baby_age_week_1: 0, // Not stored in DB, defaulting to 0
        event_count: 0, // Not stored in DB, defaulting to 0
        engagement_propensity: toPercentage(seg.engagement_propensity),
        price_sensitivity: toPercentage(seg.price_sensitivity),
        brand_loyalty: toPercentage(seg.brand_loyalty),
        contact_frequency_tolerance: toPercentage(seg.contact_frequency_tolerance),
        content_engagement_rate: toPercentage(seg.content_engagement_rate),
        prefers_email,
        prefers_push,
        prefers_inapp,
        values_family: toPercentage(seg.values_family),
        values_eco_conscious: toPercentage(seg.values_eco_conscious),
        values_convenience: toPercentage(seg.values_convenience),
        values_quality: toPercentage(seg.values_quality),
      };
    });

    return {
      segments: analyzedSegments,
      total: analyzedSegments.length,
    };
  }
}

export const segmentAnalyzerService = new SegmentAnalyzerService();
