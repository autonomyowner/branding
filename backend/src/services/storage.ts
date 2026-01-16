import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import crypto from 'crypto'

// Initialize R2 client (S3-compatible)
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2 storage not configured')
    }

    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return s3Client
}

// Generate a unique filename
function generateFilename(extension: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  return `${timestamp}-${random}.${extension}`
}

// Upload a file to R2
export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  const client = getS3Client()
  const bucketName = env.R2_BUCKET_NAME

  if (!bucketName) {
    throw new Error('R2 bucket name not configured')
  }

  // Determine file extension from content type
  const extensionMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
  }

  const extension = extensionMap[contentType] || 'bin'
  const filename = generateFilename(extension)
  const key = `${folder}/${filename}`

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  // Return public URL
  const publicUrl = env.R2_PUBLIC_URL
  if (publicUrl) {
    return `${publicUrl}/${key}`
  }

  // Fallback to R2 URL pattern
  return `https://${bucketName}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
}

// Upload an image (convenience wrapper)
export async function uploadImage(buffer: Buffer, contentType: string = 'image/png'): Promise<string> {
  return uploadFile(buffer, contentType, 'images')
}

// Upload audio (convenience wrapper)
export async function uploadAudio(buffer: Buffer, contentType: string = 'audio/mpeg'): Promise<string> {
  return uploadFile(buffer, contentType, 'audio')
}

// Delete a file from R2
export async function deleteFile(fileUrl: string): Promise<void> {
  const client = getS3Client()
  const bucketName = env.R2_BUCKET_NAME

  if (!bucketName) {
    throw new Error('R2 bucket name not configured')
  }

  // Extract key from URL
  const urlObj = new URL(fileUrl)
  const key = urlObj.pathname.replace(/^\//, '')

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )
}
