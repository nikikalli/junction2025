import { Canvas, CanvasMessage } from "@/types";

interface CanvasSummaryHeaderProps {
  canvas: Canvas;
}

export const CanvasSummaryHeader = ({ canvas }: CanvasSummaryHeaderProps) => {
  return (
    <div className="mb-4 pb-4 border-b border-neutral-700">
      <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">{canvas.name}</h4>
        {canvas.country && (
          <p className="text-xs opacity-80 mt-1">Country: {canvas.country}</p>
        )}
      </div>
      <div className="flex gap-2 mt-4 text-xs flex-wrap">
        <span
          className={`px-2.5 py-1 rounded-md font-medium ${
            canvas.draft
              ? "bg-neutral-700 text-neutral-300"
              : "bg-green-900 text-green-200"
          }`}
        >
          {canvas.draft ? "Draft" : "Active"}
        </span>
        <span className="px-2.5 py-1 rounded-md bg-blue-900 text-blue-200 font-medium">
          {canvas.variants?.length || 0} variants
        </span>
        <span className="px-2.5 py-1 rounded-md bg-purple-900 text-purple-200 font-medium">
          {canvas.steps?.length || 0} steps
        </span>
      </div>
    </div>
  );
};

interface MessagePreviewPanelProps {
  canvas: Canvas | null;
  selectedMessage: CanvasMessage | null;
  loading: boolean;
}

export const MessagePreviewPanel = ({
  canvas,
  selectedMessage,
  loading,
}: MessagePreviewPanelProps) => {
  return (
    <div className="w-[65%] bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col overflow-hidden">
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          Loading campaign copy...
        </div>
      ) : selectedMessage ? (
        <div className="flex-1 overflow-y-auto p-4">
          {canvas && <CanvasSummaryHeader canvas={canvas} />}
          <div>{selectedMessage && JSON.stringify(selectedMessage)}</div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          Select a message to view details
        </div>
      )}
    </div>
  );
};
