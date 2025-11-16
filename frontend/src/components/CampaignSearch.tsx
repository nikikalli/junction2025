import { InputWithButton } from "@/components/InputWithButton";
import { CanvasList } from "@/types";

interface CampaignSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredCanvasList: CanvasList[];
  loadingList: boolean;
  onCampaignSelect: (canvasId: string, canvasName: string) => void;
}

export const CampaignSearch = ({
  searchTerm,
  onSearchChange,
  filteredCanvasList,
  loadingList,
  onCampaignSelect,
}: CampaignSearchProps) => {
  return (
    <div className="relative w-full flex flex-col justify-center">
      <InputWithButton
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onSubmit={() => {
          if (filteredCanvasList.length === 1) {
            onCampaignSelect(filteredCanvasList[0].id, filteredCanvasList[0].name);
          }
        }}
      />

      {searchTerm.trim() !== "" && (
        <div
          className="absolute mt-2 top-full w-full bg-neutral-900 text-zinc-400 rounded overflow-visible z-20"
        >
          {loadingList ? (
            <div className="px-3 py-2 text-sm">Loading...</div>
          ) : filteredCanvasList.length > 0 ? (
            filteredCanvasList.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="px-3 py-3 hover:bg-gray-700"
                onClick={() => onCampaignSelect(c.id, c.name)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm truncate">
                    {c.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm">No results</div>
          )}
        </div>
      )}
    </div>
  );
};
