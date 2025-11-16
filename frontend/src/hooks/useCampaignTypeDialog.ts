import { useState } from "react";

interface UseCampaignTypeDialogReturn {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  pendingCanvasId: string | null;
  pendingCanvasName: string | null;
  selectedCampaignType: "Standard" | "Promotional";
  setSelectedCampaignType: (type: "Standard" | "Promotional") => void;
  openCampaignDialog: (canvasId: string, canvasName: string) => void;
  confirmCampaignType: (
    type: "Standard" | "Promotional"
  ) => { canvasId: string; type: "Standard" | "Promotional" } | null;
}

export const useCampaignTypeDialog = (
  onCampaignSelected: (
    canvasId: string,
    campaignType: "Standard" | "Promotional"
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

  const confirmCampaignType = (type: "Standard" | "Promotional") => {
    if (pendingCanvasId) {
      onCampaignSelected(pendingCanvasId, type);
      setDialogOpen(false);
      return { canvasId: pendingCanvasId, type };
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
