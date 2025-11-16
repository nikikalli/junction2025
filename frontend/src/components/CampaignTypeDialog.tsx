import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AudienceSpecification } from "@/types/audience";
import { apiClient } from "@/services/api";

interface CampaignTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  selectedType: "Standard" | "Promotional";
  onTypeChange: (type: "Standard" | "Promotional") => void;
  onConfirm: (audienceSpec: AudienceSpecification) => void;
}

export const CampaignTypeDialog = ({
  isOpen,
  onOpenChange,
  campaignName,
  selectedType,
  onTypeChange,
  onConfirm,
}: CampaignTypeDialogProps) => {
  const [spec, setSpec] = useState<AudienceSpecification>({
    campaignType: selectedType,
    parentGender: "any",
  });
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSpec(prev => ({ ...prev, campaignType: selectedType }));
  }, [selectedType]);

  // Fetch matching segments count when spec changes
  useEffect(() => {
    const fetchMatchingSegments = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post<{ matchingSegments: number; totalSegments: number }>(
          '/segments/filter',
          spec
        );
        setMatchingCount(response.matchingSegments);
        setTotalCount(response.totalSegments);
      } catch (error) {
        console.error('Error fetching matching segments:', error);
        setMatchingCount(null);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchMatchingSegments();
    }
  }, [spec, isOpen]);

  const handleConfirm = () => {
    onConfirm(spec);
  };

  const updateSpec = (updates: Partial<AudienceSpecification>) => {
    setSpec(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-gray-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm text-zinc-400 font-bold">{campaignName}</DialogTitle>
            <DialogTitle className="text-2xl text-gray-100">Audience Specification</DialogTitle>
          </DialogHeader>

          {/* Campaign Type */}
          <div className="space-y-2">
            <p className="text-gray-400 font-medium">Campaign Type</p>
            <div className="flex flex-row gap-3">
              <button
                onClick={() => { onTypeChange("Standard"); updateSpec({ campaignType: "Standard" }); }}
                className={`px-4 py-3 rounded-lg border-2 font-medium text-gray-200 hover:bg-gray-700 transition ${
                  selectedType === "Standard" ? "border-purple-500 bg-gray-800" : "border-gray-600"
                }`}
              >
                Standard Campaign
              </button>
              <button
                onClick={() => { onTypeChange("Promotional"); updateSpec({ campaignType: "Promotional" }); }}
                className={`px-4 py-3 rounded-lg border-2 font-medium text-gray-200 hover:bg-gray-700 transition ${
                  selectedType === "Promotional" ? "border-purple-500 bg-gray-800" : "border-gray-600"
                }`}
              >
                Promotional Campaign
              </button>
            </div>
          </div>

          {/* Parent Demographics */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-200">Parent Demographics</h3>

            <div className="space-y-2">
              <p className="text-gray-400">Parent Gender</p>
              <div className="flex gap-2">
                {["any", "F", "M", "other"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => updateSpec({ parentGender: gender as any })}
                    className={`px-3 py-2 rounded-md border font-medium text-sm transition ${
                      spec.parentGender === gender
                        ? "border-purple-500 bg-purple-500/20 text-purple-200"
                        : "border-gray-600 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {gender === "any" ? "Any" : gender === "F" ? "Female" : gender === "M" ? "Male" : "Other"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Parent Age (years)</p>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  className="w-24 bg-gray-800 border-gray-600"
                  placeholder="Min"
                  value={spec.parentAgeMin || ""}
                  onChange={(e) => updateSpec({ parentAgeMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  className="w-24 bg-gray-800 border-gray-600"
                  placeholder="Max"
                  value={spec.parentAgeMax || ""}
                  onChange={(e) => updateSpec({ parentAgeMax: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>

          {/* Baby Information */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-200">Baby Information</h3>

            <div className="space-y-2">
              <p className="text-gray-400">Baby Age (weeks)</p>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  className="w-24 bg-gray-800 border-gray-600"
                  placeholder="Min"
                  value={spec.babyAgeWeeksMin || ""}
                  onChange={(e) => updateSpec({ babyAgeWeeksMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  className="w-24 bg-gray-800 border-gray-600"
                  placeholder="Max"
                  value={spec.babyAgeWeeksMax || ""}
                  onChange={(e) => updateSpec({ babyAgeWeeksMax: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Baby Count</p>
              <Input
                type="number"
                className="w-32 bg-gray-800 border-gray-600"
                placeholder="Any"
                value={spec.babyCount || ""}
                onChange={(e) => updateSpec({ babyCount: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Diaper Size</p>
              <Input
                className="w-48 bg-gray-800 border-gray-600"
                placeholder="e.g., Size 3, Newborn"
                value={spec.diaperSize || ""}
                onChange={(e) => updateSpec({ diaperSize: e.target.value || undefined })}
              />
            </div>
          </div>

          {/* Location & Language */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-200">Location & Language</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-400">Country</p>
                <Input
                  className="bg-gray-800 border-gray-600"
                  placeholder="e.g., US, UK"
                  value={spec.country || ""}
                  onChange={(e) => updateSpec({ country: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Language</p>
                <select
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                  value={spec.language || ""}
                  onChange={(e) => updateSpec({ language: e.target.value || undefined })}
                >
                  <option value="">Any</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Behavioral */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-200">Behavioral</h3>

            <div className="space-y-2">
              <p className="text-gray-400">Last Product Purchased</p>
              <Input
                className="bg-gray-800 border-gray-600"
                placeholder="Product name or category"
                value={spec.lastProductPurchased || ""}
                onChange={(e) => updateSpec({ lastProductPurchased: e.target.value || undefined })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Engagement Propensity (%)</p>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  className="w-24 bg-gray-800 border-gray-600"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={spec.engagementMin || ""}
                  onChange={(e) => updateSpec({ engagementMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  className="w-24 bg-gray-800 border-gray-600"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={spec.engagementMax || ""}
                  onChange={(e) => updateSpec({ engagementMax: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>

          {/* Matching Segments Display */}
          <div className="border-t border-gray-700 pt-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Matching Segments:</span>
                <span className="text-2xl font-bold text-purple-400">
                  {loading ? "..." : matchingCount !== null ? `${matchingCount} / ${totalCount}` : "--"}
                </span>
              </div>
              {matchingCount === 0 && !loading && (
                <p className="text-sm text-yellow-400 mt-2">No segments match these criteria. Try adjusting your filters.</p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            onClick={handleConfirm}
            disabled={loading || matchingCount === 0}
          >
            Create Campaign {matchingCount !== null && matchingCount > 0 ? `(${matchingCount} segments)` : ""}
          </Button>
        </DialogContent>
      </Dialog>
  );
};
