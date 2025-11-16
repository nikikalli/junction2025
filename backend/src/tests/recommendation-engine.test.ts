import { recommendationEngineService } from '../services/recommendation-engine.service';
import type { EnrichedSegment } from '../types/gemini-prompt';

async function testRecommendationEngine() {
  console.log('Testing Recommendation Engine Service\n');

  const testSegment: EnrichedSegment = {
    language: 'en',
    parent_age: 28,
    parent_gender: 'F',
    baby_count: 1,
    engagement_propensity: 0.65,
    price_sensitivity: 0.75,
    brand_loyalty: 0.25,
    contact_frequency_tolerance: 0.35,
    content_engagement_rate: 0.40,
    channel_perf_email: 0.30,
    channel_perf_push: 0.55,
    channel_perf_inapp: 0.45,
    values_family: 0.50,
    values_eco_conscious: 0.15,
    values_convenience: 0.25,
    values_quality: 0.10
  };

  try {
    console.log('Input Segment:');
    console.log(`  Age: ${testSegment.parent_age}, Gender: ${testSegment.parent_gender}`);
    console.log(`  Language: ${testSegment.language}`);
    console.log(`  Price Sensitivity: ${testSegment.price_sensitivity}`);
    console.log(`  Brand Loyalty: ${testSegment.brand_loyalty}`);
    console.log(`  Engagement: ${testSegment.engagement_propensity}\n`);

    const prompt = await recommendationEngineService.generatePrompt(testSegment);

    console.log('Generated Prompt:');
    console.log('─'.repeat(70));
    console.log(`Channel: ${prompt.delivery_settings.channel}`);
    console.log(`Send in: ${prompt.delivery_settings.send_timing_days_from_today} days`);
    console.log(`Constraints: Title=${prompt.delivery_settings.message_constraints.title_max_characters}, Body=${prompt.delivery_settings.message_constraints.body_max_characters}\n`);

    console.log('Behavioral Summary:');
    console.log(prompt.audience_profile.behavioral_summary + '\n');

    console.log('Content Guidance:');
    console.log(`  Tone: ${prompt.content_guidance.recommended_tone}`);
    console.log(`  Resonates: ${prompt.content_guidance.what_resonates.slice(0, 2).join(', ')}`);
    console.log(`  Avoid: ${prompt.content_guidance.what_to_avoid.slice(0, 2).join(', ')}`);
    console.log('─'.repeat(70));

    console.log('\nTest passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRecommendationEngine();
