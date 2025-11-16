import SpotlightCard from "@/components/SpotlightCard";

export const MyCampaigns = () => {
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
        <div className="flex flex-wrap gap-4 justify-between w-full pl-4 pr-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                    key={i}
                    className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-lg p-6 w-50 h-50 flex flex-col items-center justify-center transition-colors"
                >
                    <p className="text-lg font-semibold">Campaign {i}</p>
                    <p className="text-sm text-gray-400 mt-2">View details</p>
                </div>
            ))}
        </div>
      </SpotlightCard>
    </div>
  );
};
