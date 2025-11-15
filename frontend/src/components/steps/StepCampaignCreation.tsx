import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampaignType, SegmentSelectionMode } from "@/types/campaign";

interface CampaignData {
  name: string;
  toneOfVoice?: string;
}

interface StepCampaignCreationProps {
  canvasId: string;
  campaignType: CampaignType;
  selectedSegments: string[];
  selectionMode: SegmentSelectionMode;
  onCampaignCreate: (data: CampaignData) => Promise<void>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export default function StepCampaignCreation({
  canvasId,
  campaignType,
  selectedSegments,
  selectionMode,
  onCampaignCreate,
  loading,
  error,
  onBack,
}: StepCampaignCreationProps) {
  const [campaignName, setCampaignName] = useState<string>("");
  const [toneOfVoice, setToneOfVoice] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "urgent", label: "Urgent" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!campaignName.trim()) {
      setFormError("Campaign name is required");
      return;
    }

    try {
      await onCampaignCreate({
        name: campaignName.trim(),
        toneOfVoice: toneOfVoice || undefined,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create campaign");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Campaign</h2>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded">
        <h3 className="font-semibold mb-3">Campaign Configuration</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-400">Canvas ID:</span> <span className="font-mono">{canvasId}</span>
          </p>
          <p>
            <span className="text-gray-400">Type:</span>{" "}
            <span className="capitalize">{campaignType}</span>
          </p>
          <p>
            <span className="text-gray-400">Segments:</span>{" "}
            <span>{selectedSegments.length} selected (via {selectionMode})</span>
          </p>
        </div>
      </div>

      {/* Campaign Name */}
      <div className="mb-4">
        <label htmlFor="campaign-name" className="block text-sm font-medium mb-2">
          Campaign Name *
        </label>
        <Input
          id="campaign-name"
          type="text"
          placeholder="e.g., Summer Sale 2024"
          value={campaignName}
          onChange={(e) => {
            setCampaignName(e.target.value);
            setFormError(null);
          }}
          disabled={loading}
          className="w-full"
        />
      </div>

      {/* Tone of Voice */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Tone of Voice (Optional)</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {toneOptions.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => setToneOfVoice(tone.value)}
              disabled={loading}
              className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                toneOfVoice === tone.value
                  ? "bg-cyan-500 text-black"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              } disabled:opacity-50`}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {(formError || error) && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded">
          <p className="text-red-400 text-sm">{formError || error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading || !campaignName.trim()}
          className="min-w-32"
        >
          {loading ? "Creating..." : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
}
