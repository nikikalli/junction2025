import { useState } from 'react';
import { apiClient } from '../services/api';

interface SegmentAction {
  id: string;
  segment: string;
  canvasId: string;
  canvasName: string;
  stepId: string;
  stepName: string;
  stepType: string;
  nextPaths?: Array<{
    name: string;
    next_step_id: string;
  }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface GenerateActionsResponse {
  data?: {
    actions: SegmentAction[];
  };
  error?: string;
}

interface PersonalizedMessage {
  originalMessage: string;
  personalizedMessage: string;
  channel: string;
  field: string;
}

interface PersonalizeActionResult {
  actionId: string;
  segment: string;
  stepName: string;
  stepType: string;
  personalizedMessages: PersonalizedMessage[];
  promptUsed: string;
}

export function Test() {
  const [segment, setSegment] = useState('woman');
  const [canvasId, setCanvasId] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GenerateActionsResponse | null>(null);
  const [storedActions, setStoredActions] = useState<SegmentAction[]>([]);
  const [personalizing, setPersonalizing] = useState(false);
  const [personalizedResults, setPersonalizedResults] = useState<PersonalizeActionResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setPersonalizedResults([]);

    try {
      const result = await apiClient.post<GenerateActionsResponse>(
        '/api/segments/actions/generate',
        {
          segment,
          canvasId,
          includeMetadata,
        }
      );
      setResponse(result);

      if (result.data?.actions) {
        setStoredActions(result.data.actions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate actions');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalizeAll = async () => {
    if (!storedActions.length) return;

    setPersonalizing(true);
    setError(null);
    setPersonalizedResults([]);

    try {
      const actionIds = storedActions.map(a => a.id);
      const result = await apiClient.post<{ data?: PersonalizeActionResult[] }>(
        '/api/segments/actions/personalize-batch',
        { actionIds }
      );

      if (result.data) {
        setPersonalizedResults(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to personalize actions');
    } finally {
      setPersonalizing(false);
    }
  };

  const handlePersonalizeSingle = async (actionId: string) => {
    setPersonalizing(true);
    setError(null);

    try {
      const result = await apiClient.post<{ data?: PersonalizeActionResult }>(
        `/api/segments/actions/${actionId}/personalize`
      );

      if (result.data) {
        setPersonalizedResults(prev => {
          const filtered = prev.filter(r => r.actionId !== actionId);
          return [...filtered, result.data!];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to personalize action');
    } finally {
      setPersonalizing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Segment Action Generator Test</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="segment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Segment
              </label>
              <input
                id="segment"
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="e.g., woman"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div>
              <label htmlFor="canvasId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Canvas ID
              </label>
              <input
                id="canvasId"
                type="text"
                value={canvasId}
                onChange={(e) => setCanvasId(e.target.value)}
                placeholder="Enter Canvas ID"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="includeMetadata"
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
              />
              <label htmlFor="includeMetadata">Include metadata</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Generating...' : 'Generate Actions'}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {response && response.data && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                border: '1px solid #c3e6cb',
              }}
            >
              <strong>Success!</strong>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <div>Actions generated: {storedActions.length}</div>
              </div>
            </div>
          )}

          {storedActions.length > 0 && (
            <button
              onClick={handlePersonalizeAll}
              disabled={personalizing}
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                width: '100%',
                backgroundColor: personalizing ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: personalizing ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {personalizing ? 'Personalizing with AI...' : 'Personalize All with Gemini'}
            </button>
          )}
        </div>

        <div>
          <h2 style={{ marginBottom: '1rem' }}>JSON Response</h2>
          <div
            style={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1.5rem',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 200px)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          >
            {response ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div style={{ color: '#888' }}>No response yet. Generate actions to see the JSON output.</div>
            )}
          </div>
        </div>
      </div>

      {response && response.data && response.data.actions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Actions Table</h2>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Segment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Step Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Step Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Next Paths</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {response.data.actions.map((action, index) => (
                  <tr
                    key={action.id}
                    style={{
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {action.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '0.75rem' }}>{action.segment}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{action.stepName}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {action.stepType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {action.nextPaths && action.nextPaths.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                          {action.nextPaths.map((path, i) => (
                            <li key={i}>{path.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#999' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handlePersonalizeSingle(action.id)}
                        disabled={personalizing}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: personalizing ? '#ccc' : '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: personalizing ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Personalize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {personalizedResults.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>AI Personalized Messages</h2>
          {personalizedResults.map((result) => (
            <div
              key={result.actionId}
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
                  {result.stepName} ({result.stepType})
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  Segment: <strong>{result.segment}</strong> | Action ID: <code>{result.actionId.substring(0, 8)}...</code>
                </div>
              </div>

              {result.personalizedMessages.length === 0 ? (
                <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                  No messages to personalize for this step
                </div>
              ) : (
                result.personalizedMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#28a745' }}>
                      {msg.channel} - {msg.field}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                        Original:
                      </div>
                      <div
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f8f9fa',
                          borderLeft: '3px solid #dc3545',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.originalMessage}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                        Personalized for "{result.segment}":
                      </div>
                      <div
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#d4edda',
                          borderLeft: '3px solid #28a745',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.personalizedMessage}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
