import { Segment } from "@/types";

interface SegmentCardProps {
  segment: Segment;
  onClick: () => void;
}

export const SegmentCard = ({ segment, onClick }: SegmentCardProps) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border-2 border-neutral-700 bg-neutral-850 hover:border-neutral-600 rounded-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-neutral-100 mb-2">
            {segment.name}
          </h4>
          <div className="space-y-1 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Age:</span>
              <span className="text-neutral-200">{segment.parent_age}y</span>
            </div>
            <div className="flex justify-between">
              <span>Engagement:</span>
              <span className="text-neutral-200">
                {segment.engagement_propensity}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
