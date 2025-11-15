import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CampaignTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  selectedType: "Standard" | "Promotional";
  onTypeChange: (type: "Standard" | "Promotional") => void;
  onConfirm: (type: "Standard" | "Promotional") => void;
}

export const CampaignTypeDialog = ({
  isOpen,
  onOpenChange,
  campaignName,
  selectedType,
  onTypeChange,
  onConfirm,
}: CampaignTypeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Audience</DialogTitle>
        </DialogHeader>
        <p>
          Select Campaign Type for <span className="font-bold">{campaignName}</span>
        </p>
        <div className="flex flex-row gap-3">
          <button
            onClick={() => onTypeChange("Standard")}
            className={`px-4 py-3 rounded-lg border-2 font-medium hover:bg-blue-100 ${
              selectedType === "Standard"
                ? "border-purple-500"
                : "border-gray-300"
            }`}
          >
            Standard Campaign
          </button>
          <button
            onClick={() => onTypeChange("Promotional")}
            className={`px-4 py-3 rounded-lg border-2 font-medium hover:bg-blue-100 ${
              selectedType === "Promotional"
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
        <Button onClick={() => onConfirm(selectedType)}>Next</Button>
      </DialogContent>
    </Dialog>
  );
};
