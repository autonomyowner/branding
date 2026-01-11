import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"
import { Logo } from "./ui/Logo"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { cn } from "../lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Logo size="lg" useRouterLink />

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#agents" className="text-sm text-muted-foreground hover:text-white transition-colors">
            {t('nav.features')}
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">
            {t('nav.pricing')}
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-white transition-colors">
            {t('nav.faq')}
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              {t('nav.signIn')}
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm">
              {t('nav.getStarted')}
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
