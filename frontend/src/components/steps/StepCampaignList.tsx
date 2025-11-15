import { Button } from "@/components/ui/button";
import type { Campaign } from "@/types/campaign";

interface StepCampaignListProps {
  campaigns: Campaign[];
  onActivateCampaign: (campaignId: string) => Promise<void>;
  onReset: () => void;
  loading: boolean;
  error: string | null;
}

export default function StepCampaignList({
  campaigns,
  onActivateCampaign,
  onReset,
  loading,
  error,
}: StepCampaignListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "draft":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "paused":
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Campaigns</h2>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No campaigns created yet</p>
          <Button onClick={onReset} variant="outline">
            Create New Campaign
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Canvas ID: <span className="font-mono">{campaign.brazeCanvasId}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        {campaign.type}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        {campaign.segments.length} segment{campaign.segments.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {campaign.status === "draft" && (
                    <Button
                      onClick={() => onActivateCampaign(campaign.id)}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      {loading ? "Activating..." : "Activate"}
                    </Button>
                  )}
                  {campaign.status === "active" && (
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onReset}>
              Create New Campaign
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
