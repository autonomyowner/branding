import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData } from '../../context/DataContext'
import { generateVoiceoverScript, VOICEOVER_STYLES } from '../../services/openrouter'
import { getVoices, generateSpeech, downloadAudio, createAudioUrl, revokeAudioUrl, type Voice } from '../../services/elevenlabs'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface VoiceoverModalProps {
  isOpen: boolean
  onClose: () => void
  initialText?: string
}

type VoiceoverStyle = 'conversational' | 'professional' | 'energetic' | 'calm'

export function VoiceoverModal({ isOpen, onClose, initialText = '' }: VoiceoverModalProps) {
  const { t } = useTranslation()
  const { settings, updateSettings } = useData()

  // Script state
  const [script, setScript] = useState(initialText)
  const [scriptStyle, setScriptStyle] = useState<VoiceoverStyle>('conversational')
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Voice state
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState('')
  const [isLoadingVoices, setIsLoadingVoices] = useState(false)

  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Preview voice
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)

  // Error state
  const [error, setError] = useState('')

  // Update script when initialText changes
  useEffect(() => {
    if (initialText) {
      setScript(initialText)
    }
  }, [initialText])

  // Load voices when modal opens and API key is set
  useEffect(() => {
    if (isOpen && settings.elevenLabsApiKey && voices.length === 0) {
      loadVoices()
    }
  }, [isOpen, settings.elevenLabsApiKey])

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        revokeAudioUrl(audioUrl)
      }
    }
  }, [audioUrl])

  const loadVoices = async () => {
    if (!settings.elevenLabsApiKey) return

    setIsLoadingVoices(true)
    setError('')

    try {
      const fetchedVoices = await getVoices(settings.elevenLabsApiKey)
      setVoices(fetchedVoices)
      if (fetchedVoices.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(fetchedVoices[0].voice_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceover.errorLoadingVoices'))
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const handleOptimizeScript = async () => {
    if (!script.trim() || !settings.openRouterApiKey) {
      setError(t('voiceover.scriptRequired'))
      return
    }

    setIsOptimizing(true)
    setError('')

    try {
      const optimized = await generateVoiceoverScript({
        text: script,
        apiKey: settings.openRouterApiKey,
        model: settings.selectedModel,
        style: scriptStyle
      })
      setScript(optimized)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceover.errorOptimizing'))
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleGenerateVoiceover = async () => {
    if (!script.trim()) {
      setError(t('voiceover.scriptRequired'))
      return
    }

    if (!settings.elevenLabsApiKey) {
      setError(t('voiceover.apiKeyMissing'))
      return
    }

    if (!selectedVoiceId) {
      setError(t('voiceover.selectVoice'))
      return
    }

    // Clean up previous audio
    if (audioUrl) {
      revokeAudioUrl(audioUrl)
      setAudioUrl(null)
    }
    setAudioBlob(null)

    setIsGenerating(true)
    setError('')

    try {
      const blob = await generateSpeech(settings.elevenLabsApiKey, script, selectedVoiceId)
      const url = createAudioUrl(blob)
      setAudioBlob(blob)
      setAudioUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceover.errorGenerating'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleDownload = () => {
    if (!audioBlob) return
    const filename = `voiceover-${Date.now()}.mp3`
    downloadAudio(audioBlob, filename)
  }

  const handlePreviewVoice = (voice: Voice) => {
    if (previewAudio) {
      previewAudio.pause()
    }

    if (voice.preview_url) {
      const audio = new Audio(voice.preview_url)
      audio.play()
      setPreviewAudio(audio)
    }
  }

  const handleClose = () => {
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (previewAudio) {
      previewAudio.pause()
    }

    // Clean up audio URL
    if (audioUrl) {
      revokeAudioUrl(audioUrl)
    }

    // Reset state
    setScript(initialText)
    setAudioUrl(null)
    setAudioBlob(null)
    setIsPlaying(false)
    setError('')

    onClose()
  }

  const characterCount = script.length
  const maxCharacters = 5000
  const isOverLimit = characterCount > maxCharacters

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full mx-4 max-w-3xl max-h-[90vh] overflow-hidden"
        >
          <Card className="p-6 bg-card border-border flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('voiceover.title')}</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
              {/* ElevenLabs API Key Warning */}
              {!settings.elevenLabsApiKey && (
                <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-purple-400 mb-2">{t('voiceover.apiKeyMissing')}</p>
                  <input
                    type="password"
                    placeholder={t('voiceover.apiKeyPlaceholder')}
                    className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                    onChange={(e) => updateSettings({ elevenLabsApiKey: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('voiceover.getApiKey')}{' '}
                    <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" className="text-primary hover:underline">
                      elevenlabs.io
                    </a>
                  </p>
                </div>
              )}

              {/* Script Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">{t('voiceover.script')}</label>
                  <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {characterCount} / {maxCharacters}
                  </span>
                </div>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={t('voiceover.scriptPlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg bg-background border text-sm focus:outline-none focus:border-primary min-h-[150px] resize-y ${
                    isOverLimit ? 'border-red-500' : 'border-border'
                  }`}
                />
                {isOverLimit && (
                  <p className="text-xs text-red-400 mt-1">{t('voiceover.characterLimitExceeded')}</p>
                )}
              </div>

              {/* Optimize Script Section */}
              {settings.openRouterApiKey && (
                <div className="mb-6 p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{t('voiceover.optimizeForVoice')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOptimizeScript}
                      disabled={isOptimizing || !script.trim()}
                    >
                      {isOptimizing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t('voiceover.optimizing')}
                        </span>
                      ) : (
                        t('voiceover.optimize')
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {VOICEOVER_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setScriptStyle(style.value as VoiceoverStyle)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          scriptStyle === style.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        title={style.description}
                      >
                        {t(`voiceover.style.${style.value}`)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('voiceover.optimizeDescription')}
                  </p>
                </div>
              )}

              {/* Voice Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">{t('voiceover.selectVoice')}</label>
                  {settings.elevenLabsApiKey && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadVoices}
                      disabled={isLoadingVoices}
                    >
                      {isLoadingVoices ? t('voiceover.loading') : t('voiceover.refreshVoices')}
                    </Button>
                  )}
                </div>

                {isLoadingVoices ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : voices.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                    {voices.map((voice) => (
                      <button
                        key={voice.voice_id}
                        onClick={() => setSelectedVoiceId(voice.voice_id)}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          selectedVoiceId === voice.voice_id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        <div className="font-medium text-sm truncate">{voice.name}</div>
                        {voice.labels?.gender && (
                          <div className="text-xs opacity-70 mt-0.5 capitalize">
                            {voice.labels.gender}
                            {voice.labels.accent && ` - ${voice.labels.accent}`}
                          </div>
                        )}
                        {voice.preview_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewVoice(voice)
                            }}
                            className="mt-2 text-xs underline opacity-70 hover:opacity-100"
                          >
                            {t('voiceover.preview')}
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                ) : settings.elevenLabsApiKey ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">{t('voiceover.noVoices')}</p>
                    <Button variant="outline" size="sm" onClick={loadVoices} className="mt-2">
                      {t('voiceover.loadVoices')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">{t('voiceover.enterApiKeyFirst')}</p>
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-400">{t('voiceover.audioReady')}</p>
                      <p className="text-xs text-muted-foreground">{t('voiceover.clickToPlay')}</p>
                    </div>
                    <Button onClick={handleDownload}>
                      {t('voiceover.download')}
                    </Button>
                  </div>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleGenerateVoiceover}
                disabled={isGenerating || !script.trim() || !selectedVoiceId || !settings.elevenLabsApiKey || isOverLimit}
                className="flex-1"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('voiceover.generating')}
                  </span>
                ) : (
                  t('voiceover.generate')
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
