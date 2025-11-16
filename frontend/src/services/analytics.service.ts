import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const analyticsService = {
  async getClusterProfiles() {
    return await prisma.clusterProfile.findMany({
      orderBy: { clusterId: 'asc' },
    });
  },

  async getSegmentClusters() {
    return await prisma.segmentCluster.findMany({
      orderBy: { segmentId: 'asc' },
    });
  },

  async getModelSummary() {
    return await prisma.modelSummary.findMany();
  },

  async getAttributeEffectiveness() {
    return await prisma.attributeEffectiveness.findMany({
      orderBy: { avgConversion: 'desc' },
    });
  },

  async getChannelVersatility() {
    return await prisma.channelVersatility.findMany({
      orderBy: { segmentId: 'asc' },
    });
  },

  async getInteractionEffects() {
    return await prisma.interactionEffect.findMany({
      orderBy: { interactionLift: 'desc' },
    });
  },

  async getValueAlignmentImpact() {
    return await prisma.valueAlignmentImpact.findMany({
      orderBy: { alignmentLift: 'desc' },
    });
  },

  async getPrimingEffectSummary() {
    return await prisma.primingEffectSummary.findMany();
  },

  async getAllAnalytics() {
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
      this.getClusterProfiles(),
      this.getSegmentClusters(),
      this.getModelSummary(),
      this.getAttributeEffectiveness(),
      this.getChannelVersatility(),
      this.getInteractionEffects(),
      this.getValueAlignmentImpact(),
      this.getPrimingEffectSummary(),
    ]);

    return {
      clusterProfiles,
      segmentClusters,
      modelSummary,
      attributeEffectiveness,
      channelVersatility,
      interactionEffects,
      valueAlignmentImpact,
      primingEffectSummary,
    };
  },
};
