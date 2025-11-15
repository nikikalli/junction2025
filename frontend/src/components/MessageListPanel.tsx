import { MessageWithKey } from "@/types";
import { MessageButton } from "@/components/MessageButton";
import { HeaderWithBackButton } from "@/components/HeaderWithBackButton";

interface MessageListPanelProps {
  allMessages: MessageWithKey[];
  selectedMessageKey: string | null;
  loading: boolean;
  segmentName: string;
  campaignType: "Standard" | "Promotional";
  onBack: () => void;
  onMessageSelect: (key: string) => void;
}

export const MessageListPanel = ({
  allMessages,
  selectedMessageKey,
  loading,
  segmentName,
  campaignType,
  onBack,
  onMessageSelect,
}: MessageListPanelProps) => {
  return (
    <div className="w-[35%] bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-3 p-4 border-b border-neutral-800">
        <HeaderWithBackButton
          onBack={onBack}
          title={segmentName}
          subtitle={campaignType}
        />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          Loading...
        </div>
      ) : allMessages.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2 p-4">
            {allMessages.map((item) => (
              <MessageButton
                key={item.key}
                isSelected={selectedMessageKey === item.key}
                channel={item.message.channel}
                subject={item.message.subject}
                message={item.message.message}
                body={item.message.body}
                onClick={() => onMessageSelect(item.key)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
          No messages available
        </div>
      )}
    </div>
  );
};
