import { PrismaClient } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function fetchAndSaveAnalytics() {
  console.log('Fetching analytics data from database...');

  const [
    clusterProfiles,
    segmentClusters,
    modelSummary,
    attributeEffectiveness,
    channelVersatility,
    interactionEffects,
    valueAlignmentImpact,
    primingEffectSummary,
  ] = await Promise.all([
    prisma.clusterProfile.findMany({ orderBy: { clusterId: 'asc' } }),
    prisma.segmentCluster.findMany({ orderBy: { segmentId: 'asc' } }),
    prisma.modelSummary.findMany(),
    prisma.attributeEffectiveness.findMany({ orderBy: { avgConversion: 'desc' } }),
    prisma.channelVersatility.findMany({ orderBy: { segmentId: 'asc' } }),
    prisma.interactionEffect.findMany({ orderBy: { interactionLift: 'desc' } }),
    prisma.valueAlignmentImpact.findMany({ orderBy: { alignmentLift: 'desc' } }),
    prisma.primingEffectSummary.findMany(),
  ]);

  const analyticsData = {
    clusterProfiles,
    segmentClusters,
    modelSummary,
    attributeEffectiveness,
    channelVersatility,
    interactionEffects,
    valueAlignmentImpact,
    primingEffectSummary,
    generatedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, '../src/data/analytics.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(analyticsData, null, 2));
  console.log(`Analytics data saved to ${outputPath}`);
  console.log(`- ${clusterProfiles.length} cluster profiles`);
  console.log(`- ${segmentClusters.length} segment clusters`);
  console.log(`- ${modelSummary.length} model summary entries`);
  console.log(`- ${attributeEffectiveness.length} attribute effectiveness records`);
  console.log(`- ${channelVersatility.length} channel versatility records`);
  console.log(`- ${interactionEffects.length} interaction effects`);
  console.log(`- ${valueAlignmentImpact.length} value alignment impacts`);
  console.log(`- ${primingEffectSummary.length} priming effect summaries`);
}

fetchAndSaveAnalytics()
  .catch((e) => {
    console.error('Failed to fetch analytics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
