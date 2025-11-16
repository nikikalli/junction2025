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
      <DialogContent className="w-full max-w-md bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-sm text-zinc-400 font-bold">
            {campaignName}
          </DialogTitle>
          <DialogTitle className="text-2xl text-gray-100">Audience</DialogTitle>
        </DialogHeader>
        <p className="text-gray-400">Type</p>
        <div className="flex flex-row gap-3">
          <button
            onClick={() => onTypeChange("Standard")}
            className={`px-4 py-3 rounded-lg border-2 font-medium text-gray-200 hover:bg-gray-700 ${
              selectedType === "Standard"
                ? "border-purple-500"
                : "border-gray-300"
            }`}
          >
            Standard Campaign
          </button>
          <button
            onClick={() => onTypeChange("Promotional")}
            className={`px-4 py-3 rounded-lg border-2 font-medium text-gray-200 hover:bg-gray-700 ${
              selectedType === "Promotional"
                ? "border-purple-500"
                : "border-gray-300"
            }`}
          >
            Promotional Campaign
          </button>
        </div>
        <div className="flex flex-col items-start sm:flex-row text-left justify-between gap-3">
          <p className="text-gray-400">Baby Age</p>
          <div className="flex gap-3  text-gray-400 items-center">
            <Input className="flex-1 min-w-0" placeholder="min" />
            -
            <Input className="flex-1 min-w-0" placeholder="max" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start text-left justify-between gap-3">
          <p className="text-gray-400">Mother Age</p>
          <div className="flex gap-3  text-gray-400 items-center">
            <Input className="flex-1 min-w-0" placeholder="min" />
            -
            <Input className="flex-1 min-w-0" placeholder="max" />
          </div>
        </div>
        <Button
          className="bg-gray-600 hover:bg-gray-700"
          onClick={() => onConfirm(selectedType)}
        >
          Next
        </Button>
      </DialogContent>
    </Dialog>
  );
};
