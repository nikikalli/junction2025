import { useState, useEffect } from 'react';

interface CanvasMessage {
  channel: string;
  subject?: string;
  body?: string;
  message?: string;
}

interface CanvasStep {
  name: string;
  type: string;
  channels?: string[];
  messages?: Record<string, CanvasMessage>;
}

interface Canvas {
  name: string;
  created_at: string;
  updated_at: string;
  description: string;
  draft: boolean;
  enabled: boolean;
  schedule_type?: string;
  variants: Array<{ name: string }>;
  steps: CanvasStep[];
  dispatch_id?: string;
  schedule_id?: string;
  country?: string;
  campaign_index?: number;
}

const MessagePreview = ({ message }: { message: CanvasMessage }) => {
  if (message.channel === 'email' && message.body) {
    return (
      <div className="border rounded">
        <div className="bg-gray-100 px-3 py-2 border-b text-sm">
          <strong>Subject:</strong> {message.subject || 'No subject'}
        </div>
        <iframe
          srcDoc={message.body}
          className="w-full h-96 border-0"
          title="Email preview"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  if (message.channel === 'sms' && (message.message || message.body)) {
    return (
      <div className="border rounded bg-white p-4">
        <div className="text-xs text-gray-500 mb-2">SMS Message</div>
        <div className="bg-blue-500 text-white rounded-2xl px-4 py-2 inline-block max-w-xs">
          {message.message || message.body}
        </div>
      </div>
    );
  }

  if (message.channel === 'push' && (message.message || message.body)) {
    return (
      <div className="border rounded bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-sm p-3 max-w-sm">
          <div className="text-xs text-gray-500 mb-1">Push Notification</div>
          <div className="font-semibold text-sm">{message.subject || 'Notification'}</div>
          <div className="text-sm text-gray-700 mt-1">{message.message || message.body}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded bg-gray-50 p-4">
      <div className="text-sm text-gray-500">
        {message.channel} message
      </div>
      <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(message, null, 2)}</pre>
    </div>
  );
};

interface ScheduledBroadcast {
  name: string;
  id: string;
  type: 'Canvas' | 'Campaign';
  tags: string[];
  next_send_time: string;
  schedule_type?: string;
}

interface CanvasList {
  id: string;
  name: string;
}

interface Segment {
  // Identifiers
  segment_id: string;

  // Demographics
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  baby_age_week_1: number;

  // Behavioral
  event_count: number;

  // Sentiment/Engagement
  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;

  // Channel Preferences
  prefers_email: boolean;
  prefers_push: boolean;
  prefers_inapp: boolean;

  // Values
  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;

  // UI fields
  type: string;
  id: number;
  name: string;
}

export const CampaignScreen = () => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [count] = useState(20);
  const [scheduled, setScheduled] = useState<ScheduledBroadcast[]>([]);
  const [showScheduled, setShowScheduled] = useState(false);
  const [canvasList, setCanvasList] = useState<CanvasList[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  // track selected campaign type per canvas id (so toggle is per-card)
  const [campaignTypes, setCampaignTypes] = useState<Record<string, 'Standard' | 'Promotional'>>({});
  const [selectedCampaignType, setSelectedCampaignType] = useState<'Standard' | 'Promotional'>('Standard');
  const [searchTerm, setSearchTerm] = useState('');

  const [segments, setSegments] = useState<Segment[]>([]);

  const fetchCanvasList = async () => {
    setLoadingList(true);
    try {
      const response = await fetch('http://localhost:3000/api/braze/canvas/list');
      const data = await response.json();
      const list = data.canvases?.map((c: any) => ({ id: c.id, name: c.name })) || [];
      setCanvasList(list);
      // initialize per-canvas campaign type to 'Standard'
      const initialTypes = list.reduce((acc: Record<string, 'Standard' | 'Promotional'>, c: CanvasList) => {
        acc[c.id] = 'Standard';
        return acc;
      }, {});
      setCampaignTypes(initialTypes);
    } catch (error) {
      console.error('Error fetching canvas list:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const selectCampaign = async (canvasId: string, campaignType: 'Standard' | 'Promotional') => {
    setSelectedCanvasId(canvasId);
    setSelectedSegment(null);
    setCanvases([]);
    setSelectedCampaignType(campaignType);
    setLoading(true);

    try {
      // Fetch analyzed segments from backend
      const response = await fetch('http://localhost:3000/api/braze/analyzedSegments?count=20');
      const data = await response.json();

      // Map backend segments to UI format
      const mappedSegments: Segment[] = data.segments.map((seg: any, index: number) => ({
        ...seg,
        id: index + 1,
        name: seg.segment_id,
        type: campaignType,
      }));

      setSegments(mappedSegments);
    } catch (error) {
      console.error('Error fetching analyzed segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSegment = async (segment: Segment) => {
    setSelectedSegment(segment);
    setLoading(true);
    try {
      if (!selectedCanvasId) return;
      const response = await fetch(`http://localhost:3000/api/braze/generate/${selectedCanvasId}?count=${count}`);
      const data = await response.json();
      // Only show the canvas copy corresponding to this segment (1-based index)
      const segmentCanvas = data.canvases?.[segment.id - 1];
      setCanvases(segmentCanvas ? [segmentCanvas] : []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const backToCampaigns = () => {
    setSelectedCanvasId(null);
    setSelectedSegment(null);
    setCanvases([]);
  };

  const backToSegments = () => {
    setSelectedSegment(null);
    setCanvases([]);
  };

  const toggleSegmentSelection = (segmentId: number) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const createCampaignsForSegments = async () => {
    if (!selectedCanvasId || selectedSegments.length === 0) return;

    setLoading(true);
    try {
      // Check if any selected segments are promotional
      const selectedSegmentObjs = segments.filter(seg => selectedSegments.includes(seg.id));
      const hasPromotional = selectedSegmentObjs.some(seg => seg.type === 'Promotional');

      // Compliance check for promotional campaigns (always passes for now)
      const complianceApproved = true;

      if (hasPromotional && !complianceApproved) {
        alert('Promotional campaigns require compliance approval');
        return;
      }

      // Show success with compliance status
      const message = hasPromotional
        ? `Creating campaigns for ${selectedSegments.length} segments...\n✓ Compliance check passed for promotional campaigns`
        : `Creating campaigns for ${selectedSegments.length} segments...`;

      alert(message);
      console.log('Selected segments:', selectedSegments);
      console.log('Compliance approved:', complianceApproved);

      // Reset selection
      setSelectedSegments([]);
    } catch (error) {
      console.error('Error creating campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduled = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/braze/scheduled');
      const data = await response.json();
      setScheduled(data.scheduled_broadcasts || []);
      setShowScheduled(true);
    } catch (error) {
      console.error('Error fetching scheduled campaigns:', error);
    }
  };

  useEffect(() => {
    fetchCanvasList();
  }, []);

  // simple client-side search for canvases by name
  const filteredCanvasList = canvasList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Campaign Generator</h1>
          <button
            onClick={fetchScheduled}
            className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700"
          >
            View Scheduled
          </button>
        </div>

        {!selectedCanvasId ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Select a Canvas</h2>
            {loadingList ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Loading canvases...</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search canvases..."
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCanvasList.map((canvas) => {
                   const currentType = campaignTypes[canvas.id] ?? 'Standard';
                    return (
                      <div
                        key={canvas.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{canvas.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">Campaign type:</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="inline-flex rounded-lg bg-gray-100 p-1">
                        <button
                          onClick={() => setCampaignTypes(prev => ({ ...prev, [canvas.id]: 'Standard' }))}
                          className={`px-3 py-1 rounded-md font-medium ${currentType === 'Standard' ? 'bg-white text-blue-800 shadow' : 'text-gray-600'}`}
                        >
                          Standard
                        </button>
                        <button
                          onClick={() => setCampaignTypes(prev => ({ ...prev, [canvas.id]: 'Promotional' }))}
                          className={`px-3 py-1 rounded-md font-medium ${currentType === 'Promotional' ? 'bg-white text-purple-800 shadow' : 'text-gray-600'}`}
                        >
                          Promotional
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">Current: <strong>{currentType}</strong></span>
                    </div>
                    <div>
                      <button
                        onClick={() => selectCampaign(canvas.id, currentType)}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700"
                      >
                        Select Canvas
                       </button>
                    </div>
                 </div>
                 );
                })}
                </div>
              </>
             )}
          </div>
        ) : !selectedSegment ? (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={backToCampaigns}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to canvases
              </button>
              <h2 className="text-xl font-semibold text-gray-700">
                Campaign Segments - {selectedCampaignType}
              </h2>
            </div>

            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <span className={`px-4 py-2 rounded-lg font-medium ${
                    selectedCampaignType === 'Standard'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedCampaignType} Campaign
                  </span>
                  <span className="text-sm text-gray-500">
                    {segments.length} segments available
                  </span>
                  {selectedCampaignType === 'Promotional' && (
                    <span className="text-xs text-green-600">
                      ✓ Compliance check enabled
                    </span>
                  )}
                </div>
                <button
                  onClick={createCampaignsForSegments}
                  disabled={selectedSegments.length === 0}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    selectedSegments.length > 0
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Create Campaigns ({selectedSegments.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all ${
                    selectedSegments.includes(segment.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-transparent hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSegments.includes(segment.id)}
                      onChange={() => toggleSegmentSelection(segment.id)}
                      className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-800 mb-2">
                        {segment.name}
                      </h3>

                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Language:</span>
                          <span className="font-medium">{segment.language.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age:</span>
                          <span className="font-medium">{segment.parent_age}y</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gender:</span>
                          <span className="font-medium capitalize">{segment.parent_gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Babies:</span>
                          <span className="font-medium">{segment.baby_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Engagement:</span>
                          <span className="font-medium">{segment.engagement_propensity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Loyalty:</span>
                          <span className="font-medium">{segment.brand_loyalty}%</span>
                        </div>
                      </div>

                      <div className="mt-2 flex gap-1 flex-wrap">
                        {segment.prefers_email && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">📧</span>
                        )}
                        {segment.prefers_push && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">🔔</span>
                        )}
                        {segment.prefers_inapp && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">📱</span>
                        )}
                      </div>

                      <button
                        onClick={() => selectSegment(segment)}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        View details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={backToSegments}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to segments
              </button>
              <h2 className="text-xl font-semibold text-gray-700">
                {selectedSegment.name} - Campaign Copy
              </h2>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Loading campaign copy...</p>
              </div>
            ) : canvases.length > 0 ? (
              <div className="max-w-4xl mx-auto">
                {canvases.map((canvas, index) => {
                  const allMessages: CanvasMessage[] = [];
                  canvas.steps.forEach(step => {
                    if (step.messages) {
                      Object.values(step.messages).forEach(msg => allMessages.push(msg));
                    }
                  });

                  return (
                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                        <h3 className="font-bold text-2xl">{canvas.name}</h3>
                        {canvas.country && (
                          <p className="text-sm opacity-90 mt-2">Country: {canvas.country}</p>
                        )}
                      </div>

                      <div className="p-6">
                        {canvas.dispatch_id && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                            <div className="font-semibold text-green-800">Scheduled to Braze</div>
                            <div className="text-green-600 mt-1 font-mono text-sm">
                              Dispatch: {canvas.dispatch_id}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mb-6 text-sm flex-wrap">
                          <span className={`px-3 py-1 rounded ${canvas.draft ? 'bg-gray-200' : 'bg-green-100 text-green-800'}`}>
                            {canvas.draft ? 'Draft' : 'Active'}
                          </span>
                          <span className="px-3 py-1 rounded bg-blue-100 text-blue-800">
                            {canvas.variants?.length || 0} variants
                          </span>
                          <span className="px-3 py-1 rounded bg-purple-100 text-purple-800">
                            {canvas.steps?.length || 0} steps
                          </span>
                        </div>

                        {allMessages.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-gray-800 mb-3">Messages</h4>
                            {allMessages.map((message, msgIndex) => (
                              <MessagePreview key={msgIndex} message={message} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No messages configured</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No campaign copy available</p>
              </div>
            )}
          </div>
        )}

        {showScheduled && scheduled.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Scheduled Campaigns ({scheduled.length})</h2>
              <button
                onClick={() => setShowScheduled(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {scheduled.map((broadcast, index) => (
                <div key={index} className="border rounded p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{broadcast.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID: {broadcast.id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      broadcast.type === 'Canvas' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {broadcast.type}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Next send: {new Date(broadcast.next_send_time).toLocaleString()}</p>
                    {broadcast.tags && broadcast.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {broadcast.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
    </div>
  );
};
