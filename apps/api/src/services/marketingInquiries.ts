import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type MarketingInquiryRecord = {
  referenceId: string;
  receivedAt: string;
  interest: "contact" | "demo";
  name: string;
  email: string;
  company: string;
  teamSize: string;
  sourcePage: string;
  message: string;
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(currentDir, "../..");
const inquiryDir = path.join(apiRoot, ".data");
const inquiryFile = path.join(inquiryDir, "marketing-inquiries.ndjson");

export async function persistMarketingInquiry(record: MarketingInquiryRecord) {
  await mkdir(inquiryDir, { recursive: true });
  await appendFile(inquiryFile, `${JSON.stringify(record)}\n`, "utf8");
  return inquiryFile;
}

