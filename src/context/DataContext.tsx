import { createContext, useContext, ReactNode, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

// Types inlined to avoid import issues
export interface Brand {
  id: string
  name: string
  color: string
  initials: string
  voice: string
  topics: string[]
  description: string
  createdAt: number
}

export interface Post {
  id: string
  brandId: string
  platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'
  content: string
  imageUrl?: string
  status: 'draft' | 'scheduled' | 'published'
  scheduledFor?: string
  createdAt: number
  publishedAt?: number
}

export interface UserSettings {
  name: string
  openRouterApiKey: string
  selectedModel: string
  creditsUsed: number
  lastCreditReset: number
}

const DEFAULT_SETTINGS: UserSettings = {
  name: 'User',
  openRouterApiKey: '',
  selectedModel: 'anthropic/claude-3-haiku',
  creditsUsed: 0,
  lastCreditReset: Date.now()
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

interface DataContextType {
  // Brands
  brands: Brand[]
  selectedBrandId: string | null
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt'>) => Brand
  updateBrand: (id: string, updates: Partial<Brand>) => void
  deleteBrand: (id: string) => void
  selectBrand: (id: string | null) => void

  // Posts
  posts: Post[]
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Post
  updatePost: (id: string, updates: Partial<Post>) => void
  deletePost: (id: string) => void

  // Settings
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void

  // Stats helpers
  getStats: () => {
    postsGenerated: number
    postsScheduled: number
    brandsActive: number
    creditsRemaining: number
  }
}

const DataContext = createContext<DataContextType | null>(null)

const INITIAL_BRANDS: Brand[] = [
  {
    id: '1',
    name: 'My Brand',
    color: '#8b5cf6',
    initials: 'MB',
    voice: 'professional',
    topics: ['business', 'productivity'],
    description: 'A professional brand focused on business insights and productivity tips.',
    createdAt: Date.now()
  }
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useLocalStorage<Brand[]>('contentengine-brands', INITIAL_BRANDS)
  const [selectedBrandId, setSelectedBrandId] = useLocalStorage<string | null>('contentengine-selected-brand', INITIAL_BRANDS[0]?.id || null)
  const [posts, setPosts] = useLocalStorage<Post[]>('contentengine-posts', [])
  const [settings, setSettings] = useLocalStorage<UserSettings>('contentengine-settings', DEFAULT_SETTINGS)

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const addBrand = useCallback((brandData: Omit<Brand, 'id' | 'createdAt'>): Brand => {
    const newBrand: Brand = {
      ...brandData,
      id: generateId(),
      createdAt: Date.now()
    }
    setBrands(prev => [...prev, newBrand])
    return newBrand
  }, [setBrands])

  const updateBrand = useCallback((id: string, updates: Partial<Brand>) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [setBrands])

  const deleteBrand = useCallback((id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id))
    if (selectedBrandId === id) {
      setSelectedBrandId(brands.find(b => b.id !== id)?.id || null)
    }
  }, [setBrands, selectedBrandId, brands, setSelectedBrandId])

  const selectBrand = useCallback((id: string | null) => {
    setSelectedBrandId(id)
  }, [setSelectedBrandId])

  const addPost = useCallback((postData: Omit<Post, 'id' | 'createdAt'>): Post => {
    const newPost: Post = {
      ...postData,
      id: generateId(),
      createdAt: Date.now()
    }
    setPosts(prev => [newPost, ...prev])

    // Increment credits used
    setSettings(prev => ({
      ...prev,
      creditsUsed: prev.creditsUsed + 1
    }))

    return newPost
  }, [setPosts, setSettings])

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [setPosts])

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }, [setPosts])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [setSettings])

  const getStats = useCallback(() => {
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

    return {
      postsGenerated: posts.length,
      postsScheduled: posts.filter(p => p.status === 'scheduled').length,
      brandsActive: brands.length,
      creditsRemaining: Math.max(0, 1000 - settings.creditsUsed) // 1000 credits per month for MVP
    }
  }, [posts, brands, settings])

  return (
    <DataContext.Provider value={{
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
      settings,
      updateSettings,
      getStats
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
