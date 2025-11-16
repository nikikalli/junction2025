import { Campaign } from "@/types";
import SpotlightCard from "@/components/SpotlightCard";

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

const CampaignCard = ({ campaign, onClick }: CampaignCardProps) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border-2 border-neutral-700 bg-neutral-850 hover:border-neutral-600 rounded-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-neutral-100 mb-2">
            {campaign.name}
          </h4>
          <div className="space-y-1 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Start Date:</span>
              <span className="text-neutral-200">
                {new Date(campaign.start_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyCampaigns = ({ campaigns }: { campaigns: Campaign[] }) => {
  return (
    <SpotlightCard>
      <div className="flex flex-col mb-6 gap-3">
        <h1 className="text-2xl font-bold mt-3 px-4">My Campaigns</h1>
        <p className="text-base text-gray-400 px-4">
          Manage and track your campaigns here.
        </p>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={() => {}}
          />
        ))}
      </div>
    </SpotlightCard>
  );
};
