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
  id: number;
  name: string;
}

export const CampaignScreen = () => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [count] = useState(20);
  const [scheduled, setScheduled] = useState<ScheduledBroadcast[]>([]);
  const [showScheduled, setShowScheduled] = useState(false);
  const [canvasList, setCanvasList] = useState<CanvasList[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [segments] = useState<Segment[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Segment ${i + 1} - ${['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'JP', 'CN', 'BR', 'CA', 'AU', 'MX', 'IN', 'KR', 'NL', 'SE', 'NO', 'DK', 'FI', 'PL'][i % 20]}`
    }))
  );

  const fetchCanvasList = async () => {
    setLoadingList(true);
    try {
      const response = await fetch('http://localhost:3000/api/braze/canvas/list');
      const data = await response.json();
      const list = data.canvases?.map((c: any) => ({ id: c.id, name: c.name })) || [];
      setCanvasList(list);
    } catch (error) {
      console.error('Error fetching canvas list:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const selectCampaign = (canvasId: string) => {
    setSelectedCanvasId(canvasId);
    setSelectedSegment(null);
    setCanvases([]);
  };

  const selectSegment = async (segment: Segment) => {
    setSelectedSegment(segment);
    setLoading(true);
    try {
      if (!selectedCanvasId) return;
      const response = await fetch(`http://localhost:3000/api/campaigns/generate/${selectedCanvasId}?count=${count}`);
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

  const fetchScheduled = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/campaigns/scheduled');
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Select a Campaign</h2>
            {loadingList ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Loading campaigns...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {canvasList.map((canvas) => (
                  <button
                    key={canvas.id}
                    onClick={() => selectCampaign(canvas.id)}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{canvas.name}</h3>
                    <p className="text-sm text-gray-500">Click to view segments</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : !selectedSegment ? (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={backToCampaigns}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to campaigns
              </button>
              <h2 className="text-xl font-semibold text-gray-700">
                Campaign Segments
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => selectSegment(segment)}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-left"
                >
                  <h3 className="font-bold text-md text-gray-800">{segment.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Click to view copy</p>
                </button>
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
