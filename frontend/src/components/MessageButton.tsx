interface MessageButtonProps {
  isSelected: boolean;
  channel: string;
  subject?: string;
  message?: string;
  body?: string;
  onClick: () => void;
}

export const MessageButton = ({
  isSelected,
  channel,
  subject,
  message,
  body,
  onClick,
}: MessageButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-lg border transition-all text-sm ${
        isSelected
          ? "border-purple-500 bg-purple-900/30 text-purple-100"
          : "border-neutral-700 bg-neutral-850 text-neutral-300 hover:border-neutral-600"
      }`}
    >
      <div className="font-medium">{channel}</div>
      <div className="text-xs text-neutral-400 mt-1 truncate">
        {subject || message || body || "No content"}
      </div>
    </button>
  );
};
