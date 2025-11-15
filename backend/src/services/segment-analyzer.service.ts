import type { AnalyzedSegment, AnalyzedSegmentsResponse } from '../types/segment';

class SegmentAnalyzerService {
  private readonly COUNTRIES = [
    'US', 'UK', 'DE', 'FR', 'IT', 'ES', 'PL', 'NL',
    'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE',
    'PT', 'GR', 'CZ', 'RO'
  ];

  private readonly LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'sv', 'no', 'da', 'fi'];
  private readonly GENDERS = ['male', 'female', 'other'];

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private randomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  async getAnalyzedSegments(count: number = 20): Promise<AnalyzedSegmentsResponse> {
    const segments: AnalyzedSegment[] = [];

    for (let i = 0; i < count; i++) {
      const segment: AnalyzedSegment = {
        // Identifiers
        segment_id: `SEG-${String(i + 1).padStart(3, '0')}-${this.COUNTRIES[i % this.COUNTRIES.length]}`,

        // Demographics
        language: this.LANGUAGES[i % this.LANGUAGES.length],
        parent_age: this.randomInt(20, 45),
        parent_gender: this.GENDERS[i % this.GENDERS.length],
        baby_count: this.randomInt(1, 3),
        baby_age_week_1: this.randomInt(0, 156), // 0-3 years in weeks

        // Behavioral
        event_count: this.randomInt(5, 200),

        // Sentiment/Engagement (0-100 scale)
        engagement_propensity: Math.round(this.randomFloat(30, 95)),
        price_sensitivity: Math.round(this.randomFloat(20, 90)),
        brand_loyalty: Math.round(this.randomFloat(40, 95)),
        contact_frequency_tolerance: Math.round(this.randomFloat(30, 80)),
        content_engagement_rate: Math.round(this.randomFloat(25, 85)),

        // Channel Preferences
        prefers_email: this.randomBoolean(),
        prefers_push: this.randomBoolean(),
        prefers_inapp: this.randomBoolean(),

        // Values (0-100 scale)
        values_family: Math.round(this.randomFloat(60, 100)),
        values_eco_conscious: Math.round(this.randomFloat(30, 90)),
        values_convenience: Math.round(this.randomFloat(40, 95)),
        values_quality: Math.round(this.randomFloat(50, 100)),
      };

      segments.push(segment);
    }

    return {
      segments,
      total: segments.length,
    };
  }
}

export const segmentAnalyzerService = new SegmentAnalyzerService();
