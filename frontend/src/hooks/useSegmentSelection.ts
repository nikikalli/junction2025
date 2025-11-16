import { useState, useEffect } from "react";
import { Segment, Canvas } from "@/types";

interface UseSegmentSelectionReturn {
  selectedSegment: Segment | null;
  setSelectedSegment: (segment: Segment | null) => void;
  segments: Segment[];
  canvases: Canvas[];
  loading: boolean;
  selectSegment: (segment: Segment) => Promise<void>;
}

const COUNT = 20;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useSegmentSelection = (
  selectedCanvasId: string | null,
  selectedCampaignType: "Standard" | "Promotional"
): UseSegmentSelectionReturn => {
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);

  const selectSegment = async (segment: Segment) => {
    setSelectedSegment(segment);
    setLoading(true);
    try {
      if (!selectedCanvasId) return;
      const response = await fetch(
        `${API_URL}/campaigns/generate/${selectedCanvasId}?count=${COUNT}`
      );
      const data = await response.json();
      const segmentCanvas = data.canvases?.[segment.id - 1];
      setCanvases(segmentCanvas ? [segmentCanvas] : []);
    } catch (error) {
      console.error("Error fetching canvases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCanvasId) return;

    const fetchSegments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/campaigns/analyzedSegments?count=20`
        );
        const data = await response.json();
        const mappedSegments: Segment[] = data.segments.map(
          (seg: any, index: number) => ({
            ...seg,
            id: index + 1,
            name: seg.segment_id,
            type: selectedCampaignType,
          })
        );
        setSegments(mappedSegments);
        setSelectedSegment(null);
        setCanvases([]);
      } catch (error) {
        console.error("Error fetching analyzed segments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [selectedCanvasId, selectedCampaignType]);

  return {
    selectedSegment,
    setSelectedSegment,
    segments,
    canvases,
    loading,
    selectSegment,
  };
};
