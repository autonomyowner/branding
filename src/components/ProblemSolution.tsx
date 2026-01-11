import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { Card } from "./ui/card"

export function ProblemSolution() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('problem.title')} <span className="text-primary">{t('problem.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 h-full bg-red-500/5 border-red-500/20">
              <div className="text-red-400 text-sm font-medium mb-4">{t('problem.oldWay')}</div>
              <h3 className="text-xl font-semibold mb-4">{t('problem.before.title')}</h3>
              <ul className="space-y-3">
                {[
                  t('problem.before.point1'),
                  t('problem.before.point2'),
                  t('problem.before.point3'),
                  t('problem.before.point4'),
                  t('problem.before.point5')
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-red-400 mt-1">×</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 h-full bg-green-500/5 border-green-500/20">
              <div className="text-green-400 text-sm font-medium mb-4">{t('problem.newWay')}</div>
              <h3 className="text-xl font-semibold mb-4">{t('problem.after.title')}</h3>
              <ul className="space-y-3">
                {[
                  t('problem.after.point1'),
                  t('problem.after.point2'),
                  t('problem.after.point3'),
                  t('problem.after.point4'),
                  t('problem.after.point5')
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-green-400 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
          dir="ltr"
        >
          {[t('problem.flow.step1'), t('problem.flow.step2'), t('problem.flow.step3')].map((step, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-8">
              <div className="text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card border border-white/10 flex items-center justify-center mb-3">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{step}</span>
              </div>
              {i < 2 && (
                <div className="hidden md:block text-muted-foreground">
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                    <path d="M0 12H36M36 12L28 4M36 12L28 20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
