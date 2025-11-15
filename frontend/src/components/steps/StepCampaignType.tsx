import { Button } from "@/components/ui/button";
import type { CampaignType } from "@/types/campaign";

interface StepCampaignTypeProps {
  selectedType: CampaignType | null;
  onTypeSelect: (type: CampaignType) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepCampaignType({
  selectedType,
  onTypeSelect,
  onNext,
  onBack,
}: StepCampaignTypeProps) {
  const campaignTypes: Array<{ value: CampaignType; label: string; description: string }> = [
    {
      value: "standard",
      label: "Standard Campaign",
      description: "Regular marketing campaign with standard messaging",
    },
    {
      value: "promotional",
      label: "Promotional Campaign",
      description: "Time-limited promotion with special offers or incentives",
    },
  ];

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Campaign Type</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {campaignTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeSelect(type.value)}
            className={`p-4 border-2 rounded-lg transition-all text-left ${
              selectedType === type.value
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-gray-600 hover:border-gray-400 bg-gray-800/30"
            }`}
          >
            <h3 className="font-semibold text-lg mb-2">{type.label}</h3>
            <p className="text-sm text-gray-300">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedType}
          className="min-w-32"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
