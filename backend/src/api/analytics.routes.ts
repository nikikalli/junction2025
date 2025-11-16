import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

router.get('/cluster-profiles', async (_req, res) => {
  try {
    const data = await prisma.clusterProfile.findMany({
      orderBy: { clusterId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching cluster profiles:', error);
    res.status(500).json({ error: 'Failed to fetch cluster profiles' });
  }
});

router.get('/segment-clusters', async (_req, res) => {
  try {
    const data = await prisma.segmentCluster.findMany({
      orderBy: { segmentId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching segment clusters:', error);
    res.status(500).json({ error: 'Failed to fetch segment clusters' });
  }
});

router.get('/model-summary', async (_req, res) => {
  try {
    const data = await prisma.modelSummary.findMany();
    res.json(data);
  } catch (error) {
    console.error('Error fetching model summary:', error);
    res.status(500).json({ error: 'Failed to fetch model summary' });
  }
});

router.get('/attribute-effectiveness', async (_req, res) => {
  try {
    const data = await prisma.attributeEffectiveness.findMany({
      orderBy: { avgConversion: 'desc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching attribute effectiveness:', error);
    res.status(500).json({ error: 'Failed to fetch attribute effectiveness' });
  }
});

router.get('/channel-versatility', async (_req, res) => {
  try {
    const data = await prisma.channelVersatility.findMany({
      orderBy: { segmentId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching channel versatility:', error);
    res.status(500).json({ error: 'Failed to fetch channel versatility' });
  }
});

router.get('/interaction-effects', async (_req, res) => {
  try {
    const data = await prisma.interactionEffect.findMany({
      orderBy: { interactionLift: 'desc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching interaction effects:', error);
    res.status(500).json({ error: 'Failed to fetch interaction effects' });
  }
});

router.get('/value-alignment', async (_req, res) => {
  try {
    const data = await prisma.valueAlignmentImpact.findMany({
      orderBy: { alignmentLift: 'desc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching value alignment:', error);
    res.status(500).json({ error: 'Failed to fetch value alignment' });
  }
});

router.get('/priming-effects', async (_req, res) => {
  try {
    const data = await prisma.primingEffectSummary.findMany();
    res.json(data);
  } catch (error) {
    console.error('Error fetching priming effects:', error);
    res.status(500).json({ error: 'Failed to fetch priming effects' });
  }
});

router.get('/all', async (_req, res) => {
  try {
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

    res.json({
      clusterProfiles,
      segmentClusters,
      modelSummary,
      attributeEffectiveness,
      channelVersatility,
      interactionEffects,
      valueAlignmentImpact,
      primingEffectSummary,
    });
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export { router };
