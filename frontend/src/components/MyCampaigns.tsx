import { useEffect, useState } from "react";
import SpotlightCard from "@/components/SpotlightCard";
import { campaignsApi } from "@/services/campaigns.api";
import type { Campaign } from "@/types/campaigns";

export const MyCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    campaignsApi.getAllCampaigns().then(setCampaigns);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 w-full px-4 mb-2">
      <SpotlightCard
        className="flex flex-col items-center h-full custom-spotlight-card w-[1000px] max-w-full gap-3"
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <h1 className="text-2xl font-bold mt-3">My Campaigns</h1>
        <p className="text-1xl md:text-1.5xl text-gray-400">
          Manage and track your campaigns here.
        </p>

        {!campaigns && (
          <div className="text-gray-400 py-8">Loading campaigns...</div>
        )}

        {campaigns && campaigns.length === 0 && (
          <div className="text-gray-400 py-8">No campaigns found</div>
        )}

        {campaigns && campaigns.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-between w-full pl-4 pr-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-lg p-6 w-50 h-50 flex flex-col items-center justify-center transition-colors"
              >
                <p className="text-lg font-semibold">{campaign.name}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start: {new Date(campaign.start_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </SpotlightCard>
    </div>
  );
};
