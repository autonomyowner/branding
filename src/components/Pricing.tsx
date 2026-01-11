import { useRef, type MouseEvent } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useInView } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { cn } from "../lib/utils"

interface Plan {
  name: string
  description: string
  price: string
  features: string[]
  cta: string
  popular: boolean
}

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  popular?: boolean
}

function TiltCard({ children, className, popular }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      {/* Glow effect that follows cursor */}
      <motion.div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: popular
            ? "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.15), transparent 40%)"
            : "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.06), transparent 40%)",
        }}
      />
      <Card
        className={cn(
          "h-full p-6 relative transition-all duration-200",
          "hover:border-white/20",
          popular && "border-primary glow-purple",
          className
        )}
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </Card>
    </motion.div>
  )
}

export function Pricing() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const plans: Plan[] = [
    {
      name: t('pricing.starter.name'),
      description: t('pricing.starter.description'),
      price: t('pricing.starter.price'),
      features: [
        t('pricing.starter.feature1'),
        t('pricing.starter.feature2'),
        t('pricing.starter.feature3'),
        t('pricing.starter.feature4')
      ],
      cta: t('pricing.starter.cta'),
      popular: false
    },
    {
      name: t('pricing.pro.name'),
      description: t('pricing.pro.description'),
      price: t('pricing.pro.price'),
      features: [
        t('pricing.pro.feature1'),
        t('pricing.pro.feature2'),
        t('pricing.pro.feature3'),
        t('pricing.pro.feature4'),
        t('pricing.pro.feature5')
      ],
      cta: t('pricing.pro.cta'),
      popular: true
    },
    {
      name: t('pricing.enterprise.name'),
      description: t('pricing.enterprise.description'),
      price: t('pricing.enterprise.price'),
      features: [
        t('pricing.enterprise.feature1'),
        t('pricing.enterprise.feature2'),
        t('pricing.enterprise.feature3'),
        t('pricing.enterprise.feature4'),
        t('pricing.enterprise.feature5'),
        t('pricing.enterprise.feature6')
      ],
      cta: t('pricing.enterprise.cta'),
      popular: false
    }
  ]

  return (
    <section id="pricing" ref={ref} className="py-24 relative" style={{ perspective: "1000px" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            {t('nav.pricing')}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('pricing.title')}, <span className="text-primary">{t('pricing.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards with 3D Tilt */}
        <div className="grid md:grid-cols-3 gap-6" style={{ perspective: "1000px" }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group"
            >
              <TiltCard popular={plan.popular}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6" style={{ transform: "translateZ(30px)" }}>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6" style={{ transform: "translateZ(40px)" }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{t('pricing.monthly')}
                    </span>
                  </div>
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full mb-6"
                  style={{ transform: "translateZ(50px)" }}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3" style={{ transform: "translateZ(20px)" }}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
