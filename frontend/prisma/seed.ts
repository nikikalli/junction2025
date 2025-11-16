import { PrismaClient } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
}

async function seedClusterProfiles() {
  const filePath = path.join(__dirname, '../../data/output/cluster_profiles.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.clusterProfile.deleteMany();

  for (const row of data) {
    await prisma.clusterProfile.create({
      data: {
        clusterId: parseInt(row.cluster_id),
        clusterName: row.cluster_name,
        size: parseInt(row.size),
        avgEduAffinity: parseFloat(row.avg_edu_affinity),
        avgPremiumAffinity: parseFloat(row.avg_premium_affinity),
        avgDiscountAffinity: parseFloat(row.avg_discount_affinity),
        avgEmailPreference: parseFloat(row.avg_email_preference),
        avgPushPreference: parseFloat(row.avg_push_preference),
        avgInappPreference: parseFloat(row.avg_inapp_preference),
        topCampaignType: row.top_campaign_type,
        topChannel: row.top_channel,
        topValue: row.top_value,
      },
    });
  }
  console.log(`Seeded ${data.length} cluster profiles`);
}

async function seedSegmentClusters() {
  const filePath = path.join(__dirname, '../../data/output/segment_clusters.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.segmentCluster.deleteMany();

  for (const row of data) {
    await prisma.segmentCluster.create({
      data: {
        segmentId: parseFloat(row.segment_id),
        clusterId: parseInt(row.cluster_id),
        clusterName: row.cluster_name,
        recommendedCampaignType: row.recommended_campaign_type,
        recommendedChannel: row.recommended_channel,
        recommendedTheme: row.recommended_theme,
        expectedConversion: row.expected_conversion,
      },
    });
  }
  console.log(`Seeded ${data.length} segment clusters`);
}

async function seedModelSummary() {
  const filePath = path.join(__dirname, '../../data/output/model_summary.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.modelSummary.deleteMany();

  for (const row of data) {
    if (row.value) {
      await prisma.modelSummary.create({
        data: {
          section: row.section,
          metric: row.metric,
          value: parseFloat(row.value),
          rank: row.rank ? parseInt(row.rank) : null,
        },
      });
    }
  }
  console.log(`Seeded model summary`);
}

async function seedAttributeEffectiveness() {
  const filePath = path.join(__dirname, '../../data/output/attribute_effectiveness.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.attributeEffectiveness.deleteMany();

  for (const row of data) {
    await prisma.attributeEffectiveness.create({
      data: {
        campaignType: row.campaign_type,
        channel: row.channel,
        sentiment: row.message_sentiment,
        valueTheme: row.value_theme,
        avgEngagement: parseFloat(row.avg_engagement),
        avgConversion: parseFloat(row.avg_conversion),
        sampleSize: parseInt(row.segment_count),
        stdError: parseFloat(row.std_error),
      },
    });
  }
  console.log(`Seeded ${data.length} attribute effectiveness records`);
}

async function seedChannelVersatility() {
  const filePath = path.join(__dirname, '../../data/output/channel_versatility.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.channelVersatility.deleteMany();

  for (const row of data) {
    await prisma.channelVersatility.create({
      data: {
        segmentId: parseFloat(row.segment_id),
        emailEngagement: parseFloat(row.email_engagement),
        pushEngagement: parseFloat(row.push_engagement),
        inappEngagement: parseFloat(row.inapp_engagement),
        engagementVariance: parseFloat(row.engagement_variance),
        classification: row.channel_strategy,
      },
    });
  }
  console.log(`Seeded ${data.length} channel versatility records`);
}

async function seedInteractionEffects() {
  const filePath = path.join(__dirname, '../../data/output/interaction_effects.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.interactionEffect.deleteMany();

  for (const row of data) {
    await prisma.interactionEffect.create({
      data: {
        campaignType: row.campaign_type,
        channel: row.channel,
        actualConv: parseFloat(row.actual_conversion),
        expectedConv: parseFloat(row.expected_conversion),
        interactionLift: parseFloat(row.interaction_lift),
      },
    });
  }
  console.log(`Seeded ${data.length} interaction effects`);
}

async function seedValueAlignmentImpact() {
  const filePath = path.join(__dirname, '../../data/output/value_alignment_impact.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.valueAlignmentImpact.deleteMany();

  for (const row of data) {
    const aligned = parseFloat(row.aligned_theme_conversion);
    const baseline = parseFloat(row.baseline_conversion);
    const lift = (aligned - baseline) / baseline;
    await prisma.valueAlignmentImpact.create({
      data: {
        valueTheme: row.dominant_value,
        avgConversionAlign: aligned,
        avgConversionNoAlign: baseline,
        alignmentLift: lift,
      },
    });
  }
  console.log(`Seeded ${data.length} value alignment impact records`);
}

async function seedPrimingEffectSummary() {
  const filePath = path.join(__dirname, '../../data/output/priming_effect_summary.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseCSV(content);

  await prisma.primingEffectSummary.deleteMany();

  for (const row of data) {
    await prisma.primingEffectSummary.create({
      data: {
        exposureLevel: row.edu_exposure_level,
        avgPremiumConv: parseFloat(row.avg_later_premium_conv),
        segmentCount: parseInt(row.segment_count),
      },
    });
  }
  console.log(`Seeded ${data.length} priming effect summary records`);
}

async function main() {
  console.log('Starting database seeding...');

  await seedClusterProfiles();
  await seedSegmentClusters();
  await seedModelSummary();
  await seedAttributeEffectiveness();
  await seedChannelVersatility();
  await seedInteractionEffects();
  await seedValueAlignmentImpact();
  await seedPrimingEffectSummary();

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
