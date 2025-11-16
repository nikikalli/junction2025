import { useState } from "react";
import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { Nav } from "@/components/Nav";
import { useCampaignSearch } from "@/hooks/useCampaignSearch";
import { useSegmentSelection } from "@/hooks/useSegmentSelection";
import { useCanvasMessages } from "@/hooks/useCanvasMessages";
import { useCampaignTypeDialog } from "@/hooks/useCampaignTypeDialog";
import { CampaignSearch } from "@/components/CampaignSearch";
import { SegmentList } from "@/components/SegmentList";
import { MessageListPanel } from "@/components/MessageListPanel";
import { CampaignTypeDialog } from "@/components/CampaignTypeDialog";
import type { CanvasMessage } from "@/types";
import { MyCampaigns } from "@/components/MyCampaigns";

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

export const Home = () => {
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedCampaignType, setSelectedCampaignType] = useState<
    "Standard" | "Promotional"
  >("Standard");

  const { searchTerm, setSearchTerm, filteredCanvasList, loadingList } =
    useCampaignSearch();

  const {
    selectedSegment,
    setSelectedSegment,
    segments,
    canvases,
    loading: segmentLoading,
    selectSegment,
  } = useSegmentSelection(selectedCanvasId, selectedCampaignType);

  const { selectedMessageKey, setSelectedMessageKey, allMessages, selectedMessage } =
    useCanvasMessages(canvases);

  const {
    dialogOpen,
    setDialogOpen,
    pendingCanvasName,
    openCampaignDialog,
    confirmCampaignType,
  } = useCampaignTypeDialog((canvasId, type) => {
    setSelectedCanvasId(canvasId);
    setSelectedSegment(null);
    setSelectedCampaignType(type);
    setDialogOpen(false);
  });

  const handleBackToCampaigns = () => {
    setSelectedCanvasId(null);
    setSelectedSegment(null);
    setSearchTerm("");
    setSelectedMessageKey(null);
  };

  const handleBackToSegments = () => {
    setSelectedSegment(null);
    setSelectedMessageKey(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div style={{ width: "100%", height: "130vh", position: "relative" }}>
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
          <div className="flex flex-col items-center justify-center h-full gap-6 w-full">
            {!selectedCanvasId && (
              <>
                <TextType
                  className="text-2xl md:text-4xl font-bold text-center whitespace-nowrap"
                  text={["One vision, a thousand campaigns"]}
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
                <CampaignSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filteredCanvasList={filteredCanvasList}
                  loadingList={loadingList}
                  onCampaignSelect={openCampaignDialog}
                />
              ) : !selectedSegment ? (
                <SegmentList
                  segments={segments}
                  loading={segmentLoading}
                  campaignType={selectedCampaignType}
                  canvasName={pendingCanvasName || ""}
                  onBack={handleBackToCampaigns}
                  onSegmentSelect={selectSegment}
                />
              ) : (
                <div className="w-full h-[70vh] flex flex-col md:flex-row gap-4">
                  <MessageListPanel
                    allMessages={allMessages}
                    selectedMessageKey={selectedMessageKey}
                    loading={segmentLoading}
                    segmentName={selectedSegment.name}
                    campaignType={selectedCampaignType}
                    onBack={handleBackToSegments}
                    onMessageSelect={setSelectedMessageKey}
                  />
                  <div className="w-full md:w-[65%] bg-neutral-900 flex flex-col overflow-hidden">
                    {segmentLoading ? (
                      <div className="flex-1 flex items-center justify-center text-neutral-400">
                      </div>
                    ) : selectedMessage ? (
                      <div className="flex-1 overflow-y-auto h-full">
                        <MessagePreview message={selectedMessage} />
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
          <MyCampaigns campaigns={[]} />
        </div>
      </div>

      <CampaignTypeDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        campaignName={pendingCanvasName || ""}
        selectedType={selectedCampaignType}
        onTypeChange={setSelectedCampaignType}
        onConfirm={confirmCampaignType}
      />
    </div>
  );
};
