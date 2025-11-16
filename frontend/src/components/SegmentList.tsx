import { Segment } from "@/types";
import { SegmentCard } from "@/components/SegmentCard";
import { HeaderWithBackButton } from "@/components/HeaderWithBackButton";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface SegmentListProps {
  segments: Segment[];
  loading: boolean;
  campaignType: "Awareness" | "Promotional";
  canvasName: string;
  onBack: () => void;
  onSegmentSelect: (segment: Segment) => void;
  onCampaignNameUpdate?: (newName: string) => void;
}

export const SegmentList = ({
  segments,
  loading,
  campaignType,
  canvasName,
  onBack,
  onSegmentSelect,
  onCampaignNameUpdate,
}: SegmentListProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(canvasName);

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== canvasName && onCampaignNameUpdate) {
      onCampaignNameUpdate(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(canvasName);
    setIsEditing(false);
  };

  return (
    <div className="w-full bg-neutral-900 rounded-lg max-h-[70vh]">
      <div className="flex flex-col mb-6 gap-3">
        <HeaderWithBackButton
          onBack={onBack}
          title={
            isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-lg text-neutral-100 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 hover:bg-neutral-700 rounded text-green-500"
                  title="Save"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-neutral-700 rounded text-red-500"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{canvasName}</span>
                {onCampaignNameUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200"
                    title="Edit campaign name"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            )
          }
          subtitle={campaignType}
        />
      </div>

      {loading ? (
        <div className="text-center py-6 text-neutral-400">
          Loading segments...
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>No segments found for this campaign.</p>
          <p className="text-sm mt-2">Try creating a new campaign with audience segments.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {segments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onClick={() => onSegmentSelect(segment)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
