import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useTranslation } from "react-i18next"

export function HowItWorks() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      number: "01",
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description')
    },
    {
      number: "02",
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description')
    },
    {
      number: "03",
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description')
    },
    {
      number: "04",
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description')
    }
  ]

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('howItWorks.title')} <span className="text-primary">{t('howItWorks.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}

              {/* Step Card */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">Ready to get started?</p>
          <button className="text-primary font-medium hover:underline">
            View documentation →
          </button>
        </motion.div>
      </div>
    </section>
  )
}
