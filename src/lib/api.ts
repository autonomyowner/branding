// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiError {
  message: string
  code: string
}

class ApiClient {
  private baseUrl: string
  private getToken: (() => Promise<string | null>) | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    // Add auth token if available
    if (this.getToken) {
      const token = await this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: { error: ApiError } = await response.json().catch(() => ({
        error: { message: 'Request failed', code: 'UNKNOWN_ERROR' }
      }))
      throw new Error(error.error.message)
    }

    // Handle no content response
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Users
  async getMe() {
    return this.request<{
      id: string
      email: string
      name: string | null
      avatarUrl: string | null
      plan: 'FREE' | 'PRO' | 'BUSINESS'
      usage: {
        postsThisMonth: number
        postsLimit: number
        brands: number
        brandsLimit: number
        totalPosts: number
      }
      features: {
        hasImageGeneration: boolean
        hasVoiceover: boolean
        hasVideoRepurpose: boolean
      }
      createdAt: string
    }>('/api/v1/users/me')
  }

  async updateMe(data: { name?: string }) {
    return this.request('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Brands
  async getBrands() {
    return this.request<Array<{
      id: string
      name: string
      description: string | null
      color: string
      initials: string
      voice: string
      topics: string[]
      postCount: number
      createdAt: string
      updatedAt: string
    }>>('/api/v1/brands')
  }

  async createBrand(data: {
    name: string
    description?: string
    color?: string
    initials?: string
    voice?: string
    topics?: string[]
  }) {
    return this.request('/api/v1/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBrand(id: string, data: Partial<{
    name: string
    description: string
    color: string
    initials: string
    voice: string
    topics: string[]
  }>) {
    return this.request(`/api/v1/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteBrand(id: string) {
    return this.request(`/api/v1/brands/${id}`, {
      method: 'DELETE',
    })
  }

  // Posts
  async getPosts(params?: { brandId?: string; status?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.brandId) searchParams.set('brandId', params.brandId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{
      posts: Array<{
        id: string
        content: string
        platform: string
        imageUrl: string | null
        voiceUrl: string | null
        status: string
        scheduledFor: string | null
        publishedAt: string | null
        aiGenerated: boolean
        aiModel: string | null
        brand: {
          id: string
          name: string
          color: string
          initials: string
        }
        createdAt: string
        updatedAt: string
      }>
      total: number
      limit: number
      offset: number
    }>(`/api/v1/posts${query ? `?${query}` : ''}`)
  }

  async createPost(data: {
    content: string
    platform: string
    brandId: string
    imageUrl?: string
    voiceUrl?: string
    status?: string
    scheduledFor?: string
    aiGenerated?: boolean
    aiModel?: string
  }) {
    return this.request('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePost(id: string, data: Partial<{
    content: string
    platform: string
    imageUrl: string | null
    voiceUrl: string | null
    status: string
    scheduledFor: string | null
  }>) {
    return this.request(`/api/v1/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePost(id: string) {
    return this.request(`/api/v1/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // AI Generation
  async generateContent(data: {
    brandId: string
    platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'
    topic?: string
    style?: 'viral' | 'storytelling' | 'educational' | 'controversial' | 'inspirational'
    model?: string
  }) {
    return this.request<{
      content: string
      platform: string
      model: string
      style: string
    }>('/api/v1/ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async generateFromVideo(data: {
    brandId: string
    platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'
    transcript: string
    videoTitle: string
    numberOfPosts?: number
    style?: string
    model?: string
  }) {
    return this.request<{
      posts: string[]
      count: number
      platform: string
      model: string
    }>('/api/v1/ai/video-to-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAIModels() {
    return this.request<Array<{ value: string; label: string }>>('/api/v1/ai/models')
  }

  // Voice Generation
  async getVoices() {
    return this.request<Array<{
      id: string
      name: string
      previewUrl: string
      category: string
      labels: {
        accent?: string
        age?: string
        gender?: string
        description?: string
        use_case?: string
      }
    }>>('/api/v1/voice/voices')
  }

  async generateVoiceover(data: {
    text: string
    voiceId: string
    style?: 'conversational' | 'professional' | 'energetic' | 'calm'
  }) {
    return this.request<{
      url: string
      text: string
      voiceId: string
      style: string
    }>('/api/v1/voice/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Image Generation
  async generateImage(data: {
    prompt: string
    model?: string
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
    style?: string
  }) {
    return this.request<{
      url: string
      prompt: string
      model: string
      aspectRatio: string
      style: string
    }>('/api/v1/images/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getImageModels() {
    return this.request<Array<{ id: string; name: string; speed: string }>>('/api/v1/images/models')
  }

  // Subscriptions
  async getCurrentSubscription() {
    return this.request<{
      plan: 'FREE' | 'PRO' | 'BUSINESS'
      limits: {
        maxBrands: number
        maxPostsPerMonth: number
        hasImageGeneration: boolean
        hasVoiceover: boolean
        hasVideoRepurpose: boolean
      }
      stripeCustomerId: string | null
      subscription: {
        id: string
        status: string
        currentPeriodEnd: number
        cancelAtPeriodEnd: boolean
      } | null
    }>('/api/v1/subscriptions/current')
  }

  async createCheckout(data: {
    plan: 'PRO' | 'BUSINESS'
    successUrl?: string
    cancelUrl?: string
  }) {
    return this.request<{ url: string }>('/api/v1/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createPortal(returnUrl?: string) {
    return this.request<{ url: string }>('/api/v1/subscriptions/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
