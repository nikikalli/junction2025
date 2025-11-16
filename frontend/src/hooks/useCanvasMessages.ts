import { useState, useEffect } from "react";
import { Canvas, MessageWithKey, CanvasMessage } from "@/types";

interface UseCanvasMessagesReturn {
  selectedMessageKey: string | null;
  setSelectedMessageKey: (key: string | null) => void;
  allMessages: MessageWithKey[];
  selectedMessage: CanvasMessage | null;
}

export const useCanvasMessages = (
  canvases: Canvas[]
): UseCanvasMessagesReturn => {
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(
    null
  );

  const getAllMessages = (): MessageWithKey[] => {
    if (canvases.length === 0) return [];

    const canvas = canvases[0];
    const messages: MessageWithKey[] = [];

    canvas.steps.forEach((step) => {
      if (step.messages) {
        Object.entries(step.messages).forEach(([key, message]) => {
          messages.push({
            key: `${step.name}-${key}`,
            message,
          });
        });
      }
    });

    return messages;
  };

  const allMessages = getAllMessages();
  const selectedMessage = selectedMessageKey
    ? allMessages.find((m) => m.key === selectedMessageKey)?.message ||
      allMessages[0]?.message ||
      null
    : allMessages[0]?.message || null;

  // Auto-select first message when loading
  useEffect(() => {
    if (allMessages.length > 0 && !selectedMessageKey) {
      setSelectedMessageKey(allMessages[0].key);
    }
  }, [allMessages, selectedMessageKey]);

  return {
    selectedMessageKey,
    setSelectedMessageKey,
    allMessages,
    selectedMessage,
  };
};
