import { getPool } from '../config/database';

async function seed() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Seeding database...');

    // Clear existing data
    await client.query('TRUNCATE TABLE campaigns CASCADE');

    // Insert 3 campaigns
    const campaignResults = await client.query(`
      INSERT INTO campaigns (name, canvas_id, start_date)
      VALUES 
        ('Black Friday Campaign', 'canvas_bf_2024', '2024-11-25 00:00:00'),
        ('Holiday Welcome Series', 'canvas_holiday_welcome', '2024-12-01 00:00:00'),
        ('New Year Re-engagement', 'canvas_nye_reeng', NULL)
      RETURNING id
    `);

    const campaignIds = campaignResults.rows.map(row => row.id);
    console.log(`✓ Created 3 campaigns with IDs: ${campaignIds.join(', ')}`);

    // Create implementations for each campaign (2 segments each)
    for (const campaignId of campaignIds) {
      const implResults = await client.query(`
        INSERT INTO campaign_implementations (campaign_id)
        VALUES ($1), ($1)
        RETURNING id
      `, [campaignId]);

      const implIds = implResults.rows.map(row => row.id);
      console.log(`✓ Created 2 implementations for campaign ${campaignId}: ${implIds.join(', ')}`);

      // Create 3 actions for each implementation
      for (const implId of implIds) {
        await client.query(`
          INSERT INTO action (
            campaign_implementation_id, 
            day_of_campaign, 
            channel, 
            message_subject, 
            message_body
          )
          VALUES 
            ($1, NOW() + INTERVAL '1 day', 'email', 'Welcome to Our Store!', 'We are excited to have you here.'),
            ($1, NOW() + INTERVAL '3 days', 'push', 'Don''t Miss Out!', 'Check out our latest deals.'),
            ($1, NOW() + INTERVAL '7 days', 'email', 'We Miss You!', 'Come back and see what''s new.')
        `, [implId]);
      }
      console.log(`✓ Created 6 actions (3 per implementation) for campaign ${campaignId}`);
    }

    await client.query('COMMIT');
    console.log('\n✓ Database seeded successfully!');
    console.log(`  - 3 campaigns`);
    console.log(`  - 6 campaign implementations (2 per campaign)`);
    console.log(`  - 18 actions (3 per implementation)`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
