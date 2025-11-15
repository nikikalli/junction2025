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
          title={`Campaign Name: ${canvasName}`}
          subtitle={campaignType}
        />
      </div>

      {loading ? (
        <div className="text-center py-6 text-neutral-400">
          Loading segments...
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
