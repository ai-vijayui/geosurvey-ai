import ReactMarkdown from "react-markdown";
import { AssistantTextBlock } from "./blocks/AssistantTextBlock";
import { ConfirmationCardBlock } from "./blocks/ConfirmationCardBlock";
import { ErrorAlertBlock } from "./blocks/ErrorAlertBlock";
import { InsightCardBlock } from "./blocks/InsightCardBlock";
import { JobCardBlock } from "./blocks/JobCardBlock";
import { ProgressCardBlock } from "./blocks/ProgressCardBlock";
import { ProjectCardBlock } from "./blocks/ProjectCardBlock";
import { QuickActionsBlock } from "./blocks/QuickActionsBlock";
import type { AiMessage } from "../../context/AiPanelContext";
import type { QuickAction } from "../../features/ai-command/types";

type Props = {
  message: AiMessage;
  streaming: boolean;
  isLast: boolean;
  commandBusy?: boolean;
  onQuickAction: (action: QuickAction) => void;
  onConfirm: (message: AiMessage) => void;
  onEditConfirmation?: (message: AiMessage) => void;
  onCancelConfirmation: (message: AiMessage) => void;
};

export function ChatMessage({ message, streaming, isLast, commandBusy, onQuickAction, onConfirm, onEditConfirmation, onCancelConfirmation }: Props) {
  if (message.role === "user") {
    return (
      <div className="bubble user ai-message-bubble">
        <span className="ai-message-role">You</span>
        <div>{message.content}</div>
      </div>
    );
  }

  return (
    <div className="bubble assistant ai-message-bubble">
      <span className="ai-message-role">GeoSurvey AI</span>
      {message.content ? <ReactMarkdown>{message.content}</ReactMarkdown> : null}
      {message.blocks?.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "assistant_text":
            return <AssistantTextBlock key={key} text={block.data.text} />;
          case "project_card":
            return <ProjectCardBlock key={key} project={block.data} />;
          case "job_card":
            return <JobCardBlock key={key} job={block.data} />;
          case "progress_card":
            return <ProgressCardBlock key={key} progress={block.data} />;
          case "insight_card":
            return <InsightCardBlock key={key} insight={block.data} />;
          case "error_alert":
            return <ErrorAlertBlock key={key} error={block.data} />;
          case "quick_actions":
            return <QuickActionsBlock key={key} actions={block.data.actions} disabled={commandBusy} onAction={onQuickAction} />;
          case "confirmation_card":
            return (
              <ConfirmationCardBlock
                key={key}
                title={block.data.title}
                message={block.data.message}
                summary={block.data.summary}
                confirmLabel={block.data.confirmLabel}
                cancelLabel={block.data.cancelLabel}
                editLabel={block.data.editLabel}
                showEdit={block.data.showEdit}
                disabled={commandBusy}
                onConfirm={() => onConfirm(message)}
                onEdit={onEditConfirmation ? () => onEditConfirmation(message) : undefined}
                onCancel={() => onCancelConfirmation(message)}
              />
            );
          default:
            return null;
        }
      })}
      {streaming && isLast ? <span className="cursor" /> : null}
    </div>
  );
}
