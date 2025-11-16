import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SegmentList } from "@/components/SegmentList";
import { MessageListPanel } from "@/components/MessageListPanel";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { useCanvasMessages } from "@/hooks/useCanvasMessages";
import { campaignsApi } from "@/services/campaigns.api";
import type { CanvasMessage, Canvas, Segment } from "@/types";
import type { CampaignWithImplementations } from "@/types/campaigns";

const MessagePreview = ({ message }: { message: CanvasMessage }) => {
  if (message.channel === "email" && message.body) {
    return (
      <div className="border border-neutral-700 h-full rounded-lg overflow-hidden bg-neutral-800">
        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-600 text-sm">
          <strong className="text-neutral-100">Subject:</strong>
          <span className="text-neutral-300 ml-2">
            {message.subject || "No subject"}
          </span>
        </div>
        <iframe
          srcDoc={message.body}
          className="w-full h-full border-0"
          title="Email preview"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  if (message.channel === "sms" && (message.message || message.body)) {
    return (
      <div className="border border-neutral-700 rounded-lg bg-neutral-800 p-4">
        <div className="text-xs text-neutral-400 mb-3">SMS Message</div>
        <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 inline-block max-w-xs">
          {message.message || message.body}
        </div>
      </div>
    );
  }

  if (message.channel === "push" && (message.message || message.body)) {
    return (
      <div className="border border-neutral-700 rounded-lg bg-neutral-800 p-4">
        <div className="bg-neutral-700 rounded-lg shadow-sm p-3 max-w-sm border border-neutral-600">
          <div className="text-xs text-neutral-400 mb-2">Push Notification</div>
          <div className="font-semibold text-sm text-neutral-100">
            {message.subject || "Notification"}
          </div>
          <div className="text-sm text-neutral-300 mt-2">
            {message.message || message.body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-neutral-700 rounded-lg bg-neutral-800 p-4">
      <div className="text-sm text-neutral-400">{message.channel} message</div>
      <pre className="text-xs mt-2 overflow-auto text-neutral-300">
        {JSON.stringify(message, null, 2)}
      </pre>
    </div>
  );
};

export const Segments = () => {
  const { canvasId } = useParams<{ canvasId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignType, setCampaignType] = useState<"Awareness" | "Promotional">("Awareness");
  const [campaignData, setCampaignData] = useState<CampaignWithImplementations | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const { selectedMessageKey, setSelectedMessageKey, allMessages, selectedMessage } =
    useCanvasMessages(canvases);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'Awareness' || typeParam === 'Promotional') {
      setCampaignType(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch campaign details from the campaigns API using campaign ID directly
    const fetchCampaignData = async () => {
      if (!canvasId) return;

      console.log('=== Starting fetchCampaignData ===');
      console.log('Campaign ID from URL:', canvasId);

      setLoading(true);
      try {
        const campaignId = parseInt(canvasId, 10);

        if (isNaN(campaignId)) {
          console.error('Invalid campaign ID:', canvasId);
          return;
        }

        // Fetch full campaign data with implementations (segments)
        console.log('Fetching campaign by ID:', campaignId);
        const fullCampaign = await campaignsApi.getCampaignById(campaignId);
        console.log('Full campaign data:', fullCampaign);
        console.log('Implementations:', fullCampaign.implementations);

        setCampaignName(fullCampaign.name);
        setCampaignData(fullCampaign);

        // Map implementations to segments format
        if (fullCampaign.implementations && fullCampaign.implementations.length > 0) {
          console.log('Mapping implementations to segments...');
          const mappedSegments: Segment[] = fullCampaign.implementations.map((impl) => ({
            type: impl.segment_name || campaignType,
            id: impl.id,
            name: impl.segment_name || `Segment ${impl.id}`,
            subject: impl.actions?.[0]?.message_subject || "",
            message: impl.actions?.[0]?.message_body || "",
            segment_id: `segment_${impl.id}`,
            language: "en",
            parent_age: 0,
            parent_gender: "",
            baby_count: 0,
            baby_age_week_1: 0,
            event_count: 0,
            engagement_propensity: 0,
            price_sensitivity: 0,
            brand_loyalty: 0,
            contact_frequency_tolerance: 0,
            content_engagement_rate: 0,
            prefers_email: false,
            prefers_push: false,
            prefers_inapp: false,
            values_family: 0,
            values_eco_conscious: 0,
            values_convenience: 0,
            values_quality: 0,
          }));
          console.log('Mapped segments:', mappedSegments);
          setSegments(mappedSegments);
        } else {
          console.log('No implementations found or empty array');
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      } finally {
        setLoading(false);
        console.log('=== Finished fetchCampaignData ===');
      }
    };

    fetchCampaignData();
  }, [canvasId, campaignType]);

  const selectSegment = async (segment: Segment) => {
    setSelectedSegment(segment);
    setLoading(true);
    try {
      if (!campaignData) return;

      // Find the implementation for this segment
      const implementation = campaignData.implementations?.find(impl => impl.id === segment.id);

      if (implementation?.actions) {
        // Convert actions to canvas format for display
        const canvas: Canvas = {
          name: campaignName,
          created_at: campaignData.created_at || "",
          updated_at: campaignData.updated_at || "",
          description: "",
          draft: false,
          enabled: true,
          variants: [{ name: "Variant 1" }],
          steps: implementation.actions.map((action, index) => ({
            name: `Step ${index + 1}`,
            type: "message",
            channels: [action.channel],
            messages: {
              [action.channel]: {
                channel: action.channel,
                subject: action.message_subject,
                body: action.message_body,
                message: action.message_body,
                day_of_campaign: action.day_of_campaign,
              }
            }
          }))
        };
        setCanvases([canvas]);
      }
    } catch (error) {
      console.error("Error fetching segment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCampaigns = () => {
    navigate("/");
  };

  const handleBackToSegments = () => {
    setSelectedSegment(null);
    setSelectedMessageKey(null);
  };

  const handleSendCampaign = async () => {
    if (!campaignData?.canvas_id) {
      alert('No canvas ID found for this campaign');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://localhost:3000/api/braze/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignData.canvas_id,
          broadcast: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send campaign');
      }

      const result = await response.json();
      alert('Campaign sent successfully!');
      console.log('Send result:', result);
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!canvasId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-500">Invalid campaign ID</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
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
          <div className="flex flex-col items-center justify-center h-full gap-6 w-full">
            <SpotlightCard
              className="flex flex-col items-center justify-center custom-spotlight-card w-[1000px] max-w-full"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              {loading && segments.length === 0 ? (
                <div className="text-neutral-400 p-8">Loading campaign data...</div>
              ) : !selectedSegment ? (
                <SegmentList
                  segments={segments}
                  loading={loading}
                  campaignType={campaignType}
                  canvasName={campaignName}
                  onBack={handleBackToCampaigns}
                  onSegmentSelect={selectSegment}
                />
              ) : (
                <div className="w-full h-[70vh] flex flex-col md:flex-row gap-4">
                  <MessageListPanel
                    allMessages={allMessages}
                    selectedMessageKey={selectedMessageKey}
                    loading={loading}
                    segmentName={selectedSegment.name}
                    campaignType={campaignType}
                    onBack={handleBackToSegments}
                    onMessageSelect={setSelectedMessageKey}
                  />
                  <div className="w-full md:w-[65%] bg-neutral-900 flex flex-col overflow-hidden">
                    {loading ? (
                      <div className="flex-1 flex items-center justify-center text-neutral-400">
                      </div>
                    ) : selectedMessage ? (
                      <div className="flex-1 overflow-y-auto h-full flex flex-col">
                        <div className="p-4 border-b border-neutral-700 bg-neutral-800 flex justify-between items-center">
                          <div className="text-sm text-neutral-400">
                            Day of Campaign: <span className="text-neutral-200 font-medium">
                              {selectedMessage.day_of_campaign ? new Date(selectedMessage.day_of_campaign).toLocaleDateString() : 'Not set'}
                            </span>
                          </div>
                          <button
                            onClick={handleSendCampaign}
                            disabled={sending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {sending ? 'Sending...' : 'Send Campaign'}
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          <MessagePreview message={selectedMessage} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-neutral-400">
                        Select a message to view details
                      </div>
                    )}
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};
