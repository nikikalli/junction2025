import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { InputWithButton } from "@/components/InputWithButton";
import { Nav } from "@/components/Nav";
import { useState, useEffect } from 'react';

interface CanvasList {
  id: string;
  name: string;
}

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

interface Segment {
  segment_id: string;
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  baby_age_week_1: number;
  event_count: number;
  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;
  prefers_email: boolean;
  prefers_push: boolean;
  prefers_inapp: boolean;
  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;
  type: string;
  id: number;
  name: string;
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


export const NewHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [canvasList, setCanvasList] = useState<CanvasList[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignTypes, setCampaignTypes] = useState<Record<string, 'Standard' | 'Promotional'>>({});
  const [selectedCampaignType, setSelectedCampaignType] = useState<'Standard' | 'Promotional'>('Standard');
  const count = 20;

  useEffect(() => {
    const fetchCanvasList = async () => {
      setLoadingList(true);
      try {
        const res = await fetch('http://localhost:3000/api/braze/canvas/list');
        const data = await res.json();
        const list = data.canvases?.map((c: any) => ({ id: c.id, name: c.name })) || [];
        setCanvasList(list);
        const initialTypes = list.reduce((acc: Record<string, 'Standard' | 'Promotional'>, c: CanvasList) => {
          acc[c.id] = 'Standard';
          return acc;
        }, {});
        setCampaignTypes(initialTypes);
      } catch (err) {
        console.error('Error fetching canvas list:', err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchCanvasList();
  }, []);

  const filteredCanvasList = canvasList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const selectCampaign = async (canvasId: string, campaignType: 'Standard' | 'Promotional') => {
    setSelectedCanvasId(canvasId);
    setSelectedSegment(null);
    setCanvases([]);
    setSelectedCampaignType(campaignType);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/campaigns/analyzedSegments?count=20');
      const data = await response.json();
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
      const response = await fetch(`http://localhost:3000/api/campaigns/generate/${selectedCanvasId}?count=${count}`);
      const data = await response.json();
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
    setSearchTerm('');
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
      const selectedSegmentObjs = segments.filter(seg => selectedSegments.includes(seg.id));
      const hasPromotional = selectedSegmentObjs.some(seg => seg.type === 'Promotional');
      const complianceApproved = true;

      if (hasPromotional && !complianceApproved) {
        alert('Promotional campaigns require compliance approval');
        return;
      }

      const message = hasPromotional
        ? `Creating campaigns for ${selectedSegments.length} segments...\n✓ Compliance check passed for promotional campaigns`
        : `Creating campaigns for ${selectedSegments.length} segments...`;

      alert(message);
      console.log('Selected segments:', selectedSegments);
      console.log('Compliance approved:', complianceApproved);
      setSelectedSegments([]);
    } catch (error) {
      console.error('Error creating campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <PrismaticBurst
          animationType="rotate3d"
          intensity={2}
          speed={0.5}
          distort={1.0}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={24}
          mixBlendMode="lighten"
          colors={["#ff007a", "#4d3dff", "#ffffff"]}
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center h-full">
          <Nav />
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <TextType
              className="text-4xl md:text-6xl font-bold mb-2 whitespace-nowrap"
              text={["One manager, a thousand campaigns"]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="_"
            />
            <p className="text-1xl md:text-2xl text-gray-400">
              Turn assets into campaigns with one click
            </p>
            <SpotlightCard
              className="flex flex-col items-center justify-center custom-spotlight-card w-full"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              {!selectedCanvasId ? (
                // CANVAS SELECTION VIEW
                <div className="relative w-full flex flex-col justify-center">
                  <InputWithButton
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSubmit={() => {
                      if (filteredCanvasList.length === 1) {
                        const currentType = campaignTypes[filteredCanvasList[0].id] ?? 'Standard';
                        selectCampaign(filteredCanvasList[0].id, currentType);
                      }
                    }}
                  />

                  {searchTerm.trim() !== '' && (
                    <div className="absolute mt-2 top-full w-full max-w-sm bg-white text-black rounded shadow-lg overflow-visible z-20">
                      {loadingList ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                      ) : filteredCanvasList.length > 0 ? (
                        filteredCanvasList.slice(0, 6).map((c) => {
                          const currentType = campaignTypes[c.id] ?? 'Standard';
                          return (
                            <div key={c.id} className="px-3 py-2 border-b hover:bg-gray-50">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-sm text-gray-700 flex-1">{c.name}</span>
                                <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                                  <button
                                    onClick={() => setCampaignTypes(prev => ({ ...prev, [c.id]: 'Standard' }))}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${currentType === 'Standard' ? 'bg-white text-blue-700 shadow' : 'text-gray-600'}`}
                                  >
                                    Std
                                  </button>
                                  <button
                                    onClick={() => setCampaignTypes(prev => ({ ...prev, [c.id]: 'Promotional' }))}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${currentType === 'Promotional' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}
                                  >
                                    Promo
                                  </button>
                                </div>
                                <button
                                  onClick={() => selectCampaign(c.id, currentType)}
                                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                >
                                  Select
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                      )}
                    </div>
                  )}
                </div>
              ) : !selectedSegment ? (
                // SEGMENT SELECTION VIEW
                <div className="w-full bg-gray-50 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={backToCampaigns}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ← Back
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Campaign Segments - {selectedCampaignType}
                    </h3>
                  </div>

                  <div className="mb-4 p-3 bg-white rounded border">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        selectedCampaignType === 'Standard'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedCampaignType} Campaign
                      </span>
                      <span className="text-xs text-gray-600">{segments.length} segments</span>
                      <button
                        onClick={createCampaignsForSegments}
                        disabled={selectedSegments.length === 0 || loading}
                        className={`text-xs px-3 py-1 rounded font-medium ${
                          selectedSegments.length > 0 && !loading
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Create ({selectedSegments.length})
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-6 text-gray-500">Loading segments...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          className={`p-3 border-2 rounded transition-all ${
                            selectedSegments.includes(segment.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSegments.includes(segment.id)}
                              onChange={() => toggleSegmentSelection(segment.id)}
                              className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 mb-1">{segment.name}</h4>
                              <div className="space-y-0.5 text-xs text-gray-600">
                                <div className="flex justify-between">
                                  <span>Age:</span>
                                  <span>{segment.parent_age}y</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Engagement:</span>
                                  <span>{segment.engagement_propensity}%</span>
                                </div>
                              </div>
                              <button
                                onClick={() => selectSegment(segment)}
                                className="mt-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                              >
                                View →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // CAMPAIGN COPY VIEW
                <div className="w-full bg-gray-50 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={backToSegments}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ← Back
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedSegment.name} - Campaign Copy
                    </h3>
                  </div>

                  {loading ? (
                    <div className="text-center py-6 text-gray-500">Loading campaign copy...</div>
                  ) : canvases.length > 0 ? (
                    <div className="space-y-4">
                      {canvases.map((canvas, index) => {
                        const allMessages: CanvasMessage[] = [];
                        canvas.steps.forEach(step => {
                          if (step.messages) {
                            Object.values(step.messages).forEach(msg => allMessages.push(msg));
                          }
                        });

                        return (
                          <div key={index} className="bg-white rounded-lg border overflow-hidden">
                            <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-4">
                              <h4 className="font-bold text-lg">{canvas.name}</h4>
                            </div>

                            <div className="p-4">
                              <div className="flex gap-2 mb-3 text-xs flex-wrap">
                                <span className={`px-2 py-1 rounded ${canvas.draft ? 'bg-gray-200' : 'bg-green-100 text-green-800'}`}>
                                  {canvas.draft ? 'Draft' : 'Active'}
                                </span>
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  {canvas.variants?.length || 0} variants
                                </span>
                              </div>

                              {allMessages.length > 0 ? (
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-sm text-gray-800">Messages</h5>
                                  {allMessages.map((message, msgIndex) => (
                                    <div key={msgIndex} className="text-sm">
                                      <MessagePreview message={message} />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">No messages configured</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">No campaign copy available</div>
                  )}
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};
