import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { useCampaignSearch } from "@/hooks/useCampaignSearch";
import { useCampaignTypeDialog } from "@/hooks/useCampaignTypeDialog";
import { CampaignSearch } from "@/components/CampaignSearch";
import { CampaignTypeDialog } from "@/components/CampaignTypeDialog";
import type { Campaign } from "@/types";
import { MyCampaigns } from "@/components/MyCampaigns";
import { campaignsApi } from "@/services/campaigns.api";

export const Home = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignType, setSelectedCampaignType] = useState<
    "Standard" | "Promotional"
  >("Standard");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await campaignsApi.getAllCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  });

  const { searchTerm, setSearchTerm, filteredCanvasList, loadingList } =
    useCampaignSearch();

  const {
    dialogOpen,
    setDialogOpen,
    pendingCanvasName,
    openCampaignDialog,
    confirmCampaignType,
  } = useCampaignTypeDialog(async (canvasId, type) => {
    try {
      // Create campaign from canvas with the selected audience type
      const newCampaign = await campaignsApi.createCampaignFromCanvas(
        canvasId,
        pendingCanvasName || 'New Campaign',
        [{ segment_name: type }] // type is "Standard" or "Promotional"
      );

      // Refresh campaigns list
      const updatedCampaigns = await campaignsApi.getAllCampaigns();
      setCampaigns(updatedCampaigns);

      // Navigate to the new campaign's segments page
      navigate(`/segments/${newCampaign.id}?type=${type}`);
    } catch (error) {
      console.error('Error creating campaign from canvas:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setDialogOpen(false);
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section with Fixed Height */}
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 w-full px-4">
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
          <SpotlightCard
            className="flex flex-col items-center justify-center custom-spotlight-card w-[1000px] max-w-full"
            spotlightColor="rgba(0, 229, 255, 0.2)"
          >
            <CampaignSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filteredCanvasList={filteredCanvasList}
              loadingList={loadingList}
              onCampaignSelect={openCampaignDialog}
            />
          </SpotlightCard>
        </div>
      </div>

      {/* Scrollable Campaigns Section */}
      <div className="w-full bg-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <MyCampaigns campaigns={campaigns} />
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
