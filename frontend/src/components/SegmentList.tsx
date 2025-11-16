import { Segment } from "@/types";
import { SegmentCard } from "@/components/SegmentCard";
import { HeaderWithBackButton } from "@/components/HeaderWithBackButton";

interface SegmentListProps {
  segments: Segment[];
  loading: boolean;
  campaignType: "Standard" | "Promotional";
  canvasName: string;
  onBack: () => void;
  onSegmentSelect: (segment: Segment) => void;
}

export const SegmentList = ({
  segments,
  loading,
  campaignType,
  canvasName,
  onBack,
  onSegmentSelect,
}: SegmentListProps) => {
  return (
    <div className="w-full bg-neutral-900 rounded-lg overflow-y-auto max-h-[70vh]">
      <div className="flex flex-col mb-6 gap-3">
        <HeaderWithBackButton
          onBack={onBack}
          title={`${canvasName}`}
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
