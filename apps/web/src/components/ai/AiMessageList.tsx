import { useEffect, useRef } from "react";
import type { AiMessage } from "../../context/AiPanelContext";
import type { QuickAction } from "../../features/ai-command/types";
import { ChatMessage } from "./ChatMessage";

type Props = {
  messages: AiMessage[];
  streaming: boolean;
  commandBusy?: boolean;
  onQuickAction: (action: QuickAction) => void;
  onConfirm: (message: AiMessage) => void;
  onEditConfirmation?: (message: AiMessage) => void;
  onCancelConfirmation: (message: AiMessage) => void;
};

export function AiMessageList({ messages, streaming, commandBusy, onQuickAction, onConfirm, onEditConfirmation, onCancelConfirmation }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  return (
    <div className="ai-messages ai-message-list" ref={scrollRef}>
      {messages.length === 0 ? (
        <div className="ai-message-empty">
          <span className="ai-ready-pill">Ready</span>
          <strong>Run commands, ask questions, and keep the app in sync.</strong>
          <span className="text-muted">Create projects, create jobs, start processing, analyze jobs, open reports, or ask normal questions.</span>
        </div>
      ) : null}
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.role}-${index}`}
          message={message}
          streaming={streaming}
          isLast={index === messages.length - 1}
          commandBusy={commandBusy}
          onQuickAction={onQuickAction}
          onConfirm={onConfirm}
          onEditConfirmation={onEditConfirmation}
          onCancelConfirmation={onCancelConfirmation}
        />
      ))}
    </div>
  );
}
