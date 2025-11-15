import { useState } from 'react';

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

export const Home = () => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [canvasId, setCanvasId] = useState('19923340-39ce-4f9d-8738-69613e3b744e');
  const [count, setCount] = useState(20);

  const fetchCanvases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/campaigns/generate/${canvasId}?count=${count}`);
      const data = await response.json();
      setCanvases(data.canvases || []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Campaign Generator</h1>

        <div className="mb-6 bg-white rounded-lg shadow p-4 flex gap-4">
          <input
            type="text"
            value={canvasId}
            onChange={(e) => setCanvasId(e.target.value)}
            placeholder="Canvas ID"
            className="border p-2 rounded flex-1"
          />
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            placeholder="Count"
            className="border p-2 rounded w-24"
          />
          <button
            onClick={fetchCanvases}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Generate'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canvases.map((canvas, index) => {
            const allMessages: CanvasMessage[] = [];
            canvas.steps.forEach(step => {
              if (step.messages) {
                Object.values(step.messages).forEach(msg => allMessages.push(msg));
              }
            });

            return (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <h3 className="font-bold text-lg">{canvas.name}</h3>
                  <p className="text-sm opacity-90">Campaign {index + 1}</p>
                </div>

                <div className="p-4">
                  <div className="flex gap-2 mb-4 text-xs">
                    <span className={`px-2 py-1 rounded ${canvas.draft ? 'bg-gray-200' : 'bg-green-100 text-green-800'}`}>
                      {canvas.draft ? 'Draft' : 'Active'}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {canvas.variants?.length || 0} variants
                    </span>
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                      {canvas.steps?.length || 0} steps
                    </span>
                  </div>

                  {allMessages.length > 0 ? (
                    <div className="space-y-3">
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

        {!loading && canvases.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Click Generate to create campaigns</p>
          </div>
        )}
      </div>
    </div>
  );
};
