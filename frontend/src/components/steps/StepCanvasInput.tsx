import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface StepCanvasInputProps {
  canvasId: string;
  onCanvasIdChange: (id: string) => void;
  onSubmit: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function StepCanvasInput({
  canvasId,
  onCanvasIdChange,
  onSubmit,
  loading,
  error,
}: StepCanvasInputProps) {
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    if (!canvasId.trim()) {
      setInputError("Canvas ID is required");
      return;
    }

    try {
      await onSubmit(canvasId.trim());
    } catch (err) {
      setInputError(
        err instanceof Error ? err.message : "Failed to load canvas"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-50">
      <div className="flex flex-col w-full h-full">
        <Textarea
          id="canvas-id"
          placeholder="Enter your Braze Canvas ID"
          className="w-full h-full border-none text-left"
          value={canvasId}
          onChange={(e) => {
            onCanvasIdChange(e.target.value);
            setInputError(null);
          }}
          disabled={loading}
        />
        {(inputError || error) && (
          <p className="text-red-500 text-sm mt-1">{inputError || error}</p>
        )}
        <div className="flex flex-row justify-between">
          <p className="text-sm font-medium flex-nowrap">
            Sample ID here for the peer reviewers
          </p>
          <Button
            type="submit"
            disabled={loading || !canvasId.trim()}
            className=""
          >
            {loading ? (
              "Loading..."
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M322.5 351.7L523.4 150.9L391 520.3L322.5 351.7zM489.4 117L288.6 317.8L120 249.3L489.4 117zM70.1 280.8L275.9 364.4L359.5 570.2C364.8 583.3 377.6 591.9 391.8 591.9C406.5 591.9 419.6 582.7 424.6 568.8L602.6 72C606.1 62.2 603.6 51.4 596.3 44C589 36.6 578.1 34.2 568.3 37.7L71.4 215.7C57.5 220.7 48.3 233.8 48.3 248.5C48.3 262.7 56.9 275.5 70 280.8z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
