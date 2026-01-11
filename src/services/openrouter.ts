import type { Brand, Platform } from '../context/DataContext'

interface GenerateContentParams {
  brand: Brand
  platform: Platform
  topic?: string
  apiKey: string
  model?: string
  style?: ContentStyle
}

interface GenerateFromVideoParams {
  brand: Brand
  platform: Platform
  transcript: string
  videoTitle: string
  numberOfPosts: number
  apiKey: string
  model?: string
  style?: ContentStyle
}

export type ContentStyle = 'viral' | 'storytelling' | 'educational' | 'controversial' | 'inspirational'

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// ============================================================================
// TOP-TIER COPYWRITING FRAMEWORKS
// Based on Gary Halbert, Eugene Schwartz, David Ogilvy techniques
// ============================================================================

const COPYWRITING_FRAMEWORKS = `
## MASTER COPYWRITING FRAMEWORKS (Use ONE per post)

### 1. PAS (Problem-Agitate-Solution) - Best for engagement
- PROBLEM: Identify a specific pain point your audience faces
- AGITATE: Twist the knife - make them FEEL the frustration
- SOLUTION: Present your insight/tip as the relief

### 2. AIDA (Attention-Interest-Desire-Action) - Best for conversions
- ATTENTION: Pattern-interrupt opening (controversial, unexpected)
- INTEREST: "Here's why this matters to YOU..."
- DESIRE: Paint the transformation, the after-state
- ACTION: Clear next step (save, share, comment, try this)

### 3. BAB (Before-After-Bridge) - Best for storytelling
- BEFORE: "I used to struggle with..."
- AFTER: "Now I..." (paint the dream state)
- BRIDGE: "Here's exactly how..." (the method/secret)

### 4. The 4Ps (Promise-Picture-Proof-Push)
- PROMISE: Bold claim or benefit
- PICTURE: Vivid mental image of success
- PROOF: Stats, results, testimonials
- PUSH: Urgency + CTA

### 5. SLAP (Stop-Look-Act-Purchase) - Best for short-form
- STOP: Pattern interrupt in first 2 seconds
- LOOK: Create curiosity gap
- ACT: Emotional trigger
- PURCHASE: Value exchange (follow, save, share)
`

// ============================================================================
// VIRAL HOOK FORMULAS
// Research-backed hooks that drive engagement
// ============================================================================

const VIRAL_HOOKS = `
## VIRAL HOOK FORMULAS (Pick the best one for your content)

### Curiosity Hooks
- "Nobody is talking about this, but..."
- "The [thing] that [experts] don't want you to know..."
- "I spent [time] researching [topic]. Here's what I found..."
- "Why is no one talking about [surprising insight]?"
- "This changed everything I knew about [topic]..."

### Contrarian Hooks
- "Unpopular opinion: [bold statement]"
- "Everything you know about [topic] is wrong"
- "Stop doing [common thing]. Here's why..."
- "[Popular advice] is actually terrible advice. Here's what works instead..."
- "The [popular method] is dead. Try this instead..."

### Transformation Hooks
- "I went from [bad state] to [good state] in [timeframe]. Here's how..."
- "6 months ago I couldn't [thing]. Today I [achievement]..."
- "This one change [transformed/doubled/fixed] my [result]..."
- "If I could go back, I'd tell myself these [X] things..."

### Authority Hooks
- "After [X years/clients/projects], here's what actually works..."
- "I've [impressive credential]. Here's my honest take..."
- "The #1 mistake I see [audience] making..."
- "What [impressive number] of [experience] taught me about [topic]..."

### Direct Address Hooks
- "If you're struggling with [problem], read this..."
- "This is for the [specific person] who [specific situation]..."
- "[Specific audience], stop scrolling..."
- "You need to hear this if you [common situation]..."

### Emotional Hooks
- "I almost gave up on [thing]. Then this happened..."
- "The moment I realized [insight] changed everything..."
- "I was today years old when I learned..."
- "This hit me hard: [insight]"

### Value Hooks
- "Save this for later: [X] ways to [benefit]..."
- "The only [X] things you need to [achieve goal]..."
- "Steal my exact [process/template/system] for [result]..."
- "Free game: Here's how to [achieve thing] without [obstacle]..."
`

// ============================================================================
// PLATFORM-SPECIFIC MASTERY
// Optimized for each platform's algorithm and audience behavior
// ============================================================================

const PLATFORM_MASTERY: Record<Platform, string> = {
  Instagram: `
## INSTAGRAM MASTERY

### Algorithm Secrets (2025)
- First line = EVERYTHING. You have 125 characters before "...more"
- Saves and shares > likes (algorithm weights them 3x higher)
- Carousel tip: Slide 2 can be shown as a "second chance" - make it a hook too
- Hashtags: 3-5 niche hashtags > 30 generic ones

### Winning Structure
1. HOOK (first line): Pattern interrupt, curiosity gap, or bold claim
2. LINE BREAK (creates "...more" click)
3. STORY/VALUE: 2-3 short paragraphs with line breaks
4. CTA: "Save this for later" or engagement question
5. HASHTAGS: At the end, 3-5 relevant ones

### Power Moves
- Use "you" and "your" constantly - make it personal
- Numbers in hooks perform 36% better
- Questions in CTAs get 2x more comments
- Emojis at line starts increase readability (but don't overdo)

### Character Sweet Spots
- Hook: Under 125 chars (before truncation)
- Total: 150-300 words for carousels, 50-100 for single image
`,

  Twitter: `
## TWITTER/X MASTERY

### Algorithm Secrets (2025)
- Replies > likes > retweets for algorithm boost
- First 280 characters determine if people click "Show more"
- Threads with 5-10 tweets perform best
- Posting time matters less than engagement velocity

### Winning Structure (Single Tweet)
1. HOOK: Bold claim or question (front-load value)
2. INSIGHT: One clear point
3. CTA: Invite reply or retweet

### Thread Structure
1. Tweet 1: Killer hook + promise ("I spent 100 hours on X. Here's what I learned:")
2. Tweet 2-8: One insight per tweet, numbered
3. Final Tweet: Summary + CTA ("If this helped, RT tweet 1")

### Power Moves
- Start with "I" or "You" - personal performs better
- Odd numbers outperform even (7 tips > 6 tips)
- White space matters - break up long tweets
- Quote tweets with hot takes get massive reach

### Character Sweet Spots
- Ideal: 71-100 characters for single tweets
- Max engagement: 240-259 characters
- Threads: Each tweet should standalone
`,

  LinkedIn: `
## LINKEDIN MASTERY

### Algorithm Secrets (2025)
- "See more" clicks = massive algorithm boost
- Comments in first hour are weighted 5x
- Dwell time (how long people read) affects reach
- Personal stories outperform corporate content 3:1

### Winning Structure
1. HOOK (first 2 lines): Must create curiosity before "...see more"
2. LINE BREAK
3. STORY: Personal narrative with specific details
4. INSIGHT: What you learned
5. TAKEAWAY: Actionable advice
6. CTA: Question that invites discussion

### Power Moves
- Start with "I" + vulnerable statement
- Use specific numbers ("I failed 47 times" > "I failed many times")
- One line paragraphs = higher readability
- End with genuine question (not "thoughts?")
- Respond to EVERY comment in first 2 hours

### Writing Style
- Conversational, not corporate
- Short sentences. Like this. Easy to scan.
- Bold claims backed by personal experience
- Vulnerability + lesson = viral formula

### Character Sweet Spots
- Hook: Under 210 characters (before truncation)
- Total: 1,200-1,500 characters (sweet spot)
- Paragraphs: 1-2 sentences max
`,

  TikTok: `
## TIKTOK MASTERY

### Algorithm Secrets (2025)
- Watch time + completion rate = #1 factor
- First 1-3 seconds determine if people stay
- Replays count MORE than first views
- Comments and shares boost more than likes

### Script Structure
1. HOOK (0-3 sec): Pattern interrupt, bold claim, or "Wait..."
2. CONTEXT (3-10 sec): Quick setup, build tension
3. VALUE (10-45 sec): Deliver the goods, keep it punchy
4. PAYOFF (last 5 sec): Satisfying conclusion + CTA

### Winning Hook Types
- "Stop scrolling if you [specific situation]"
- "POV: You just discovered [game-changer]"
- "This [thing] is why your [problem]"
- "I tested [thing] for [time]. Here's what happened..."
- Open loop: Start mid-story, explain after

### Power Moves
- Talk fast but clear
- Jump cuts every 2-3 seconds
- Text on screen for silent viewers
- End with a hook for the next video (series = followers)
- Reply to comments with videos

### Script Length
- 15-30 seconds: Best for virality
- 60 seconds: Best for depth + followers
- Always leave them wanting more
`,

  Facebook: `
## FACEBOOK MASTERY

### Algorithm Secrets (2025)
- Meaningful interactions (comments, shares) > reactions
- Groups content gets 5x more reach than pages
- Native content beats links
- Stories and Reels get preferential treatment

### Winning Structure
1. HOOK: Question or relatable statement
2. STORY: Personal, emotional, specific
3. LESSON: Universal truth
4. CTA: "Share if you agree" or question

### Power Moves
- Ask genuine questions that invite stories
- Tag relevant people/pages strategically
- Use "Share" CTAs - they work on FB
- Nostalgia and family content = massive reach
- Debate-starting questions drive comments

### Content Types That Win
- Personal milestones with lessons
- "Am I the only one who..." posts
- Throwback content with insights
- Hot takes on trending topics

### Character Sweet Spots
- Hook: 40-80 characters
- Total: 100-250 words for text posts
- Shorter = more shares
`
}

// ============================================================================
// STORYTELLING FRAMEWORKS
// Based on Eugene Schwartz's emotional copy + narrative psychology
// ============================================================================

const STORYTELLING_TECHNIQUES = `
## STORYTELLING TECHNIQUES

### The Transformation Story
1. The Struggle: "I was [painful situation]..."
2. The Breaking Point: "Then one day, [catalyst]..."
3. The Discovery: "That's when I found [insight]..."
4. The Result: "Now I [transformed state]..."
5. The Gift: "And you can too. Here's how..."

### The Mistake Story
1. The Common Approach: "Like most people, I used to [common behavior]..."
2. The Failure: "Until [bad thing happened]..."
3. The Realization: "I realized [insight]..."
4. The New Way: "Now I [new approach]..."
5. The Lesson: "The takeaway: [universal truth]"

### The Contrarian Story
1. Popular Belief: "Everyone says [common wisdom]..."
2. Your Experience: "But when I [tried it]..."
3. The Truth: "Here's what actually works..."
4. The Proof: "And the results speak for themselves..."

### Story Power-Ups
- Specific details create believability ("March 3rd at 2am" > "one night")
- Dialogue brings stories to life ("She said: 'You'll never make it'")
- Sensory details create immersion ("My hands were shaking...")
- Vulnerability builds connection (admit failures, fears, doubts)
`

// ============================================================================
// PSYCHOLOGICAL TRIGGERS
// Based on Cialdini's persuasion principles + behavioral psychology
// ============================================================================

const PSYCHOLOGY_TRIGGERS = `
## PSYCHOLOGICAL TRIGGERS TO USE

### Curiosity Gap
- Open a loop, close it later
- "The third one shocked me..."
- "But here's where it gets interesting..."

### Social Proof
- Numbers: "10,000+ people have tried this"
- Specificity: "Sarah from Ohio said..."
- Results: "This helped me get [specific result]"

### Urgency/Scarcity
- Time: "Before [date/event]..."
- Limited: "Only works for [specific situation]..."
- Exclusivity: "Most people won't do this..."

### Pattern Interrupt
- Start with unexpected statement
- Challenge assumptions
- Use unusual formatting

### Identity
- Speak to who they want to become
- "High performers do this..."
- "If you're the type who..."

### Loss Aversion
- Frame as what they'll miss
- "You're losing [thing] every day you don't..."
- "The cost of not knowing this..."
`

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export async function generateContent({
  brand,
  platform,
  topic,
  apiKey,
  model = 'anthropic/claude-3-haiku',
  style = 'viral'
}: GenerateContentParams): Promise<string> {

  const styleInstructions: Record<ContentStyle, string> = {
    viral: "Optimize for maximum shareability and engagement. Use curiosity gaps, bold hooks, and emotional triggers.",
    storytelling: "Lead with a personal narrative. Use the transformation story framework. Make it relatable and emotional.",
    educational: "Deliver high-value insights. Use numbered lists, clear takeaways, and actionable advice.",
    controversial: "Take a bold stance. Challenge conventional wisdom. Be provocative but substantive.",
    inspirational: "Motivate and uplift. Use transformation stories, emotional language, and empowering CTAs."
  }

  const systemPrompt = `You are an elite copywriter trained in the techniques of Gary Halbert, Eugene Schwartz, and David Ogilvy. You create viral, high-converting social media content that drives massive engagement.

## YOUR EXPERTISE
- Master of emotional triggers and psychological persuasion
- Expert in platform algorithms and what makes content go viral
- Skilled in storytelling that creates deep audience connection
- Trained in direct response copywriting that drives action

## BRAND CONTEXT
Brand: ${brand.name}
Description: ${brand.description}
Voice/Tone: ${brand.voice}
Core Topics: ${brand.topics.join(', ')}

## STYLE DIRECTION
${styleInstructions[style]}

${COPYWRITING_FRAMEWORKS}

${VIRAL_HOOKS}

${PLATFORM_MASTERY[platform]}

${STORYTELLING_TECHNIQUES}

${PSYCHOLOGY_TRIGGERS}

## CRITICAL RULES
1. HOOK IS EVERYTHING - The first line must stop the scroll. No weak openings.
2. EVERY WORD EARNS ITS PLACE - Cut ruthlessly. No fluff, no filler.
3. WRITE LIKE YOU TALK - Conversational, not corporate. Real, not polished.
4. ONE IDEA PER POST - Don't dilute. Go deep on one thing.
5. END WITH PURPOSE - Every post needs a clear CTA or engagement trigger.
6. AUTHENTICITY > PERFECTION - Raw and real beats polished and fake.

## OUTPUT FORMAT
Generate ONLY the post content. No explanations, no meta-commentary, no "Here's a post..." prefixes.
The content should be ready to copy-paste directly to ${platform}.`

  const userPrompt = topic
    ? `Create a ${style} ${platform} post about: ${topic}

Make it scroll-stopping. Use the most powerful hook formula for this topic. Apply the ${platform} mastery techniques.`
    : `Create a ${style} ${platform} post about one of these topics: ${brand.topics.join(', ')}

Pick the topic with the most viral potential. Use the most powerful hook formula. Apply the ${platform} mastery techniques.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Branding'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.85
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0]?.message?.content || 'Failed to generate content'
}

export const AVAILABLE_MODELS = [
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Fast & Cheap)' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Best Quality)' },
  { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus (Most Creative)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (Smart)' },
  { value: 'google/gemini-flash-1.5', label: 'Gemini Flash (Fast)' },
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B (Powerful)' },
]

// ============================================================================
// VIDEO TO POSTS GENERATION
// Generate multiple social media posts from video transcript
// ============================================================================

export async function generateFromVideo({
  brand,
  platform,
  transcript,
  videoTitle,
  numberOfPosts,
  apiKey,
  model = 'anthropic/claude-3.5-sonnet',
  style = 'viral'
}: GenerateFromVideoParams): Promise<string[]> {

  const styleInstructions: Record<ContentStyle, string> = {
    viral: "Optimize for maximum shareability and engagement. Use curiosity gaps, bold hooks, and emotional triggers.",
    storytelling: "Lead with personal narratives extracted from the video. Make it relatable and emotional.",
    educational: "Deliver high-value insights from the video. Use numbered lists, clear takeaways, and actionable advice.",
    controversial: "Extract bold takes from the video. Challenge conventional wisdom. Be provocative but substantive.",
    inspirational: "Pull motivating moments from the video. Use transformation stories, emotional language, and empowering CTAs."
  }

  const systemPrompt = `You are an elite content repurposing specialist. Your job is to transform video content into viral social media posts.

## YOUR EXPERTISE
- Master of extracting the most engaging moments from long-form content
- Expert in adapting content for different platforms while maintaining the core message
- Skilled in identifying quotable moments, key insights, and shareable takeaways
- Trained in creating hooks that make people stop scrolling

## BRAND CONTEXT
Brand: ${brand.name}
Description: ${brand.description}
Voice/Tone: ${brand.voice}
Core Topics: ${brand.topics.join(', ')}

## STYLE DIRECTION
${styleInstructions[style]}

${COPYWRITING_FRAMEWORKS}

${VIRAL_HOOKS}

${PLATFORM_MASTERY[platform]}

${STORYTELLING_TECHNIQUES}

${PSYCHOLOGY_TRIGGERS}

## VIDEO CONTENT TO REPURPOSE
Title: "${videoTitle}"

Transcript:
${transcript.slice(0, 12000)} ${transcript.length > 12000 ? '...[transcript truncated]' : ''}

## YOUR TASK
Create exactly ${numberOfPosts} unique ${platform} posts from this video content.

## CRITICAL RULES
1. Each post must be COMPLETELY UNIQUE - different angles, quotes, or insights
2. Extract the BEST moments - don't just summarize, find the gold
3. Adapt the language to ${platform}'s style and character limits
4. Each post should work STANDALONE - no "part 1/2" or references to other posts
5. Use direct quotes from the video when they're powerful (mark with "")
6. Create hooks that reference the original content value
7. Every post must have a clear CTA appropriate for ${platform}

## OUTPUT FORMAT
Return ONLY a JSON array of ${numberOfPosts} posts. No explanations, no numbering outside the array.
Format: ["post 1 content here", "post 2 content here", ...]

Each post should be ready to copy-paste directly to ${platform}.`

  const userPrompt = `Generate ${numberOfPosts} unique ${style} ${platform} posts from the video transcript above. Return as a JSON array of strings.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Branding'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.9
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  const content = data.choices[0]?.message?.content || '[]'

  // Parse the JSON array of posts
  try {
    // Extract JSON array from the response (in case there's extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const posts = JSON.parse(jsonMatch[0])
      if (Array.isArray(posts)) {
        return posts.map(post => String(post).trim())
      }
    }
    throw new Error('Invalid response format')
  } catch {
    // If JSON parsing fails, try to split by common patterns
    const lines = content.split(/\n\n+/).filter(line =>
      line.trim().length > 50 && !line.startsWith('[') && !line.startsWith(']')
    )
    if (lines.length >= numberOfPosts) {
      return lines.slice(0, numberOfPosts)
    }
    throw new Error('Failed to parse generated posts. Please try again.')
  }
}

export const CONTENT_STYLES: { value: ContentStyle; label: string; description: string }[] = [
  { value: 'viral', label: 'Viral', description: 'Maximum shareability and engagement' },
  { value: 'storytelling', label: 'Storytelling', description: 'Personal narratives that connect' },
  { value: 'educational', label: 'Educational', description: 'High-value insights and tips' },
  { value: 'controversial', label: 'Controversial', description: 'Bold takes that spark debate' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting content' },
]

// ============================================================================
// VOICEOVER SCRIPT GENERATION
// Transform social media posts or text into natural speaking scripts
// ============================================================================

interface GenerateVoiceoverScriptParams {
  text: string
  apiKey: string
  model?: string
  style?: 'conversational' | 'professional' | 'energetic' | 'calm'
}

export async function generateVoiceoverScript({
  text,
  apiKey,
  model = 'anthropic/claude-3-haiku',
  style = 'conversational'
}: GenerateVoiceoverScriptParams): Promise<string> {

  const styleInstructions: Record<string, string> = {
    conversational: "Natural, like talking to a friend. Casual pacing with natural pauses.",
    professional: "Clear, authoritative, and polished. Suitable for business content.",
    energetic: "Upbeat, enthusiastic, and dynamic. Great for motivational content.",
    calm: "Soothing, measured, and relaxed. Perfect for educational or meditative content."
  }

  const systemPrompt = `You are an expert voiceover script writer. Your job is to transform text into natural, engaging scripts optimized for text-to-speech.

## YOUR TASK
Transform the input text into a voiceover script that sounds natural when spoken aloud.

## STYLE
${styleInstructions[style]}

## TRANSFORMATION RULES
1. REMOVE social media elements:
   - Hashtags (#anything)
   - @ mentions (@anyone)
   - Emojis and special characters
   - "Link in bio" or platform-specific CTAs
   - URLs and links

2. OPTIMIZE for speech:
   - Use commas and periods for natural pauses
   - Write numbers as words when appropriate (e.g., "five" instead of "5" for small numbers)
   - Expand abbreviations (e.g., "versus" instead of "vs")
   - Break long sentences into shorter ones
   - Add transitional phrases for flow

3. MAINTAIN the core message:
   - Keep the hook engaging
   - Preserve key insights and value
   - Maintain the original tone and intent
   - Keep it concise (30 seconds to 2 minutes when spoken)

4. FORMAT for TTS:
   - Use proper punctuation for pacing
   - Avoid ALL CAPS (except for acronyms)
   - Use "..." for longer pauses
   - Keep paragraphs short

## OUTPUT FORMAT
Return ONLY the voiceover script. No explanations, no meta-commentary.
The script should be ready for direct text-to-speech conversion.`

  const userPrompt = `Transform this text into a ${style} voiceover script:

${text}

Return only the optimized voiceover script.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Branding'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0]?.message?.content || text
}

export const VOICEOVER_STYLES = [
  { value: 'conversational', label: 'Conversational', description: 'Natural, like talking to a friend' },
  { value: 'professional', label: 'Professional', description: 'Clear and authoritative' },
  { value: 'energetic', label: 'Energetic', description: 'Upbeat and dynamic' },
  { value: 'calm', label: 'Calm', description: 'Soothing and relaxed' },
] as const
