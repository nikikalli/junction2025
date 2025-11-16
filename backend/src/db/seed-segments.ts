import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'junction2025',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Generate random value within range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate random integer within range
const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));

// Select random item from array
const randomChoice = <T>(array: T[]): T => array[randomInt(0, array.length - 1)];

interface SegmentData {
  segment_id: number;
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  channel_perf_email: number;
  channel_perf_push: number;
  channel_perf_inapp: number;
  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;
}

function generateSegment(id: number): SegmentData {
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
  const genders = ['F', 'M', 'other'];

  return {
    segment_id: id,
    language: randomChoice(languages),
    parent_age: randomInt(18, 55),
    parent_gender: randomChoice(genders),
    baby_count: randomInt(1, 4),
    engagement_propensity: random(0, 1),
    price_sensitivity: random(0, 1),
    brand_loyalty: random(0, 1),
    channel_perf_email: random(0, 1),
    channel_perf_push: random(0, 1),
    channel_perf_inapp: random(0, 1),
    values_family: random(0, 1),
    values_eco_conscious: random(0, 1),
    values_convenience: random(0, 1),
    values_quality: random(0, 1),
    contact_frequency_tolerance: random(0, 1),
    content_engagement_rate: random(0, 1),
  };
}

async function seedSegments() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting to seed segments...');

    // Clear existing data
    await client.query('TRUNCATE user_segments_enriched RESTART IDENTITY CASCADE');
    console.log('✓ Cleared existing segments');

    // Generate 100 segments
    const segments: SegmentData[] = [];
    for (let i = 1; i <= 100; i++) {
      segments.push(generateSegment(i));
    }

    // Insert segments in batches
    const batchSize = 20;
    for (let i = 0; i < segments.length; i += batchSize) {
      const batch = segments.slice(i, i + batchSize);

      const values = batch.map((_seg, idx) => {
        const offset = i + idx;
        return `($${offset * 17 + 1}, $${offset * 17 + 2}, $${offset * 17 + 3}, $${offset * 17 + 4}, $${offset * 17 + 5}, $${offset * 17 + 6}, $${offset * 17 + 7}, $${offset * 17 + 8}, $${offset * 17 + 9}, $${offset * 17 + 10}, $${offset * 17 + 11}, $${offset * 17 + 12}, $${offset * 17 + 13}, $${offset * 17 + 14}, $${offset * 17 + 15}, $${offset * 17 + 16}, $${offset * 17 + 17})`;
      }).join(', ');

      const params = batch.flatMap(seg => [
        seg.segment_id,
        seg.language,
        seg.parent_age,
        seg.parent_gender,
        seg.baby_count,
        seg.engagement_propensity,
        seg.price_sensitivity,
        seg.brand_loyalty,
        seg.channel_perf_email,
        seg.channel_perf_push,
        seg.channel_perf_inapp,
        seg.values_family,
        seg.values_eco_conscious,
        seg.values_convenience,
        seg.values_quality,
        seg.contact_frequency_tolerance,
        seg.content_engagement_rate,
      ]);

      const query = `
        INSERT INTO user_segments_enriched (
          segment_id, language, parent_age, parent_gender, baby_count,
          engagement_propensity, price_sensitivity, brand_loyalty,
          channel_perf_email, channel_perf_push, channel_perf_inapp,
          values_family, values_eco_conscious, values_convenience, values_quality,
          contact_frequency_tolerance, content_engagement_rate
        ) VALUES ${values}
      `;

      await client.query(query, params);
      console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} segments)`);
    }

    // Verify count
    const result = await client.query('SELECT COUNT(*) FROM user_segments_enriched');
    console.log(`✅ Seeding complete! Total segments: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding segments:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedSegments()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed:', err);
      process.exit(1);
    });
}

export { seedSegments };
