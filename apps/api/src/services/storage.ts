import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "../utils/logger.js";

const endpoint = process.env.AWS_ENDPOINT_URL;

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint,
  forcePathStyle: Boolean(endpoint),
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      : undefined
});

export const bucketName = process.env.AWS_BUCKET_NAME ?? "geosurvey-files";

export async function uploadBuffer(key: string, body: Buffer, contentType?: string) {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType
      })
    );
  } catch (error) {
    logger.error("Storage upload failed", error);
    throw new Error("Unable to upload file to object storage.");
  }
}

export async function createDownloadUrl(key: string) {
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      }),
      { expiresIn: 3600 }
    );
  } catch (error) {
    logger.error("Storage presign failed", error);
    throw new Error("Unable to create download URL.");
  }
}

export async function objectExists(key: string) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(key: string) {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
  } catch (error) {
    logger.error("Storage delete failed", error);
    throw new Error("Unable to delete object from storage.");
  }
}

export function makeStorageKey(jobId: string, fileName: string, scope: "input" | "output" = "input") {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return `jobs/${jobId}/${scope}/${Date.now()}-${safeName}`;
}
