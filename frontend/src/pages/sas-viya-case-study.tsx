import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import analyticsData from '../data/analytics.json';
import SpotlightCard from '@/components/SpotlightCard';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const benefits = [
  { icon: '10K→1', title: 'Clicks Eliminated', desc: 'One click replaces 10,000 manual actions' },
  { icon: '0', title: 'Targeting Errors', desc: 'No more wrong messages to wrong segments' },
  { icon: '+19%', title: 'Conversion Lift', desc: 'AI optimizes messaging automatically' },
  { icon: '∞', title: 'Self-Improving', desc: 'LLM learns and scales with usage' },
];

const sectionColors = [
  'bg-gradient-to-br from-[#ff007a]/20 to-black',
  'bg-gradient-to-br from-[#4d3dff]/20 to-black',
  'bg-gradient-to-br from-cyan-500/20 to-black',
  'bg-gradient-to-br from-[#00e5ff]/20 to-black',
  'bg-gradient-to-br from-[#ff007a]/20 to-black',
  'bg-gradient-to-br from-[#4d3dff]/20 to-black',
];

export const SasViyaCaseStudy = () => {
  const { clusterProfiles, valueAlignmentImpact, interactionEffects, primingEffectSummary } =
    analyticsData;

  const [visibleBenefits, setVisibleBenefits] = useState<number[]>([]);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    benefits.forEach((_, index) => {
      setTimeout(() => {
        setVisibleBenefits((prev) => [...prev, index]);
      }, index * 200);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const clusterSizeData = clusterProfiles.map((cluster) => ({
    name: cluster.clusterName.replace(/_/g, ' '),
    segments: cluster.size,
    campaign: cluster.topCampaignType,
    channel: cluster.topChannel,
    value: cluster.topValue,
  }));

  const clusterAffinityData = clusterProfiles.map((cluster) => ({
    cluster: cluster.clusterName.replace(/_/g, ' '),
    educational: cluster.avgEduAffinity * 100,
    premium: cluster.avgPremiumAffinity * 100,
    discount: cluster.avgDiscountAffinity * 100,
  }));

  const channelPreferenceData = clusterProfiles.map((cluster) => ({
    cluster: cluster.clusterName.replace(/_/g, ' '),
    email: cluster.avgEmailPreference * 100,
    push: cluster.avgPushPreference * 100,
    inapp: cluster.avgInappPreference * 100,
  }));

  const valueAlignmentData = valueAlignmentImpact.map((item) => ({
    theme: item.valueTheme.replace(/_/g, ' '),
    aligned: (item.avgConversionAlign * 100).toFixed(2),
    baseline: (item.avgConversionNoAlign * 100).toFixed(2),
    lift: ((item.alignmentLift as number) * 100).toFixed(1),
  }));

  const interactionData = interactionEffects.map((item) => ({
    combination: `${item.campaignType}+${item.channel}`,
    lift: ((item.interactionLift as number) * 100).toFixed(2),
    actual: (item.actualConv * 100).toFixed(3),
    expected: (item.expectedConv * 100).toFixed(3),
  }));

  const primingData = primingEffectSummary.map((item) => ({
    exposure: item.exposureLevel.replace(/_/g, ' '),
    conversion: (item.avgPremiumConv * 100).toFixed(3),
    segments: item.segmentCount,
  }));

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff007a] via-[#4d3dff] to-white mb-6">
          SAS Viya Analytics
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl text-center mb-8">
          The brain behind automated campaign personalization across 20+ countries
        </p>
        <div className="max-w-4xl text-center mb-12">
          <p className="text-gray-300 leading-relaxed">
            SAS Viya's cloud analytics platform (CAS) analyzes thousands of past campaign results
            to understand what works for different parent groups. It learns which parents respond
            to discounts vs. educational content, preferred channels, and what values resonate
            with each segment.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
          {benefits.map((benefit, index) => (
            <SpotlightCard
              key={index}
              className={`transform transition-all duration-700 ${
                visibleBenefits.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="p-4">
                <div className="text-3xl font-bold text-[#00e5ff] mb-2">{benefit.icon}</div>
                <div className="text-lg font-semibold text-white mb-1">{benefit.title}</div>
                <div className="text-sm text-gray-400">{benefit.desc}</div>
              </div>
            </SpotlightCard>
          ))}
        </div>
        <div className="mt-16 animate-bounce">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Section 1: Cluster Distribution */}
      <div
        ref={(el) => { sectionRefs.current[0] = el; }}
        data-index="0"
        className={`min-h-screen flex items-center justify-center p-8 ${sectionColors[0]} transition-all duration-1000 ${
          visibleSections.has(0) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SpotlightCard className="max-w-5xl w-full" spotlightColor="rgba(255, 0, 122, 0.15)">
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4 text-[#ff007a]">Behavioral Clustering</h2>
            <p className="text-gray-400 mb-8 text-lg">
              SAS Viya processes historical campaign data and builds behavioral profiles for 40
              segments, grouping them into 5 archetypes. What used to require manual setup for each
              market now happens automatically.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={clusterSizeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="segments"
                >
                  {clusterSizeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value, _name, props) => [
                    <div key="tooltip">
                      <div>Segments: {value}</div>
                      <div>Campaign: {props.payload.campaign}</div>
                      <div>Channel: {props.payload.channel}</div>
                      <div>Value: {props.payload.value}</div>
                    </div>,
                    '',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Section 2: Value Alignment */}
      <div
        ref={(el) => { sectionRefs.current[1] = el; }}
        data-index="1"
        className={`min-h-screen flex items-center justify-center p-8 ${sectionColors[1]} transition-all duration-1000 ${
          visibleSections.has(1) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SpotlightCard className="max-w-5xl w-full" spotlightColor="rgba(77, 61, 255, 0.15)">
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4 text-[#4d3dff]">Value Alignment Lift</h2>
            <p className="text-gray-400 mb-8 text-lg">
              The LLM automatically matches campaign themes to user values, preventing embarrassing
              mistakes (like tampon ads to men). Conversions jump 12-19%.
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={valueAlignmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="theme" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} formatter={(value) => [`${value}%`]} />
                <Legend />
                <Bar dataKey="aligned" name="Aligned" fill="#10B981" />
                <Bar dataKey="baseline" name="Baseline" fill="#6B7280" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {valueAlignmentData.map((item, idx) => (
                <div key={idx} className="text-center bg-[#00e5ff]/10 rounded-lg p-3">
                  <div className="text-2xl text-[#00e5ff] font-bold">+{item.lift}%</div>
                  <div className="text-sm text-gray-400">{item.theme}</div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Section 3: Campaign Type Affinity */}
      <div
        ref={(el) => { sectionRefs.current[2] = el; }}
        data-index="2"
        className={`min-h-screen flex items-center justify-center p-8 ${sectionColors[2]} transition-all duration-1000 ${
          visibleSections.has(2) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SpotlightCard className="max-w-5xl w-full" spotlightColor="rgba(6, 182, 212, 0.15)">
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4 text-cyan-400">Campaign Type Affinity</h2>
            <p className="text-gray-400 mb-8 text-lg">
              The system learns which campaign types work for each cluster. No more guessing or
              manual A/B testing. The AI continuously improves.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clusterAffinityData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="cluster" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar name="Educational" dataKey="educational" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Radar name="Premium" dataKey="premium" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                <Radar name="Discount" dataKey="discount" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Section 4: Channel Preferences */}
      <div
        ref={(el) => { sectionRefs.current[3] = el; }}
        data-index="3"
        className={`min-h-screen flex items-center justify-center p-8 ${sectionColors[3]} transition-all duration-1000 ${
          visibleSections.has(3) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SpotlightCard className="max-w-5xl w-full" spotlightColor="rgba(0, 229, 255, 0.15)">
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4 text-[#00e5ff]">Channel Preferences</h2>
            <p className="text-gray-400 mb-8 text-lg">
              One click auto-selects the best channel for each segment. No manual configuration
              needed. The AI handles email, push, and in-app routing instantly.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={channelPreferenceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="cluster" type="category" stroke="#9CA3AF" width={150} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} formatter={(value) => [`${Number(value).toFixed(2)}%`]} />
                <Legend />
                <Bar dataKey="email" name="Email" fill="#8B5CF6" stackId="a" />
                <Bar dataKey="push" name="Push" fill="#06B6D4" stackId="a" />
                <Bar dataKey="inapp" name="In-App" fill="#10B981" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Section 5: Interaction Effects */}
      <div
        ref={(el) => { sectionRefs.current[4] = el; }}
        data-index="4"
        className={`min-h-screen flex items-center justify-center p-8 ${sectionColors[4]} transition-all duration-1000 ${
          visibleSections.has(4) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SpotlightCard className="max-w-6xl w-full" spotlightColor="rgba(255, 0, 122, 0.15)">
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4 text-[#ff007a]">Hidden Synergies</h2>
            <p className="text-gray-400 mb-8 text-lg">
              The LLM discovers patterns humans miss. Discount+email yields +4.1% extra lift.
              This self-improving intelligence scales infinitely with usage.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="expected" type="number" stroke="#9CA3AF" label={{ value: 'Expected %', position: 'bottom', fill: '#9CA3AF' }} />
                <YAxis dataKey="actual" type="number" stroke="#9CA3AF" label={{ value: 'Actual %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <ZAxis dataKey="lift" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} formatter={(value) => [`${value}%`]} labelFormatter={(_, payload) => payload[0] ? `${payload[0].payload.combination}` : ''} />
                <Scatter data={interactionData} fill="#EC4899">
                  {interactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Number(entry.lift) > 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {interactionData.slice(0, 5).map((item, idx) => (
                <div key={idx} className={`${Number(item.lift) > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg px-4 py-2`}>
                  <span className="text-gray-300">{item.combination}:</span>
                  <span className={`ml-2 font-bold ${Number(item.lift) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Number(item.lift) > 0 ? '+' : ''}{item.lift}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Section 6: Educational Priming */}
      <div
        ref={(el) => { sectionRefs.current[5] = el; }}
        data-index="5"
        className={`min-h-screen flex items-center justify-center p-8 ${sectionColors[5]} transition-all duration-1000 ${
          visibleSections.has(5) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SpotlightCard className="max-w-5xl w-full" spotlightColor="rgba(77, 61, 255, 0.15)">
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4 text-[#4d3dff]">Educational Priming</h2>
            <p className="text-gray-400 mb-8 text-lg">
              The AI automatically sequences campaigns. Educational content first, then premium
              offers. One click triggers intelligent multi-step journeys.
            </p>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={primingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="exposure" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} formatter={(value) => [`${value}%`]} />
                  <Line type="monotone" dataKey="conversion" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 8 }} activeDot={{ r: 10, fill: '#FBBF24' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {primingData.map((item, idx) => (
                  <div key={idx} className="bg-[#4d3dff]/10 border border-[#4d3dff]/30 rounded-lg p-4">
                    <div className="text-lg font-semibold text-[#4d3dff] capitalize">{item.exposure}</div>
                    <div className="text-2xl font-bold text-white">{item.conversion}%</div>
                    <div className="text-sm text-gray-400">{item.segments} segments</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-500 bg-black">
        <p>
          Analytics powered by SAS Viya Cloud Analytic Services | Generated at{' '}
          {new Date(analyticsData.generatedAt).toLocaleString()}
        </p>
      </footer>
    </div>
  );
};
