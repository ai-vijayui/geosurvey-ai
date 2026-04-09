import { AiInsightCard } from "../../AiInsightCard";
import type { InsightCardData } from "../../../features/ai-command/types";

type Props = {
  insight: InsightCardData;
};

export function InsightCardBlock({ insight }: Props) {
  return <AiInsightCard insight={{ ...insight, jobId: "", createdAt: new Date(0).toISOString() }} />;
}
