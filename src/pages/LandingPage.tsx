import { Navbar } from "../components/Navbar"
import { Hero } from "../components/Hero"
import { ProblemSolution } from "../components/ProblemSolution"
import { AgentFeatures } from "../components/AgentFeatures"
import { HowItWorks } from "../components/HowItWorks"
import { Pricing } from "../components/Pricing"
import { FAQ } from "../components/FAQ"
import { Footer } from "../components/Footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <AgentFeatures />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
