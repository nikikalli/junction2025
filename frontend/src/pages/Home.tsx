import { useState } from "react";
import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import StepCanvasInput from "@/components/steps/StepCanvasInput";
import StepCampaignType from "@/components/steps/StepCampaignType";
import StepSegmentSelection from "@/components/steps/StepSegmentSelection";
import StepCampaignCreation from "@/components/steps/StepCampaignCreation";
import StepCampaignList from "@/components/steps/StepCampaignList";
import { Nav } from "@/components/Nav";

import type {
  CampaignStep,
  CampaignType,
  SegmentSelectionMode,
  Campaign,
} from "@/types/campaign";

export const Home = () => {
  const [currentStep, setCurrentStep] =
    useState<CampaignStep>("canvas-id-input");
  const [canvasId, setCanvasId] = useState<string>("");
  const [campaignType, setCampaignType] = useState<CampaignType | null>(null);
  const [selectionMode, setSelectionMode] =
    useState<SegmentSelectionMode | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Step navigation
  const nextStep = () => {
    const steps: CampaignStep[] = [
      "canvas-id-input",
      "campaign-type-selection",
      "segment-selection",
      "campaign-creation",
      "campaign-list",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setError(null);
    }
  };

  const previousStep = () => {
    const steps: CampaignStep[] = [
      "canvas-id-input",
      "campaign-type-selection",
      "segment-selection",
      "campaign-creation",
      "campaign-list",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "canvas-id-input":
        return (
          <>
            <StepCanvasInput
              canvasId={canvasId}
              onCanvasIdChange={setCanvasId}
              onSubmit={async () => {
                setLoading(true);
                setError(null);
                try {
                  // Simulate API call to fetch canvas
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  nextStep();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Failed to load canvas"
                  );
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              error={error}
            />
          </>
        );

      case "campaign-type-selection":
        return (
          <StepCampaignType
            selectedType={campaignType}
            onTypeSelect={(type: CampaignType) => {
              setCampaignType(type);
            }}
            onNext={nextStep}
            onBack={previousStep}
          />
        );

      case "segment-selection":
        return (
          <StepSegmentSelection
            selectedSegments={selectedSegments}
            selectionMode={selectionMode}
            onSegmentSelect={(segments: string[]) => {
              setSelectedSegments(segments);
            }}
            onModeSelect={(mode: SegmentSelectionMode) => {
              setSelectionMode(mode);
            }}
            onNext={nextStep}
            onBack={previousStep}
          />
        );

      case "campaign-creation":
        return (
          <StepCampaignCreation
            canvasId={canvasId}
            campaignType={campaignType!}
            selectedSegments={selectedSegments}
            selectionMode={selectionMode!}
            onCampaignCreate={async (campaignData) => {
              setLoading(true);
              setError(null);
              try {
                // Simulate API call to create campaign
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const newCampaign: Campaign = {
                  id: `campaign-${Date.now()}`,
                  name: campaignData.name,
                  brazeCanvasId: canvasId,
                  status: "draft",
                  type: campaignType!,
                  segments: selectedSegments.map((id) => ({
                    id,
                    name: `Segment ${id}`,
                  })),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  toneOfVoice: campaignData.toneOfVoice,
                };
                setCampaigns([newCampaign, ...campaigns]);
                nextStep();
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to create campaign"
                );
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            error={error}
            onBack={previousStep}
          />
        );

      case "campaign-list":
        return (
          <StepCampaignList
            campaigns={campaigns}
            onActivateCampaign={async (campaignId: string) => {
              setLoading(true);
              setError(null);
              try {
                // Simulate API call to activate campaign
                await new Promise((resolve) => setTimeout(resolve, 500));
                setCampaigns(
                  campaigns.map((c) =>
                    c.id === campaignId
                      ? { ...c, status: "active" as const }
                      : c
                  )
                );
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to activate campaign"
                );
              } finally {
                setLoading(false);
              }
            }}
            onReset={() => {
              // Reset wizard state
              setCurrentStep("canvas-id-input");
              setCanvasId("");
              setCampaignType(null);
              setSelectionMode(null);
              setSelectedSegments([]);
              setError(null);
            }}
            loading={loading}
            error={error}
          />
        );

      default:
        return null;
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start">
          <Nav />
          <div className="flex flex-col items-center justify-center flex-1 gap-4 w-full">
            <TextType
              className="text-2xl md:text-4xl font-bold"
              text={["One manager, a thousand campaigns"]}
              typingSpeed={75}
              reverseMode={false}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="_"
            />
            <p className="text-1xl md:text-2xl text-gray-500">
              Turn assets into campaigns with one click
            </p>
            <SpotlightCard
              className="flex flex-col items-center justify-center custom-spotlight- mt-4 w-200"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              {renderStepContent()}
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};
