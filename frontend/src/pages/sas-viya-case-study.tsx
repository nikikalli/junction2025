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

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export const SasViyaCaseStudy = () => {
  const { clusterProfiles, valueAlignmentImpact, interactionEffects, primingEffectSummary } =
    analyticsData;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
            SAS Viya Analytics Pipeline
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced predictive analytics and behavioral clustering for personalized marketing
            campaigns across 40 user segments
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg px-6 py-3">
              <div className="text-2xl font-bold text-purple-400">40</div>
              <div className="text-sm text-gray-400">User Segments</div>
            </div>
            <div className="bg-cyan-600/20 border border-cyan-500/30 rounded-lg px-6 py-3">
              <div className="text-2xl font-bold text-cyan-400">5</div>
              <div className="text-sm text-gray-400">Behavioral Clusters</div>
            </div>
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg px-6 py-3">
              <div className="text-2xl font-bold text-green-400">57.3%</div>
              <div className="text-sm text-gray-400">Model R-squared</div>
            </div>
            <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg px-6 py-3">
              <div className="text-2xl font-bold text-orange-400">+19%</div>
              <div className="text-sm text-gray-400">Max Alignment Lift</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">
              Behavioral Cluster Distribution
            </h2>
            <p className="text-gray-400 mb-4">
              K-Means clustering identified 5 distinct user behavioral patterns
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clusterSizeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="segments"
                >
                  {clusterSizeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
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

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Value Alignment Conversion Lift
            </h2>
            <p className="text-gray-400 mb-4">
              Matching campaign themes to user values delivers significant conversion improvements
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valueAlignmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="theme" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: 'Conversion %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend />
                <Bar dataKey="aligned" name="Aligned" fill="#10B981" />
                <Bar dataKey="baseline" name="Baseline" fill="#6B7280" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {valueAlignmentData.map((item, idx) => (
                <div key={idx} className="text-center bg-green-900/30 rounded p-2">
                  <div className="text-green-400 font-bold">+{item.lift}%</div>
                  <div className="text-xs text-gray-400">{item.theme} lift</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Campaign Type Affinity</h2>
            <p className="text-gray-400 mb-4">
              Cluster preferences for educational, premium, and discount campaigns
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clusterAffinityData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="cluster" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar
                  name="Educational"
                  dataKey="educational"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Premium"
                  dataKey="premium"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Discount"
                  dataKey="discount"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">Channel Preferences</h2>
            <p className="text-gray-400 mb-4">
              Multi-channel engagement patterns across behavioral clusters
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPreferenceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="cluster" type="category" stroke="#9CA3AF" width={120} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value) => [`${Number(value).toFixed(2)}%`]}
                />
                <Legend />
                <Bar dataKey="email" name="Email" fill="#8B5CF6" stackId="a" />
                <Bar dataKey="push" name="Push" fill="#06B6D4" stackId="a" />
                <Bar dataKey="inapp" name="In-App" fill="#10B981" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-pink-400">
              Campaign Type x Channel Interaction Effects
            </h2>
            <p className="text-gray-400 mb-4">
              Synergy analysis: actual vs expected conversion rates (% lift when combined)
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="expected"
                  type="number"
                  name="Expected Conv"
                  stroke="#9CA3AF"
                  label={{ value: 'Expected Conversion %', position: 'bottom', fill: '#9CA3AF' }}
                />
                <YAxis
                  dataKey="actual"
                  type="number"
                  name="Actual Conv"
                  stroke="#9CA3AF"
                  label={{ value: 'Actual Conversion %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                />
                <ZAxis dataKey="lift" range={[50, 400]} name="Lift %" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`]}
                  labelFormatter={(_, payload) =>
                    payload[0] ? `${payload[0].payload.combination}` : ''
                  }
                />
                <Scatter name="Campaign Combinations" data={interactionData} fill="#EC4899">
                  {interactionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Number(entry.lift) > 0 ? '#10B981' : '#EF4444'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {interactionData.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className={`${Number(item.lift) > 0 ? 'bg-green-900/30' : 'bg-red-900/30'} rounded px-3 py-1`}
                >
                  <span className="text-gray-300">{item.combination}:</span>
                  <span
                    className={`ml-2 font-bold ${Number(item.lift) > 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {Number(item.lift) > 0 ? '+' : ''}
                    {item.lift}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
              Educational Content Priming Effect
            </h2>
            <p className="text-gray-400 mb-4">
              Impact of educational campaign exposure on subsequent premium conversions
            </p>
            <div className="flex items-center justify-center gap-12">
              <ResponsiveContainer width="50%" height={250}>
                <LineChart data={primingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="exposure" stroke="#9CA3AF" />
                  <YAxis
                    stroke="#9CA3AF"
                    domain={['dataMin - 0.001', 'dataMax + 0.001']}
                    label={{ value: 'Premium Conv %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => [`${value}%`]}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', r: 8 }}
                    activeDot={{ r: 10, fill: '#FBBF24' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {primingData.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="text-lg font-semibold text-yellow-400 capitalize">
                      {item.exposure}
                    </div>
                    <div className="text-2xl font-bold text-white">{item.conversion}%</div>
                    <div className="text-sm text-gray-400">{item.segments} segments</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-400">
          <p>
            Analytics powered by SAS Viya Cloud Analytic Services | Generated at{' '}
            {new Date(analyticsData.generatedAt).toLocaleString()}
          </p>
        </footer>
      </div>
    </div>
  );
};
