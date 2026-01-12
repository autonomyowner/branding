import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"
import { Button } from "../ui/button"

interface QuickActionsProps {
  onGenerateContent: () => void
  onAddBrand: () => void
  onRepurpose?: () => void
  onVoiceover?: () => void
  onGenerateImage?: () => void
}

export function QuickActions({ onGenerateContent, onAddBrand, onRepurpose, onVoiceover, onGenerateImage }: QuickActionsProps) {
  const { t } = useTranslation()

  const actions = [
    {
      id: 'generate',
      title: t('quickActions.generate'),
      description: "Create new posts with AI",
      buttonText: "Start Creating",
      primary: true,
      gradient: "from-primary/20 to-purple-500/20"
    },
    {
      id: 'image',
      title: "Generate Image",
      description: "Create AI images with Flux & SDXL",
      buttonText: "Create Image",
      primary: false,
      gradient: "from-orange-500/10 to-amber-500/10"
    },
    {
      id: 'voiceover',
      title: t('quickActions.voiceover'),
      description: t('quickActions.voiceoverDesc'),
      buttonText: t('quickActions.voiceoverButton'),
      primary: false,
      gradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      id: 'repurpose',
      title: t('quickActions.videoToPosts'),
      description: t('quickActions.videoToPostsDesc'),
      buttonText: t('quickActions.videoToPostsButton'),
      primary: false,
      gradient: "from-red-500/10 to-orange-500/10"
    },
    {
      id: 'brand',
      title: t('quickActions.createBrand'),
      description: "Add a new brand profile",
      buttonText: "Add Brand",
      primary: false,
      gradient: "from-blue-500/10 to-cyan-500/10"
    }
  ]
  const handleClick = (actionId: string) => {
    switch (actionId) {
      case 'generate':
        onGenerateContent()
        break
      case 'brand':
        onAddBrand()
        break
      case 'voiceover':
        onVoiceover?.()
        break
      case 'repurpose':
        onRepurpose?.()
        break
      case 'image':
        onGenerateImage?.()
        break
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{t('dashboard.quickActions')}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {actions.map((action) => (
          <Card
            key={action.id}
            className={`p-5 bg-gradient-to-br ${action.gradient} border-white/10 hover:border-white/20 transition-all cursor-pointer group`}
            onClick={() => handleClick(action.id)}
          >
            <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {action.description}
            </p>
            <Button
              variant={action.primary ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                handleClick(action.id)
              }}
            >
              {action.buttonText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
