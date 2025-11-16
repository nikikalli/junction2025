import { useState } from "react";
import { AudienceSpecification } from "@/types/audience";

interface UseCampaignTypeDialogReturn {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  pendingCanvasId: string | null;
  pendingCanvasName: string | null;
  selectedCampaignType: "Standard" | "Promotional";
  setSelectedCampaignType: (type: "Standard" | "Promotional") => void;
  openCampaignDialog: (canvasId: string, canvasName: string) => void;
  confirmCampaignType: (
    audienceSpec: AudienceSpecification
  ) => { canvasId: string; audienceSpec: AudienceSpecification } | null;
}

export const useCampaignTypeDialog = (
  onCampaignSelected: (
    canvasId: string,
    audienceSpec: AudienceSpecification
  ) => void
): UseCampaignTypeDialogReturn => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingCanvasId, setPendingCanvasId] = useState<string | null>(null);
  const [pendingCanvasName, setPendingCanvasName] = useState<string | null>(
    null
  );
  const [selectedCampaignType, setSelectedCampaignType] = useState<
    "Standard" | "Promotional"
  >("Standard");

  const openCampaignDialog = (canvasId: string, canvasName: string) => {
    setPendingCanvasId(canvasId);
    setPendingCanvasName(canvasName);
    setDialogOpen(true);
  };

  const confirmCampaignType = (audienceSpec: AudienceSpecification) => {
    if (pendingCanvasId) {
      onCampaignSelected(pendingCanvasId, audienceSpec);
      setDialogOpen(false);
      return { canvasId: pendingCanvasId, audienceSpec };
    }
    return null;
  };

  return {
    dialogOpen,
    setDialogOpen,
    pendingCanvasId,
    pendingCanvasName,
    selectedCampaignType,
    setSelectedCampaignType,
    openCampaignDialog,
    confirmCampaignType,
  };
};
