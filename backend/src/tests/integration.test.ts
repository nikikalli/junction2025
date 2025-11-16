import { recommendationEngineService } from '../services/recommendation-engine.service';
import type { EnrichedSegment } from '../types/gemini-prompt';

async function integrationTest() {
  console.log('='.repeat(70));
  console.log('INTEGRATION TEST: Batch Processing Multiple Segments');
  console.log('='.repeat(70));
  console.log();

  const segments: EnrichedSegment[] = [
    {
      language: 'en',
      parent_age: 24,
      parent_gender: 'F',
      baby_count: 1,
      engagement_propensity: 0.35,
      price_sensitivity: 0.85,
      brand_loyalty: 0.20,
      contact_frequency_tolerance: 0.30,
      content_engagement_rate: 0.25,
      channel_perf_email: 0.25,
      channel_perf_push: 0.45,
      channel_perf_inapp: 0.65,
      values_family: 0.60,
      values_eco_conscious: 0.15,
      values_convenience: 0.20,
      values_quality: 0.05
    },
    {
      language: 'ja',
      parent_age: 32,
      parent_gender: 'F',
      baby_count: 2,
      engagement_propensity: 0.75,
      price_sensitivity: 0.30,
      brand_loyalty: 0.80,
      contact_frequency_tolerance: 0.70,
      content_engagement_rate: 0.85,
      channel_perf_email: 0.35,
      channel_perf_push: 0.55,
      channel_perf_inapp: 0.70,
      values_family: 0.25,
      values_eco_conscious: 0.15,
      values_convenience: 0.20,
      values_quality: 0.75
    },
    {
      language: 'de',
      parent_age: 28,
      parent_gender: 'F',
      baby_count: 1,
      engagement_propensity: 0.85,
      price_sensitivity: 0.25,
      brand_loyalty: 0.70,
      contact_frequency_tolerance: 0.80,
      content_engagement_rate: 0.90,
      channel_perf_email: 0.30,
      channel_perf_push: 0.40,
      channel_perf_inapp: 0.85,
      values_family: 0.35,
      values_eco_conscious: 0.80,
      values_convenience: 0.15,
      values_quality: 0.45
    }
  ];

  try {
    console.log(`Processing ${segments.length} segments in parallel...\n`);
    const startTime = Date.now();

    const prompts = await recommendationEngineService.generatePrompts(segments);

    const duration = Date.now() - startTime;

    console.log(`✓ Generated ${prompts.length} prompts in ${duration}ms\n`);
    console.log('─'.repeat(70));

    prompts.forEach((prompt, index) => {
      const segment = segments[index];
      console.log(`\nSegment ${index + 1}: ${segment.language.toUpperCase()}, Age ${segment.parent_age}`);
      console.log(`  Channel: ${prompt.delivery_settings.channel}`);
      console.log(`  Timing: ${prompt.delivery_settings.send_timing_days_from_today} days`);
      console.log(`  Limits: Title=${prompt.delivery_settings.message_constraints.title_max_characters}, Body=${prompt.delivery_settings.message_constraints.body_max_characters}`);
      console.log(`  Tone: ${prompt.content_guidance.recommended_tone}`);
      console.log(`  Primary Value: ${prompt.audience_profile.primary_value_driver}`);
    });

    console.log('\n' + '─'.repeat(70));
    console.log(`\nPerformance: ${(duration / prompts.length).toFixed(1)}ms per segment (parallelized)`);
    console.log('\n✓ Integration test passed!');

  } catch (error) {
    console.error('✗ Integration test failed:', error);
    process.exit(1);
  }
}

integrationTest();
