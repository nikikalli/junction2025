import { recommendationEngineService } from '../services/recommendation-engine.service';
import type { EnrichedSegment } from '../types/gemini-prompt';

async function testErrorCases() {
  console.log('Testing Error Handling\n');
  console.log('='.repeat(70));

  const tests = [
    {
      name: 'Valid segment',
      segment: {
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
      } as EnrichedSegment,
      shouldFail: false
    },
    {
      name: 'Missing required field',
      segment: {
        language: 'en',
        parent_age: 28,
        parent_gender: 'F',
        baby_count: 1,
        // missing engagement_propensity
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
      } as any,
      shouldFail: true
    },
    {
      name: 'Value out of range',
      segment: {
        language: 'en',
        parent_age: 28,
        parent_gender: 'F',
        baby_count: 1,
        engagement_propensity: 1.5,
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
      } as EnrichedSegment,
      shouldFail: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\nTest: ${test.name}`);
    console.log('─'.repeat(70));

    try {
      const prompt = await recommendationEngineService.generatePrompt(test.segment);

      if (test.shouldFail) {
        console.log('✗ FAILED: Should have thrown error but succeeded');
        failed++;
      } else {
        console.log('✓ PASSED: Generated prompt successfully');
        console.log(`  Channel: ${prompt.delivery_settings.channel}`);
        console.log(`  Timing: ${prompt.delivery_settings.send_timing_days_from_today} days`);
        passed++;
      }
    } catch (error) {
      if (test.shouldFail) {
        console.log('✓ PASSED: Correctly caught error');
        console.log(`  Error: ${(error as Error).message.substring(0, 100)}`);
        passed++;
      } else {
        console.log('✗ FAILED: Unexpected error');
        console.log(`  Error: ${(error as Error).message}`);
        failed++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

testErrorCases();
