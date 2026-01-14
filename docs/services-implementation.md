# T21 Services Implementation

## Core Services Layer

### OpenRouter AI Service

```typescript
// services/openrouter.ts
import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateContentResult {
  content: string;
  model: string;
  tokensUsed: number;
}

export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'anthropic/claude-3-opus'
): Promise<GenerateContentResult> {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://t21.app',
          'X-Title': 'T21 Content Generator',
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const tokensUsed = response.data.usage.total_tokens;

    return {
      content,
      model,
      tokensUsed
    };
  } catch (error: any) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to generate content');
  }
}

export async function generateHashtags(
  content: string,
  industry?: string
): Promise<string[]> {
  const prompt = `Generate 5-7 relevant hashtags for this social media post:

"${content}"

${industry ? `Industry: ${industry}` : ''}

Return only the hashtags, one per line, without the # symbol.`;

  const result = await generateContent(
    'You are a social media hashtag expert.',
    prompt,
    'openai/gpt-3.5-turbo' // Cheaper model for simple tasks
  );

  const hashtags = result.content
    .split('\n')
    .map(h => h.trim().replace(/^#/, ''))
    .filter(h => h.length > 0);

  return hashtags;
}

export async function improveContent(
  content: string,
  instructions: string
): Promise<string> {
  const prompt = `Improve this social media post:

"${content}"

Instructions: ${instructions}

Return only the improved version, no explanations.`;

  const result = await generateContent(
    'You are a social media content expert.',
    prompt
  );

  return result.content;
}
```

### Social Media Publishing Services

```typescript
// services/social/instagram.ts
import axios from 'axios';
import { decrypt } from '../lib/crypto';

const GRAPH_API_URL = 'https://graph.facebook.com/v18.0';

export async function publishToInstagram(post: any): Promise<string> {
  const account = post.brand.socialAccounts.find(
    (acc: any) => acc.platform === 'INSTAGRAM'
  );

  if (!account || !account.accessToken) {
    throw new Error('Instagram account not connected');
  }

  const accessToken = decrypt(account.accessToken);

  try {
    // Step 1: Create media container
    const containerResponse = await axios.post(
      `${GRAPH_API_URL}/${account.platformUserId}/media`,
      {
        image_url: post.imageUrls[0],
        caption: `${post.content}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`,
        access_token: accessToken
      }
    );

    const containerId = containerResponse.data.id;

    // Step 2: Publish container
    const publishResponse = await axios.post(
      `${GRAPH_API_URL}/${account.platformUserId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken
      }
    );

    return publishResponse.data.id;
  } catch (error: any) {
    console.error('Instagram publish error:', error.response?.data || error.message);
    throw new Error(`Instagram publish failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function getInstagramAnalytics(
  platformPostId: string,
  accessToken: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}/${platformPostId}/insights`,
      {
        params: {
          metric: 'impressions,reach,engagement,saves',
          access_token: decrypt(accessToken)
        }
      }
    );

    const data = response.data.data;
    const metrics: any = {};

    data.forEach((item: any) => {
      metrics[item.name] = item.values[0].value;
    });

    return metrics;
  } catch (error: any) {
    console.error('Instagram analytics error:', error.response?.data || error.message);
    throw error;
  }
}
```

```typescript
// services/social/twitter.ts
import { TwitterApi } from 'twitter-api-v2';
import { decrypt } from '../lib/crypto';

export async function publishToTwitter(post: any): Promise<string> {
  const account = post.brand.socialAccounts.find(
    (acc: any) => acc.platform === 'TWITTER'
  );

  if (!account || !account.accessToken) {
    throw new Error('Twitter account not connected');
  }

  const accessToken = decrypt(account.accessToken);
  const accessSecret = decrypt(account.refreshToken!); // Using refreshToken field for access secret

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken,
    accessSecret
  });

  try {
    let mediaIds: string[] = [];

    // Upload media if present
    if (post.imageUrls && post.imageUrls.length > 0) {
      for (const imageUrl of post.imageUrls.slice(0, 4)) { // Twitter allows max 4 images
        const imageBuffer = await downloadImage(imageUrl);
        const mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/jpeg' });
        mediaIds.push(mediaId);
      }
    }

    // Create tweet
    const tweetText = `${post.content}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`;

    const tweet = await client.v2.tweet({
      text: tweetText.substring(0, 280), // Twitter character limit
      media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
    });

    return tweet.data.id;
  } catch (error: any) {
    console.error('Twitter publish error:', error);
    throw new Error(`Twitter publish failed: ${error.message}`);
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

export async function getTwitterAnalytics(
  platformPostId: string,
  accessToken: string,
  accessSecret: string
): Promise<any> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: decrypt(accessToken),
    accessSecret: decrypt(accessSecret)
  });

  try {
    const tweet = await client.v2.singleTweet(platformPostId, {
      'tweet.fields': ['public_metrics']
    });

    const metrics = tweet.data.public_metrics;

    return {
      impressions: metrics?.impression_count || 0,
      likes: metrics?.like_count || 0,
      retweets: metrics?.retweet_count || 0,
      replies: metrics?.reply_count || 0,
      quotes: metrics?.quote_count || 0
    };
  } catch (error: any) {
    console.error('Twitter analytics error:', error);
    throw error;
  }
}
```

```typescript
// services/social/linkedin.ts
import axios from 'axios';
import { decrypt } from '../lib/crypto';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

export async function publishToLinkedIn(post: any): Promise<string> {
  const account = post.brand.socialAccounts.find(
    (acc: any) => acc.platform === 'LINKEDIN'
  );

  if (!account || !account.accessToken) {
    throw new Error('LinkedIn account not connected');
  }

  const accessToken = decrypt(account.accessToken);

  try {
    let mediaAsset: string | undefined;

    // Upload image if present
    if (post.imageUrls && post.imageUrls.length > 0) {
      mediaAsset = await uploadLinkedInImage(
        post.imageUrls[0],
        account.platformUserId,
        accessToken
      );
    }

    // Create post
    const postData: any = {
      author: `urn:li:person:${account.platformUserId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${post.content}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`
          },
          shareMediaCategory: mediaAsset ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (mediaAsset) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          media: mediaAsset
        }
      ];
    }

    const response = await axios.post(
      `${LINKEDIN_API_URL}/ugcPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    return response.data.id;
  } catch (error: any) {
    console.error('LinkedIn publish error:', error.response?.data || error.message);
    throw new Error(`LinkedIn publish failed: ${error.response?.data?.message || error.message}`);
  }
}

async function uploadLinkedInImage(
  imageUrl: string,
  userId: string,
  accessToken: string
): Promise<string> {
  // Step 1: Register upload
  const registerResponse = await axios.post(
    `${LINKEDIN_API_URL}/assets?action=registerUpload`,
    {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:person:${userId}`,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }
        ]
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const uploadUrl = registerResponse.data.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const asset = registerResponse.data.value.asset;

  // Step 2: Download image
  const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(imageResponse.data);

  // Step 3: Upload to LinkedIn
  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'image/jpeg'
    }
  });

  return asset;
}
```

### File Storage Service (Cloudflare R2)

```typescript
// services/storage.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  userId: string
): Promise<{ url: string; filename: string }> {
  // Generate unique filename
  const ext = path.extname(filename);
  const hash = crypto.randomBytes(16).toString('hex');
  const uniqueFilename = `${userId}/${hash}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueFilename,
    Body: file,
    ContentType: mimeType,
    Metadata: {
      userId,
      originalName: filename
    }
  });

  await s3Client.send(command);

  return {
    url: `${PUBLIC_URL}/${uniqueFilename}`,
    filename: uniqueFilename
  };
}

export async function deleteFile(filename: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename
  });

  await s3Client.send(command);
}

export async function getSignedUploadUrl(
  filename: string,
  mimeType: string,
  userId: string
): Promise<{ url: string; filename: string }> {
  const ext = path.extname(filename);
  const hash = crypto.randomBytes(16).toString('hex');
  const uniqueFilename = `${userId}/${hash}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueFilename,
    ContentType: mimeType
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

  return {
    url,
    filename: uniqueFilename
  };
}

export async function getSignedDownloadUrl(filename: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

### Email Service (Resend)

```typescript
// services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  await resend.emails.send({
    from: 'T21 <noreply@t21.app>',
    to: email,
    subject: 'Welcome to T21!',
    html: `
      <h1>Welcome to T21, ${name}!</h1>
      <p>Thank you for joining T21, the AI-powered social media automation platform.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Create your first brand</li>
        <li>Connect your social media accounts</li>
        <li>Generate AI content</li>
        <li>Schedule your first post</li>
      </ul>
      <p><a href="https://t21.app/dashboard">Get Started</a></p>
    `
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `https://t21.app/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: 'T21 <noreply@t21.app>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
}

export async function sendPostPublishedEmail(
  email: string,
  postContent: string,
  platforms: string[]
): Promise<void> {
  await resend.emails.send({
    from: 'T21 <noreply@t21.app>',
    to: email,
    subject: 'Post Published Successfully',
    html: `
      <h1>Your post has been published!</h1>
      <p>Your post was successfully published to: ${platforms.join(', ')}</p>
      <blockquote>${postContent}</blockquote>
      <p><a href="https://t21.app/dashboard">View in Dashboard</a></p>
    `
  });
}

export async function sendPostFailedEmail(
  email: string,
  postContent: string,
  error: string
): Promise<void> {
  await resend.emails.send({
    from: 'T21 <noreply@t21.app>',
    to: email,
    subject: 'Post Publishing Failed',
    html: `
      <h1>Post Publishing Failed</h1>
      <p>We encountered an error while publishing your post:</p>
      <p><strong>Error:</strong> ${error}</p>
      <blockquote>${postContent}</blockquote>
      <p>Please check your social media connections and try again.</p>
      <p><a href="https://t21.app/dashboard">Go to Dashboard</a></p>
    `
  });
}

export async function sendSubscriptionUpdateEmail(
  email: string,
  tier: string,
  status: string
): Promise<void> {
  await resend.emails.send({
    from: 'T21 <noreply@t21.app>',
    to: email,
    subject: 'Subscription Updated',
    html: `
      <h1>Subscription Updated</h1>
      <p>Your subscription has been updated:</p>
      <ul>
        <li><strong>Plan:</strong> ${tier}</li>
        <li><strong>Status:</strong> ${status}</li>
      </ul>
      <p><a href="https://t21.app/settings/billing">Manage Subscription</a></p>
    `
  });
}

export async function sendTeamInviteEmail(
  email: string,
  inviterName: string,
  organizationName: string,
  inviteToken: string
): Promise<void> {
  const inviteUrl = `https://t21.app/invite/${inviteToken}`;

  await resend.emails.send({
    from: 'T21 <noreply@t21.app>',
    to: email,
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <h1>Team Invitation</h1>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong> on T21.</p>
      <p><a href="${inviteUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
    `
  });
}
```

### Analytics Collection Service

```typescript
// services/analytics.ts
import { prisma } from '../lib/prisma';
import { getInstagramAnalytics } from './social/instagram';
import { getTwitterAnalytics } from './social/twitter';
import { decrypt } from '../lib/crypto';

export async function collectPostAnalytics(socialPostId: string): Promise<void> {
  const socialPost = await prisma.socialPost.findUnique({
    where: { id: socialPostId },
    include: {
      socialAccount: true,
      post: true
    }
  });

  if (!socialPost || !socialPost.platformPostId) {
    return;
  }

  try {
    let metrics: any = {};

    const platform = socialPost.socialAccount.platform;
    const accessToken = socialPost.socialAccount.accessToken!;

    if (platform === 'INSTAGRAM') {
      metrics = await getInstagramAnalytics(socialPost.platformPostId, accessToken);
    } else if (platform === 'TWITTER') {
      const accessSecret = socialPost.socialAccount.refreshToken!;
      metrics = await getTwitterAnalytics(
        socialPost.platformPostId,
        accessToken,
        accessSecret
      );
    }
    // Add other platforms...

    // Calculate engagement rate
    const engagementRate = metrics.reach > 0
      ? ((metrics.likes + metrics.comments + metrics.shares) / metrics.reach) * 100
      : 0;

    // Store analytics
    await prisma.postAnalytics.upsert({
      where: {
        socialPostId_date: {
          socialPostId,
          date: new Date()
        }
      },
      create: {
        socialPostId,
        socialAccountId: socialPost.socialAccountId,
        impressions: metrics.impressions || 0,
        reach: metrics.reach || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || metrics.replies || 0,
        shares: metrics.shares || metrics.retweets || 0,
        clicks: metrics.clicks || 0,
        saves: metrics.saves || 0,
        engagementRate,
        date: new Date()
      },
      update: {
        impressions: metrics.impressions || 0,
        reach: metrics.reach || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || metrics.replies || 0,
        shares: metrics.shares || metrics.retweets || 0,
        clicks: metrics.clicks || 0,
        saves: metrics.saves || 0,
        engagementRate
      }
    });
  } catch (error) {
    console.error('Analytics collection error:', error);
    // Don't throw - analytics failures shouldn't break the system
  }
}

export async function collectAllAnalytics(): Promise<void> {
  // Get all published posts from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const socialPosts = await prisma.socialPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        gte: thirtyDaysAgo
      }
    },
    select: { id: true }
  });

  // Collect analytics for each post (batch processing)
  const batchSize = 10;
  for (let i = 0; i < socialPosts.length; i += batchSize) {
    const batch = socialPosts.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(post => collectPostAnalytics(post.id))
    );

    // Rate limiting - wait between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

These service implementations provide a complete foundation for all major backend operations.
