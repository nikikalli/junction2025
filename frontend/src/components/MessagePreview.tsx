import { CanvasMessage } from "@/types";

const MessagePreview = ({ message }: { message: CanvasMessage }) => {
  if (message.channel === "email" && message.body) {
    return (
      <div className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800">
        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-600 text-sm">
          <strong className="text-neutral-100">Subject:</strong>
          <span className="text-neutral-300 ml-2">
            {message.subject || "No subject"}
          </span>
        </div>
        <iframe
          srcDoc={message.body}
          className="w-full h-96 border-0"
          title="Email preview"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  if (message.channel === "sms" && (message.message || message.body)) {
    return (
      <div className="border border-neutral-700 rounded-lg bg-neutral-800 p-4">
        <div className="text-xs text-neutral-400 mb-3">SMS Message</div>
        <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 inline-block max-w-xs">
          {message.message || message.body}
        </div>
      </div>
    );
  }

  if (message.channel === "push" && (message.message || message.body)) {
    return (
      <div className="border border-neutral-700 rounded-lg bg-neutral-800 p-4">
        <div className="bg-neutral-700 rounded-lg shadow-sm p-3 max-w-sm border border-neutral-600">
          <div className="text-xs text-neutral-400 mb-2">Push Notification</div>
          <div className="font-semibold text-sm text-neutral-100">
            {message.subject || "Notification"}
          </div>
          <div className="text-sm text-neutral-300 mt-2">
            {message.message || message.body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-neutral-700 rounded-lg bg-neutral-800 p-4">
      <div className="text-sm text-neutral-400">{message.channel} message</div>
      <pre className="text-xs mt-2 overflow-auto text-neutral-300">
        {JSON.stringify(message, null, 2)}
      </pre>
    </div>
  );
};

export { MessagePreview };
