import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "";

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3Client.send(command);
  return getPublicUrl(key);
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export function getPublicUrl(key: string): string {
  const region = process.env.AWS_REGION || "us-east-1";
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

export function extractKeyFromUrl(url: string): string | null {
  const region = process.env.AWS_REGION || "us-east-1";
  const prefixes = [
    `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/`,
    `https://${BUCKET_NAME}.s3.amazonaws.com/`,
    `https://s3.${region}.amazonaws.com/${BUCKET_NAME}/`,
    `https://s3.amazonaws.com/${BUCKET_NAME}/`,
  ];
  for (const prefix of prefixes) {
    if (url.startsWith(prefix)) {
      return decodeURIComponent(url.slice(prefix.length));
    }
  }
  return null;
}

export { s3Client, BUCKET_NAME };
