import { createContext, useContext, type ReactNode, useCallback, useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'

// Types
export interface Brand {
  id: string
  name: string
  color: string
  initials: string
  voice: string
  topics: string[]
  description: string
  createdAt: number
  postCount?: number
}

export interface Post {
  id: string
  brandId: string
  platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'
  content: string
  imageUrl?: string
  voiceUrl?: string
  status: 'draft' | 'scheduled' | 'published'
  scheduledFor?: string
  createdAt: number
  publishedAt?: number
  brand?: {
    id: string
    name: string
    color: string
    initials: string
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  plan: 'FREE' | 'PRO' | 'BUSINESS'
}

export const PLATFORMS = ['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook'] as const
export type Platform = typeof PLATFORMS[number]

export const VOICE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'witty', label: 'Witty & Humorous' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
] as const

interface Stats {
  postsScheduled: number
  postsDraft: number
  postsPublished: number
  totalPosts: number
}

interface DataContextType {
  // User
  user: UserProfile | null
  isLoading: boolean
  error: string | null

  // Brands
  brands: Brand[]
  selectedBrandId: string | null
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt'>) => Promise<Brand>
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  selectBrand: (id: string | null) => void

  // Posts
  posts: Post[]
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<Post>
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>
  deletePost: (id: string) => Promise<void>

  // Stats
  getStats: () => Stats

  // Refresh data
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set up API token getter
  useEffect(() => {
    api.setTokenGetter(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])

  // Load data when signed in
  const refreshData = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null)
      setBrands([])
      setPosts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch user, brands, and posts in parallel
      // Fetch more posts to ensure all scheduled posts appear in calendar
      const [userData, brandsData, postsData] = await Promise.all([
        api.getMe(),
        api.getBrands(),
        api.getPosts({ limit: 1000 })
      ])

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        plan: userData.plan
      })

      setBrands(brandsData.map(b => ({
        id: b.id,
        name: b.name,
        color: b.color,
        initials: b.initials,
        voice: b.voice,
        topics: b.topics,
        description: b.description || '',
        createdAt: new Date(b.createdAt).getTime(),
        postCount: b.postCount
      })))

      setPosts(postsData.posts.map(p => ({
        id: p.id,
        brandId: p.brand.id,
        platform: p.platform as Platform,
        content: p.content,
        imageUrl: p.imageUrl || undefined,
        voiceUrl: p.voiceUrl || undefined,
        status: p.status.toLowerCase() as 'draft' | 'scheduled' | 'published',
        scheduledFor: p.scheduledFor || undefined,
        createdAt: new Date(p.createdAt).getTime(),
        publishedAt: p.publishedAt ? new Date(p.publishedAt).getTime() : undefined,
        brand: p.brand
      })))

      // Select first brand if none selected (use functional update to avoid race condition)
      if (brandsData.length > 0) {
        setSelectedBrandId(currentId => currentId ?? brandsData[0].id)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn])

  // Load data on mount and when auth changes
  useEffect(() => {
    if (isLoaded) {
      refreshData()
    }
  }, [isLoaded, isSignedIn, refreshData])

  const addBrand = useCallback(async (brandData: Omit<Brand, 'id' | 'createdAt'>): Promise<Brand> => {
    const result = await api.createBrand({
      name: brandData.name,
      description: brandData.description,
      color: brandData.color,
      initials: brandData.initials,
      voice: brandData.voice,
      topics: brandData.topics
    }) as { id: string; createdAt: string }

    const newBrand: Brand = {
      ...brandData,
      id: result.id,
      createdAt: new Date(result.createdAt).getTime()
    }
    setBrands(prev => [...prev, newBrand])
    return newBrand
  }, [])

  const updateBrand = useCallback(async (id: string, updates: Partial<Brand>) => {
    await api.updateBrand(id, updates)
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const deleteBrand = useCallback(async (id: string) => {
    await api.deleteBrand(id)
    setBrands(prev => {
      const remaining = prev.filter(b => b.id !== id)
      // Use functional update for selectedBrandId to avoid race condition
      setSelectedBrandId(currentId => {
        if (currentId === id) {
          return remaining.length > 0 ? remaining[0].id : null
        }
        return currentId
      })
      return remaining
    })
  }, [])

  const selectBrand = useCallback((id: string | null) => {
    setSelectedBrandId(id)
  }, [])

  const addPost = useCallback(async (postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
    const result = await api.createPost({
      content: postData.content,
      platform: postData.platform,
      brandId: postData.brandId,
      imageUrl: postData.imageUrl,
      voiceUrl: postData.voiceUrl,
      status: postData.status,
      scheduledFor: postData.scheduledFor
    }) as { id: string; createdAt: string }

    const newPost: Post = {
      ...postData,
      id: result.id,
      createdAt: new Date(result.createdAt).getTime()
    }
    setPosts(prev => [newPost, ...prev])
    return newPost
  }, [])

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    await api.updatePost(id, updates)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deletePost = useCallback(async (id: string) => {
    await api.deletePost(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }, [])

  const getStats = useCallback((): Stats => {
    return {
      postsScheduled: posts.filter(p => p.status === 'scheduled').length,
      postsDraft: posts.filter(p => p.status === 'draft').length,
      postsPublished: posts.filter(p => p.status === 'published').length,
      totalPosts: posts.length
    }
  }, [posts])

  return (
    <DataContext.Provider value={{
      user,
      isLoading,
      error,
      brands,
      selectedBrandId,
      addBrand,
      updateBrand,
      deleteBrand,
      selectBrand,
      posts,
      addPost,
      updatePost,
      deletePost,
      getStats,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
