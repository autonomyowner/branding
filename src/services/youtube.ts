// YouTube Transcript Extraction Service
// Uses youtube-transcript API (free, no API key required)

export interface VideoInfo {
  videoId: string
  title: string
  channelName: string
  duration: string
  thumbnail: string
}

export interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

// Extract video ID from various YouTube URL formats
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Fetch video metadata using oEmbed (no API key required)
export async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

  const response = await fetch(oEmbedUrl)

  if (!response.ok) {
    throw new Error('Could not fetch video information. Please check the URL.')
  }

  const data = await response.json()

  return {
    videoId,
    title: data.title || 'Unknown Title',
    channelName: data.author_name || 'Unknown Channel',
    duration: '', // oEmbed doesn't provide duration
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
}

// Fetch transcript using YouTube Data API or fallback methods
export async function fetchTranscript(videoId: string, youtubeApiKey?: string): Promise<string> {
  // Method 1: Use YouTube Data API if key is provided
  if (youtubeApiKey) {
    try {
      const transcript = await fetchTranscriptWithYouTubeAPI(videoId, youtubeApiKey)
      if (transcript) return transcript
    } catch (e) {
      console.log('YouTube API transcript fetch failed, trying alternatives...')
    }
  }

  // Method 2: Try public transcript APIs
  try {
    const transcript = await fetchTranscriptFromAPI(videoId)
    if (transcript) return transcript
  } catch (e) {
    console.log('API transcript fetch failed')
  }

  // Method 3: Try alternative API
  try {
    const transcript = await fetchTranscriptAlternative(videoId)
    if (transcript) return transcript
  } catch (e) {
    console.log('Alternative API failed')
  }

  throw new Error('Could not fetch transcript. The video may not have captions available, or captions may be disabled.')
}

// Fetch transcript using YouTube Data API
async function fetchTranscriptWithYouTubeAPI(videoId: string, apiKey: string): Promise<string | null> {
  try {
    // First, get the caption tracks for the video
    const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
    const captionsResponse = await fetch(captionsUrl)

    if (!captionsResponse.ok) {
      console.log('Failed to fetch captions list')
      return null
    }

    const captionsData = await captionsResponse.json()

    if (!captionsData.items || captionsData.items.length === 0) {
      console.log('No captions available for this video')
      return null
    }

    // Find English captions or auto-generated captions
    const englishCaption = captionsData.items.find(
      (item: { snippet: { language: string; trackKind: string } }) =>
        item.snippet.language === 'en' ||
        item.snippet.trackKind === 'asr' // Auto-generated
    ) || captionsData.items[0]

    if (!englishCaption) {
      return null
    }

    // Note: Downloading captions requires OAuth, so we fall back to other methods
    // The YouTube Data API v3 captions.download requires authentication
    // For now, we use this to verify captions exist, then try other methods
    console.log('Captions exist, but download requires OAuth. Trying alternative methods.')
    return null
  } catch (error) {
    console.log('YouTube API error:', error)
    return null
  }
}

// Fetch from a public transcript API service
async function fetchTranscriptFromAPI(videoId: string): Promise<string | null> {
  // Using a reliable public transcript service
  // This service extracts auto-generated or manual captions

  const apiUrl = `https://yt-transcript-api.vercel.app/api/transcript?videoId=${videoId}`

  try {
    const response = await fetch(apiUrl)

    if (!response.ok) {
      // Try alternative API
      return await fetchTranscriptAlternative(videoId)
    }

    const data = await response.json()

    if (data.transcript && Array.isArray(data.transcript)) {
      return data.transcript.map((segment: TranscriptSegment) => segment.text).join(' ')
    }

    return null
  } catch {
    return await fetchTranscriptAlternative(videoId)
  }
}

// Alternative transcript fetch method
async function fetchTranscriptAlternative(videoId: string): Promise<string | null> {
  // Try another public API
  const apiUrl = `https://api.kome.ai/api/tools/youtube-transcripts?video_id=${videoId}`

  try {
    const response = await fetch(apiUrl)

    if (!response.ok) return null

    const data = await response.json()

    if (data.transcript) {
      return data.transcript
    }

    return null
  } catch {
    return null
  }
}

// Process transcript into chunks suitable for post generation
export function processTranscript(transcript: string, maxChunkLength: number = 4000): string[] {
  // Split transcript into sentences
  const sentences = transcript.split(/(?<=[.!?])\s+/)

  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).length > maxChunkLength) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())

  return chunks
}

// Extract key topics/themes from transcript for better post generation
export function extractKeyPoints(transcript: string): string[] {
  // Simple extraction of potential key points
  // Look for common patterns that indicate important content

  const keyPointPatterns = [
    /(?:first|second|third|fourth|fifth|finally|lastly|importantly|key thing|main point)[,:]?\s+([^.!?]+[.!?])/gi,
    /(?:the secret is|here's the thing|what you need to know|the truth is)[,:]?\s+([^.!?]+[.!?])/gi,
    /(?:number \d+|step \d+|tip \d+)[,:]?\s+([^.!?]+[.!?])/gi
  ]

  const keyPoints: string[] = []

  for (const pattern of keyPointPatterns) {
    const matches = transcript.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].length > 20) {
        keyPoints.push(match[1].trim())
      }
    }
  }

  return keyPoints.slice(0, 10) // Return top 10 key points
}
