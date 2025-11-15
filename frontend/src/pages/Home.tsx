import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { InputWithButton } from "@/components/InputWithButton";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

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
  if (message.channel === "email" && message.body) {
    return (
      <div className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800">
        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-600 text-sm">
          <strong className="text-neutral-100">Subject:</strong>
          <span className="text-neutral-300 ml-2">
            {message.subject || "No subject"}
          </span>
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

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [canvasList, setCanvasList] = useState<CanvasList[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignTypes, setCampaignTypes] = useState<
    Record<string, "Standard" | "Promotional">
  >({});
  const [selectedCampaignType, setSelectedCampaignType] = useState<
    "Standard" | "Promotional"
  >("Standard");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingCanvasId, setPendingCanvasId] = useState<string | null>(null);
  const [pendingCanvasName, setPendingCanvasName] = useState<string | null>(
    null
  );
  const count = 20;

  useEffect(() => {
    const fetchCanvasList = async () => {
      setLoadingList(true);
      try {
        const res = await fetch("http://localhost:3000/api/braze/canvas/list");
        const data = await res.json();
        const list =
          data.canvases?.map((c: any) => ({ id: c.id, name: c.name })) || [];
        setCanvasList(list);
        const initialTypes = list.reduce(
          (acc: Record<string, "Standard" | "Promotional">, c: CanvasList) => {
            acc[c.id] = "Standard";
            return acc;
          },
          {}
        );
        setCampaignTypes(initialTypes);
      } catch (err) {
        console.error("Error fetching canvas list:", err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchCanvasList();
  }, []);

  const filteredCanvasList = canvasList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const selectCampaign = async (
    canvasId: string,
    campaignType: "Standard" | "Promotional"
  ) => {
    setSelectedCanvasId(canvasId);
    setSelectedSegment(null);
    setCanvases([]);
    setSelectedCampaignType(campaignType);
    setDialogOpen(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/campaigns/analyzedSegments?count=20"
      );
      const data = await response.json();
      const mappedSegments: Segment[] = data.segments.map(
        (seg: any, index: number) => ({
          ...seg,
          id: index + 1,
          name: seg.segment_id,
          type: campaignType,
        })
      );
      setSegments(mappedSegments);
    } catch (error) {
      console.error("Error fetching analyzed segments:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCampaignDialog = (canvasId: string, canvasName: string) => {
    setPendingCanvasId(canvasId);
    setPendingCanvasName(canvasName);
    setDialogOpen(true);
  };

  const confirmCampaignType = (type: "Standard" | "Promotional") => {
    if (pendingCanvasId) {
      selectCampaign(pendingCanvasId, type);
    }
  };

  const selectSegment = async (segment: Segment) => {
    setSelectedSegment(segment);
    setLoading(true);
    try {
      if (!selectedCanvasId) return;
      const response = await fetch(
        `http://localhost:3000/api/campaigns/generate/${selectedCanvasId}?count=${count}`
      );
      const data = await response.json();
      const segmentCanvas = data.canvases?.[segment.id - 1];
      setCanvases(segmentCanvas ? [segmentCanvas] : []);
    } catch (error) {
      console.error("Error fetching canvases:", error);
    } finally {
      setLoading(false);
    }
  };

  const backToCampaigns = () => {
    setSelectedCanvasId(null);
    setSelectedSegment(null);
    setCanvases([]);
    setSearchTerm("");
  };

  const backToSegments = () => {
    setSelectedSegment(null);
    setCanvases([]);
  };

  const toggleSegmentSelection = (segmentId: number) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );
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
          <div className="flex flex-col items-center justify-center h-full gap-6 w-full px-4">
            {!selectedCanvasId && (
              <>
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
              </>
            )}
            <SpotlightCard
              className="flex flex-col items-center justify-center custom-spotlight-card w-[1000px] max-w-full"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              {!selectedCanvasId ? (
                <div className="relative w-full flex flex-col justify-center">
                  <InputWithButton
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSubmit={() => {
                      if (filteredCanvasList.length === 1) {
                        const currentType =
                          campaignTypes[filteredCanvasList[0].id] ?? "Standard";
                        selectCampaign(filteredCanvasList[0].id, currentType);
                      }
                    }}
                  />

                  {searchTerm.trim() !== "" && (
                    <div
                      className="absolute mt-2 top-full w-full bg-white text-black rounded shadow-lg overflow-visible z-20"
                      style={{ minWidth: "500px" }}
                    >
                      {loadingList ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Loading...
                        </div>
                      ) : filteredCanvasList.length > 0 ? (
                        filteredCanvasList.slice(0, 6).map((c) => (
                          <div
                            key={c.id}
                            className="px-3 py-3 border-b hover:bg-gray-50"
                          >
                            <div
                              className="flex items-center justify-between gap-3"
                              onClick={() => openCampaignDialog(c.id, c.name)}
                            >
                              <span className="text-sm text-gray-700 truncate">
                                {c.name}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : !selectedSegment ? (
                <div className="w-full bg-neutral-900 rounded-lg overflow-y-auto max-h-[70vh]">
                  <div className="flex flex-col mb-6 gap-3">
                    <Button
                      onClick={backToCampaigns}
                      variant="ghost"
                      className="text-neutral-400 hover:text-neutral-200 p-0 h-auto font-medium text-sm"
                    >
                      ← Back
                    </Button>
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Campaign Name: {pendingCanvasName}
                    </h3>
                    <p className="text-lg  text-gray-400">
                      {selectedCampaignType}
                    </p>
                  </div>

                  {loading ? (
                    <div className="text-center py-6 text-neutral-400">
                      Loading segments...
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          onClick={() => toggleSegmentSelection(segment.id)}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            selectedSegments.includes(segment.id)
                              ? "border-purple-500 bg-neutral-800"
                              : "border-neutral-700 bg-neutral-850 hover:border-neutral-600"
                          }`}
                        >
                          <div
                            className="flex items-start gap-3"
                            onClick={() => selectSegment(segment)}
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-neutral-100 mb-2">
                                {segment.name}
                              </h4>
                              <div className="space-y-1 text-xs text-neutral-400">
                                <div className="flex justify-between">
                                  <span>Age:</span>
                                  <span className="text-neutral-200">
                                    {segment.parent_age}y
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Engagement:</span>
                                  <span className="text-neutral-200">
                                    {segment.engagement_propensity}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full bg-neutral-900 rounded-lg p-6 max-h-[70vh] overflow-y-auto border border-neutral-800">
                  <div className="mb-6 flex items-center gap-3">
                    <Button
                      onClick={backToSegments}
                      variant="ghost"
                      className="text-neutral-400 hover:text-neutral-200 p-0 h-auto font-medium text-sm"
                    >
                      ← Back
                    </Button>
                    <h3 className="text-lg font-semibold text-neutral-100">
                      {selectedSegment.name} - Campaign Copy
                    </h3>
                  </div>

                  {loading ? (
                    <div className="text-center py-6 text-neutral-400">
                      Loading campaign copy...
                    </div>
                  ) : canvases.length > 0 ? (
                    <div className="space-y-4">
                      {canvases.map((canvas, index) => {
                        const allMessages: CanvasMessage[] = [];
                        canvas.steps.forEach((step) => {
                          if (step.messages) {
                            Object.values(step.messages).forEach((msg) =>
                              allMessages.push(msg)
                            );
                          }
                        });

                        return (
                          <div
                            key={index}
                            className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden"
                          >
                            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-5">
                              <h4 className="font-bold text-lg">
                                {canvas.name}
                              </h4>
                              {canvas.country && (
                                <p className="text-xs opacity-80 mt-1">
                                  Country: {canvas.country}
                                </p>
                              )}
                            </div>

                            <div className="p-5">
                              <div className="flex gap-2 mb-4 text-xs flex-wrap">
                                <span
                                  className={`px-2.5 py-1 rounded-md font-medium ${
                                    canvas.draft
                                      ? "bg-neutral-700 text-neutral-300"
                                      : "bg-green-900 text-green-200"
                                  }`}
                                >
                                  {canvas.draft ? "Draft" : "Active"}
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-blue-900 text-blue-200 font-medium">
                                  {canvas.variants?.length || 0} variants
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-purple-900 text-purple-200 font-medium">
                                  {canvas.steps?.length || 0} steps
                                </span>
                              </div>

                              {allMessages.length > 0 ? (
                                <div className="space-y-4">
                                  <h5 className="font-semibold text-sm text-neutral-100">
                                    Messages
                                  </h5>
                                  {allMessages.map((message, msgIndex) => (
                                    <div key={msgIndex} className="text-sm">
                                      <MessagePreview message={message} />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-neutral-400">
                                  No messages configured
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-neutral-400">
                      No campaign copy available
                    </div>
                  )}
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Audience</DialogTitle>
          </DialogHeader>
          <p>
            Select Campaign Type for{" "}
            <span className="font-bold">{pendingCanvasName}</span>
          </p>
          <div className="flex flex-row gap-3">
            <button
              onClick={() => setSelectedCampaignType("Standard")}
              className={`px-4 py-3 rounded-lg border-2 font-medium hover:bg-blue-100 ${
                selectedCampaignType === "Standard"
                  ? "border-purple-500"
                  : "border-gray-300"
              }`}
            >
              Standard Campaign
            </button>
            <button
              onClick={() => setSelectedCampaignType("Promotional")}
              className={`px-4 py-3 rounded-lg border-2 font-medium hover:bg-blue-100 ${
                selectedCampaignType === "Promotional"
                  ? "border-purple-500"
                  : "border-gray-300"
              }`}
            >
              Promotional Campaign
            </button>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <p>Baby Age</p>
            <div>
              <Input className="w-30" placeholder="min" />
              -
              <Input className="w-30" placeholder="max" />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <p>Mother Age</p>
            <div>
              <Input className="w-30" placeholder="min" />
              -
              <Input className="w-30" placeholder="max" />
            </div>
          </div>
          <Button onClick={() => confirmCampaignType(selectedCampaignType)}>
            Next
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
