import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SegmentSelectionMode } from "@/types/campaign";

interface StepSegmentSelectionProps {
  selectedSegments: string[];
  selectionMode: SegmentSelectionMode | null;
  onSegmentSelect: (segments: string[]) => void;
  onModeSelect: (mode: SegmentSelectionMode) => void;
  onNext: () => void;
  onBack: () => void;
}

// Mock segment data
const MOCK_SEGMENTS = [
  { id: "seg-001", name: "High-Value Customers", userCount: 5234 },
  { id: "seg-002", name: "New Users", userCount: 12430 },
  { id: "seg-003", name: "Inactive Users", userCount: 8120 },
  { id: "seg-004", name: "Premium Subscribers", userCount: 3450 },
  { id: "seg-005", name: "Mobile App Users", userCount: 15672 },
];

export default function StepSegmentSelection({
  selectedSegments,
  selectionMode,
  onSegmentSelect,
  onModeSelect,
  onNext,
  onBack,
}: StepSegmentSelectionProps) {
  const [criteriaInput, setCriteriaInput] = useState<string>("");

  const handleSegmentToggle = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      onSegmentSelect(selectedSegments.filter((id) => id !== segmentId));
    } else {
      onSegmentSelect([...selectedSegments, segmentId]);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Target Segments</h2>

      {/* Mode Selection */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">How would you like to select segments?</p>
        <div className="flex gap-2">
          <Button
            variant={selectionMode === "list" ? "default" : "outline"}
            onClick={() => {
              onModeSelect("list");
              onSegmentSelect([]); // Reset selections when switching modes
            }}
            className="flex-1"
          >
            From List
          </Button>
          <Button
            variant={selectionMode === "criteria" ? "default" : "outline"}
            onClick={() => {
              onModeSelect("criteria");
              onSegmentSelect([]); // Reset selections when switching modes
            }}
            className="flex-1"
          >
            By Criteria
          </Button>
        </div>
      </div>

      {/* List Mode */}
      {selectionMode === "list" && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Select segments from the list:</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {MOCK_SEGMENTS.map((segment) => (
              <label
                key={segment.id}
                className="flex items-center p-3 border border-gray-600 rounded hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSegments.includes(segment.id)}
                  onChange={() => handleSegmentToggle(segment.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium">{segment.name}</p>
                  <p className="text-xs text-gray-400">{segment.userCount.toLocaleString()} users</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Criteria Mode */}
      {selectionMode === "criteria" && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Define segment criteria:</p>
          <div className="space-y-3">
            <Input
              placeholder="e.g., users with purchase history in last 30 days"
              value={criteriaInput}
              onChange={(e) => {
                setCriteriaInput(e.target.value);
                if (e.target.value) {
                  onSegmentSelect(["custom-criteria"]);
                } else {
                  onSegmentSelect([]);
                }
              }}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Describe the audience segment you want to target
            </p>
          </div>
        </div>
      )}

      {/* Selected Info */}
      {selectedSegments.length > 0 && (
        <div className="mb-6 p-3 bg-cyan-400/10 border border-cyan-400/30 rounded">
          <p className="text-sm">
            {selectionMode === "list"
              ? `${selectedSegments.length} segment(s) selected`
              : "Custom criteria defined"}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedSegments.length === 0}
          className="min-w-32"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
