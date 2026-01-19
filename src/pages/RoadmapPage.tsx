import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"

interface Task {
  id: string
  text: string
  completed: boolean
}

interface Section {
  id: string
  title: string
  subtitle?: string
  budget?: string
  tasks: Task[]
}

type RoadmapType = "outreach" | "ads" | "quick10"

const initialOutreachSections: Section[] = [
  {
    id: "daily",
    title: "Daily 6-Hour Schedule",
    subtitle: "Follow this every day for 30 days",
    tasks: [
      { id: "d1", text: "Hour 1: LinkedIn outreach (100 requests + messages)", completed: false },
      { id: "d2", text: "Hour 2: Cold email (load leads, send 200-300)", completed: false },
      { id: "d3", text: "Hour 3: Reply to all conversations (email + LinkedIn)", completed: false },
      { id: "d4", text: "Hour 4: Content creation (LinkedIn posts, Twitter, Reddit)", completed: false },
      { id: "d5", text: "Hour 5: Lead scraping + list building (100-150 new leads)", completed: false },
      { id: "d6", text: "Hour 6: Follow-ups, demos, onboarding trials", completed: false },
    ]
  },
  {
    id: "week1",
    title: "Week 1: Foundation",
    subtitle: "Setup + start outreach engine",
    budget: "$50 total",
    tasks: [
      { id: "w1-1", text: "Buy cold outreach domain (tryt21.com or similar) - $10", completed: false },
      { id: "w1-2", text: "Set up Brevo account (free tier: 300 emails/day)", completed: false },
      { id: "w1-3", text: "Configure domain DNS (SPF, DKIM, DMARC)", completed: false },
      { id: "w1-4", text: "Sign up Apollo.io free tier (50 leads/month)", completed: false },
      { id: "w1-5", text: "Sign up Hunter.io free tier (25 searches/month)", completed: false },
      { id: "w1-6", text: "Optimize LinkedIn profile (headline + about section)", completed: false },
      { id: "w1-7", text: "Create 2-minute Loom demo video", completed: false },
      { id: "w1-8", text: "Write 3-email cold sequence and load into Brevo", completed: false },
      { id: "w1-9", text: "Scrape first 500 leads (agencies + social media managers)", completed: false },
      { id: "w1-10", text: "Send 100 LinkedIn connection requests per day", completed: false },
      { id: "w1-11", text: "Send first 1,000 cold emails", completed: false },
      { id: "w1-12", text: "Post daily on LinkedIn (content about social media tips)", completed: false },
      { id: "w1-13", text: "Post in 3 Reddit communities (value-first, no spam)", completed: false },
      { id: "w1-14", text: "Submit to AppSumo / DealMirror / PitchGround", completed: false },
    ]
  },
  {
    id: "week2",
    title: "Week 2: Momentum",
    subtitle: "Scale outreach + start converting",
    tasks: [
      { id: "w2-1", text: "Send 500 LinkedIn requests (total: 1,000)", completed: false },
      { id: "w2-2", text: "Send 2,000 cold emails (total: 3,000)", completed: false },
      { id: "w2-3", text: "Reply to ALL conversations within 4 hours", completed: false },
      { id: "w2-4", text: "Message all new LinkedIn connections with opener", completed: false },
      { id: "w2-5", text: "Follow up with non-responders (Day 3 email)", completed: false },
      { id: "w2-6", text: "Post 7 LinkedIn posts this week", completed: false },
      { id: "w2-7", text: "Post in 5 more Reddit communities", completed: false },
      { id: "w2-8", text: "DM everyone who engages with your content", completed: false },
      { id: "w2-9", text: "Scrape 500 more leads", completed: false },
      { id: "w2-10", text: "Run $30 Twitter ad campaign", completed: false },
      { id: "w2-11", text: "Run $20 TikTok ad (screen recording)", completed: false },
      { id: "w2-12", text: "Collect first testimonials from trial users", completed: false },
      { id: "w2-13", text: "Offer 'free Pro for testimonial' to active trials", completed: false },
    ]
  },
  {
    id: "week3",
    title: "Week 3: Compounding",
    subtitle: "Conversions accelerate",
    tasks: [
      { id: "w3-1", text: "Total LinkedIn connections: 1,500+", completed: false },
      { id: "w3-2", text: "Total cold emails sent: 5,000+", completed: false },
      { id: "w3-3", text: "Send Day 7 'breakup' emails to non-responders", completed: false },
      { id: "w3-4", text: "Start second email sequence to new leads", completed: false },
      { id: "w3-5", text: "Chase agency deals (higher LTV)", completed: false },
      { id: "w3-6", text: "Do 5-10 demo calls with interested leads", completed: false },
      { id: "w3-7", text: "Ask paying customers for referrals", completed: false },
      { id: "w3-8", text: "Double down on best-performing channel", completed: false },
      { id: "w3-9", text: "Create case study from first successful customer", completed: false },
      { id: "w3-10", text: "Post case study on LinkedIn + Twitter", completed: false },
      { id: "w3-11", text: "Reach out to micro-influencers in marketing space", completed: false },
    ]
  },
  {
    id: "week4",
    title: "Week 4: Scaling",
    subtitle: "Optimize + prepare for month 2",
    tasks: [
      { id: "w4-1", text: "Total people reached: 8,000-10,000", completed: false },
      { id: "w4-2", text: "Document what messaging converts best", completed: false },
      { id: "w4-3", text: "A/B test email subject lines", completed: false },
      { id: "w4-4", text: "Implement referral program (Give $5, Get $5)", completed: false },
      { id: "w4-5", text: "Add annual billing option ($79/yr)", completed: false },
      { id: "w4-6", text: "Follow up with ALL trials before they expire", completed: false },
      { id: "w4-7", text: "Re-engage cold leads from Week 1-2", completed: false },
      { id: "w4-8", text: "Plan month 2 with learnings from month 1", completed: false },
      { id: "w4-9", text: "Reinvest 80% of revenue into what works", completed: false },
      { id: "w4-10", text: "Hit 35-60 paying customers", completed: false },
      { id: "w4-11", text: "Hit $250-420 MRR", completed: false },
    ]
  },
  {
    id: "linkedin",
    title: "LinkedIn Outreach System",
    subtitle: "Daily LinkedIn tasks",
    tasks: [
      { id: "li-1", text: "Search: 'social media manager' AND 'agency'", completed: false },
      { id: "li-2", text: "Send 100 connection requests (no pitch in request)", completed: false },
      { id: "li-3", text: "Message all new connections with question opener", completed: false },
      { id: "li-4", text: "Reply to all messages within 4 hours", completed: false },
      { id: "li-5", text: "Soft pitch to those who show interest", completed: false },
      { id: "li-6", text: "Follow up Day 4 if no reply to pitch", completed: false },
      { id: "li-7", text: "Post 1 value-add content piece daily", completed: false },
      { id: "li-8", text: "Engage with 10 posts in your niche", completed: false },
    ]
  },
  {
    id: "email",
    title: "Cold Email System",
    subtitle: "Daily email tasks",
    tasks: [
      { id: "em-1", text: "Scrape 100-150 new leads daily (Apollo + manual)", completed: false },
      { id: "em-2", text: "Verify emails before sending (Hunter.io)", completed: false },
      { id: "em-3", text: "Send 200-300 emails per day via Brevo", completed: false },
      { id: "em-4", text: "Day 3: Send follow-up to non-responders", completed: false },
      { id: "em-5", text: "Day 7: Send breakup email", completed: false },
      { id: "em-6", text: "Reply to all responses within 2 hours", completed: false },
      { id: "em-7", text: "Track open rate (target: 40-50%)", completed: false },
      { id: "em-8", text: "Track reply rate (target: 2-5%)", completed: false },
    ]
  },
]

const initialAdsSections: Section[] = [
  {
    id: "pre-launch",
    title: "Before You Spend $1",
    subtitle: "Critical setup that 3x your results",
    tasks: [
      { id: "pre-1", text: "REMOVE waitlist - create direct signup flow for ad traffic", completed: false },
      { id: "pre-2", text: "Add Google SSO to signup (reduces friction 30%)", completed: false },
      { id: "pre-3", text: "Speed up landing page to under 2 seconds load time", completed: false },
      { id: "pre-4", text: "Add live user count: '2,847 creators joined this week'", completed: false },
      { id: "pre-5", text: "Create single-CTA landing page (remove nav menu)", completed: false },
      { id: "pre-6", text: "Set up 7-day email onboarding sequence (see Email System)", completed: false },
      { id: "pre-7", text: "Create special offer for ad traffic: 50 free posts (vs 20)", completed: false },
      { id: "pre-8", text: "Install TikTok Pixel + Meta Pixel with conversion events", completed: false },
    ]
  },
  {
    id: "ugc-creation",
    title: "UGC Content Creation",
    subtitle: "Record these 5 videos before running ads",
    tasks: [
      { id: "ugc-1", text: "Hook 1: 'Still spending 8+ hours on social media?' (problem)", completed: false },
      { id: "ugc-2", text: "Hook 2: 'I manage 5 brands from my phone. Here's how.' (curiosity)", completed: false },
      { id: "ugc-3", text: "Hook 3: 'POV: You just scheduled 30 days in 5 minutes' (result)", completed: false },
      { id: "ugc-4", text: "Hook 4: 'This app replaced my $2000/month social media manager' (money)", completed: false },
      { id: "ugc-5", text: "Hook 5: 'Stop. If you're still posting manually...' (pattern interrupt)", completed: false },
      { id: "ugc-6", text: "Record on iPhone (authentic > polished), good lighting only", completed: false },
      { id: "ugc-7", text: "Add captions to all videos (85% watch muted)", completed: false },
      { id: "ugc-8", text: "Keep videos 21-34 seconds (optimal length)", completed: false },
      { id: "ugc-9", text: "Change scenes every 2-3 seconds (retain attention)", completed: false },
      { id: "ugc-10", text: "End with clear CTA card (last 3-5 seconds)", completed: false },
    ]
  },
  {
    id: "week1-ads",
    title: "Week 1: Learning Phase",
    subtitle: "Build pixel data + test creatives",
    budget: "$300 ad spend",
    tasks: [
      { id: "w1a-1", text: "Set up TikTok Ads Manager + Business Center", completed: false },
      { id: "w1a-2", text: "Campaign 1: Video Views objective (build audience)", completed: false },
      { id: "w1a-3", text: "Budget: $20-30/day, BROAD targeting (10M+ audience)", completed: false },
      { id: "w1a-4", text: "Age: 25-44, Location: US/UK/CA/AU", completed: false },
      { id: "w1a-5", text: "Enable Smart Targeting (improves CPA 5%)", completed: false },
      { id: "w1a-6", text: "Upload all 5 UGC videos as separate ad creatives", completed: false },
      { id: "w1a-7", text: "DO NOT touch ads for 3-4 days (let algorithm learn)", completed: false },
      { id: "w1a-8", text: "Track: 3-sec view rate (target >50%), CTR (target >1%)", completed: false },
      { id: "w1a-9", text: "Post UGC organically on TikTok too (test hooks free)", completed: false },
      { id: "w1a-10", text: "Respond to ALL comments on ads within 1 hour", completed: false },
    ]
  },
  {
    id: "week2-ads",
    title: "Week 2: Interest Targeting",
    subtitle: "Drive traffic + test audiences",
    budget: "$400 ad spend",
    tasks: [
      { id: "w2a-1", text: "Analyze Week 1: Kill ads with CTR <0.5%", completed: false },
      { id: "w2a-2", text: "Campaign 2: Traffic objective (drive clicks)", completed: false },
      { id: "w2a-3", text: "Interest targeting: Entrepreneurship + Small Business", completed: false },
      { id: "w2a-4", text: "Interest targeting: Social Media Marketing + Content Creation", completed: false },
      { id: "w2a-5", text: "Behavior targeting: Followed business/marketing creators (7 days)", completed: false },
      { id: "w2a-6", text: "Budget: $30-50/day across 3 ad sets", completed: false },
      { id: "w2a-7", text: "Create Custom Audience: Video viewers 50%+ watched", completed: false },
      { id: "w2a-8", text: "Create Custom Audience: Website visitors (last 14 days)", completed: false },
      { id: "w2a-9", text: "Record 2 more UGC videos based on best-performing hooks", completed: false },
      { id: "w2a-10", text: "Track: CPC (target <$1.50), Landing page CVR (target >7%)", completed: false },
      { id: "w2a-11", text: "A/B test landing page headline if CVR <5%", completed: false },
    ]
  },
  {
    id: "week3-ads",
    title: "Week 3: Retargeting",
    subtitle: "Convert warm audiences (highest ROI)",
    budget: "$600 ad spend",
    tasks: [
      { id: "w3a-1", text: "Campaign 3: Conversions objective (signups)", completed: false },
      { id: "w3a-2", text: "Retarget: Video viewers 50%+ (warmest audience)", completed: false },
      { id: "w3a-3", text: "Retarget: Website visitors who didn't sign up", completed: false },
      { id: "w3a-4", text: "Retarget: TikTok profile visitors + engagers", completed: false },
      { id: "w3a-5", text: "Allocate 50% of budget to retargeting ($300)", completed: false },
      { id: "w3a-6", text: "Create 1% Lookalike audience from converters", completed: false },
      { id: "w3a-7", text: "Test Spark Ads: Boost best organic TikTok post", completed: false },
      { id: "w3a-8", text: "Add urgency to retargeting ads: 'Limited beta spots'", completed: false },
      { id: "w3a-9", text: "Collect first testimonials from trial users", completed: false },
      { id: "w3a-10", text: "Track: CAC (target <$25), Trial→Paid rate (target >20%)", completed: false },
    ]
  },
  {
    id: "week4-ads",
    title: "Week 4: Scale Winners",
    subtitle: "Double down on what works",
    budget: "$700 ad spend",
    tasks: [
      { id: "w4a-1", text: "Increase winning ad sets by 20% every 3 days", completed: false },
      { id: "w4a-2", text: "Kill any ad with CAC 2x target (>$50)", completed: false },
      { id: "w4a-3", text: "Duplicate winners with new Lookalike audiences", completed: false },
      { id: "w4a-4", text: "Create testimonial-based UGC from first customers", completed: false },
      { id: "w4a-5", text: "Test Instagram Reels ads with best TikTok creatives", completed: false },
      { id: "w4a-6", text: "Launch monthly→annual upgrade campaign to existing users", completed: false },
      { id: "w4a-7", text: "Offer $5 first month to hesitant trial users", completed: false },
      { id: "w4a-8", text: "Document winning: hooks, audiences, CTAs for Month 2", completed: false },
      { id: "w4a-9", text: "Target: 100-180 paid customers from $2K spend", completed: false },
      { id: "w4a-10", text: "Target: $900-1,620 MRR (at $9 avg)", completed: false },
    ]
  },
  {
    id: "tiktok-strategy",
    title: "TikTok Ads Strategy",
    subtitle: "47% cheaper than Meta, better for creators",
    tasks: [
      { id: "tt-1", text: "Rule: 'Don't make ads, make TikToks' (native content wins)", completed: false },
      { id: "tt-2", text: "UGC > Polished: iPhone footage outperforms studio ads", completed: false },
      { id: "tt-3", text: "Hook in first 3 seconds or lose 75% of viewers", completed: false },
      { id: "tt-4", text: "Add movement + text overlay to hook (both required)", completed: false },
      { id: "tt-5", text: "Structure: Hook (3s) → Problem (5s) → Solution (10s) → CTA (5s)", completed: false },
      { id: "tt-6", text: "Use Spark Ads to boost organic posts (2-3x better performance)", completed: false },
      { id: "tt-7", text: "Start broad (10M+), let algorithm find converters", completed: false },
      { id: "tt-8", text: "Refresh creatives every 7 days (performance drops 37%)", completed: false },
      { id: "tt-9", text: "Test 3-5 creatives per ad group minimum", completed: false },
      { id: "tt-10", text: "Benchmark: CTR >1%, CVR >0.5%, CPC <$1", completed: false },
    ]
  },
  {
    id: "email-sequence",
    title: "7-Day Email Onboarding",
    subtitle: "Converts 21.4% of trials to paid (critical!)",
    tasks: [
      { id: "em-1", text: "Day 0: Welcome + 60-second quick win tutorial", completed: false },
      { id: "em-2", text: "Day 1: 'Did you try AI image generation?' (feature discovery)", completed: false },
      { id: "em-3", text: "Day 2: 'Your posts can talk now' (voiceover feature)", completed: false },
      { id: "em-4", text: "Day 3: Customer success story (social proof)", completed: false },
      { id: "em-5", text: "Day 4: 'But will it sound like me?' (objection handler)", completed: false },
      { id: "em-6", text: "Day 5: Usage review + personalized suggestions", completed: false },
      { id: "em-7", text: "Day 6: 'Your trial ends tomorrow' (urgency)", completed: false },
      { id: "em-8", text: "Day 7: '$5 first month' special offer (final push)", completed: false },
      { id: "em-9", text: "Single CTA per email, keep under 150 words", completed: false },
      { id: "em-10", text: "Personalize by usage: active vs inactive users", completed: false },
    ]
  },
  {
    id: "micro-influencers",
    title: "Micro-Influencer Strategy",
    subtitle: "Cheapest CAC, authentic content",
    tasks: [
      { id: "mi-1", text: "Find 10 creators (5K-50K followers) in productivity/business niche", completed: false },
      { id: "mi-2", text: "Offer: Free Pro forever + $50 per video", completed: false },
      { id: "mi-3", text: "Get 10 authentic review videos for $500 total", completed: false },
      { id: "mi-4", text: "Use best 3 videos as Spark Ads ($500 boost budget)", completed: false },
      { id: "mi-5", text: "Expected: 200K-500K views, 3-5x better conversion than brand ads", completed: false },
      { id: "mi-6", text: "Retarget all video viewers with conversion campaign", completed: false },
      { id: "mi-7", text: "Ask creators for affiliate partnership (10% commission)", completed: false },
    ]
  },
  {
    id: "landing-optimization",
    title: "Landing Page Optimization",
    subtitle: "3.8% → 10%+ conversion rate",
    tasks: [
      { id: "lp-1", text: "Hero: Single benefit headline 'Schedule 30 days in 5 minutes'", completed: false },
      { id: "lp-2", text: "Remove navigation menu (loses 20-30% of visitors)", completed: false },
      { id: "lp-3", text: "Single CTA repeated 3x: hero, mid-page, footer", completed: false },
      { id: "lp-4", text: "Add 30-sec demo video (autoplaying, muted)", completed: false },
      { id: "lp-5", text: "Social proof: Live user count + star rating + testimonials", completed: false },
      { id: "lp-6", text: "Form: Email only (or Google SSO button)", completed: false },
      { id: "lp-7", text: "Load time under 2 seconds (every second = -7% conversion)", completed: false },
      { id: "lp-8", text: "Mobile-first design (60% of traffic is mobile)", completed: false },
      { id: "lp-9", text: "Add urgency: 'Limited beta spots remaining'", completed: false },
      { id: "lp-10", text: "FAQ section: Handle top 4 objections", completed: false },
    ]
  },
  {
    id: "metrics-tracking",
    title: "Weekly Metrics Review",
    subtitle: "Track these every week",
    tasks: [
      { id: "mt-1", text: "CTR by creative - kill anything below 0.5%", completed: false },
      { id: "mt-2", text: "CPC by audience - reallocate budget to winners", completed: false },
      { id: "mt-3", text: "Landing page CVR - A/B test if below 5%", completed: false },
      { id: "mt-4", text: "Email open rates - test subject lines if below 40%", completed: false },
      { id: "mt-5", text: "Trial→Paid rate - improve onboarding if below 15%", completed: false },
      { id: "mt-6", text: "CAC calculation - must be under $30 for profitability", completed: false },
      { id: "mt-7", text: "3-sec view rate on videos - fix hooks if below 50%", completed: false },
      { id: "mt-8", text: "Hook performance drops 37% after 7 days - refresh weekly", completed: false },
    ]
  },
]

const initialQuick10Sections: Section[] = [
  {
    id: "day1-setup",
    title: "Day 1: Critical Setup",
    subtitle: "Do these BEFORE anything else",
    budget: "$0",
    tasks: [
      { id: "d1-1", text: "REMOVE waitlist - enable direct free signup", completed: false },
      { id: "d1-2", text: "Add Google SSO button (reduces friction 30%)", completed: false },
      { id: "d1-3", text: "Create special offer: 50 free posts for first 100 users", completed: false },
      { id: "d1-4", text: "Set up basic 3-email welcome sequence", completed: false },
      { id: "d1-5", text: "Add urgency to landing: 'Only 47 beta spots left'", completed: false },
      { id: "d1-6", text: "Prepare $5 first month offer for conversions", completed: false },
    ]
  },
  {
    id: "week1-quick",
    title: "Week 1: Personal Network + UGC",
    subtitle: "Get first 3-4 customers (free)",
    budget: "$0",
    tasks: [
      { id: "q1-1", text: "List 30 people you know who create content/run business", completed: false },
      { id: "q1-2", text: "Send personalized voice message (not text) on WhatsApp/IG", completed: false },
      { id: "q1-3", text: "Offer: Free Pro forever if they record 30-sec testimonial", completed: false },
      { id: "q1-4", text: "Record 3 UGC videos yourself (hooks from Ads roadmap)", completed: false },
      { id: "q1-5", text: "Post UGC on TikTok + Instagram Reels (test hooks free)", completed: false },
      { id: "q1-6", text: "DM everyone who engages with your videos", completed: false },
      { id: "q1-7", text: "Convert 2-3 friends to paid with 50% lifetime discount", completed: false },
      { id: "q1-8", text: "Ask each paying customer to refer 2 friends (offer bonus)", completed: false },
      { id: "q1-9", text: "Post in r/SocialMediaMarketing, r/Entrepreneur (value first)", completed: false },
      { id: "q1-10", text: "Join 3 Discord/Slack communities for creators", completed: false },
    ]
  },
  {
    id: "week2-quick",
    title: "Week 2: Micro-Influencers + Communities",
    subtitle: "Get 4-5 more customers",
    budget: "$50-100",
    tasks: [
      { id: "q2-1", text: "Find 5 micro-influencers (5K-20K followers) in your niche", completed: false },
      { id: "q2-2", text: "DM offer: Free Pro forever + $20 if they post about it", completed: false },
      { id: "q2-3", text: "Get 3-5 authentic review videos/posts from influencers", completed: false },
      { id: "q2-4", text: "Share influencer content on your social (social proof)", completed: false },
      { id: "q2-5", text: "Post in 10 Facebook groups (answer questions, soft pitch)", completed: false },
      { id: "q2-6", text: "Answer 20 Quora questions about social media scheduling", completed: false },
      { id: "q2-7", text: "Create Twitter/X thread: 'How I schedule 30 days in 5 min'", completed: false },
      { id: "q2-8", text: "Run $50 TikTok boost on best-performing UGC video", completed: false },
      { id: "q2-9", text: "Retarget video viewers with signup offer (if budget allows)", completed: false },
      { id: "q2-10", text: "Convert 3-4 from influencer traffic + communities", completed: false },
    ]
  },
  {
    id: "week3-quick",
    title: "Week 3: Product Hunt + Final Push",
    subtitle: "Get final 3-4 customers to hit 10",
    budget: "$0-50",
    tasks: [
      { id: "q3-1", text: "Prepare Product Hunt launch (use testimonials from Week 1-2)", completed: false },
      { id: "q3-2", text: "Create 30-sec demo video showing the 'aha moment'", completed: false },
      { id: "q3-3", text: "Launch Tuesday-Thursday 12:01 AM PST", completed: false },
      { id: "q3-4", text: "Message 50 people to support on launch day", completed: false },
      { id: "q3-5", text: "Reply to EVERY PH comment within 5 minutes", completed: false },
      { id: "q3-6", text: "PH exclusive: First month free for all PH users", completed: false },
      { id: "q3-7", text: "Follow up with all trial users who haven't converted", completed: false },
      { id: "q3-8", text: "Offer $5 first month to hesitant users (time-limited)", completed: false },
      { id: "q3-9", text: "Post case study from first customers on LinkedIn", completed: false },
      { id: "q3-10", text: "Hit 10 paying customers - CELEBRATE then optimize", completed: false },
    ]
  },
  {
    id: "ugc-scripts",
    title: "UGC Video Scripts (Record These)",
    subtitle: "5 proven hooks - film on iPhone",
    tasks: [
      { id: "ugc-1", text: "Script 1: 'Still spending 8+ hours on social media every week?'", completed: false },
      { id: "ugc-2", text: "Script 2: 'I manage 5 brands. Here's my secret.'", completed: false },
      { id: "ugc-3", text: "Script 3: 'POV: You just scheduled 30 days of content'", completed: false },
      { id: "ugc-4", text: "Script 4: 'This replaced my $2000/month social media manager'", completed: false },
      { id: "ugc-5", text: "Script 5: 'Stop. If you're still posting manually...'", completed: false },
      { id: "ugc-6", text: "Keep videos 21-34 seconds, scene change every 2-3 sec", completed: false },
      { id: "ugc-7", text: "Add captions (85% watch muted)", completed: false },
      { id: "ugc-8", text: "End with clear CTA: 'Link in bio - it's free'", completed: false },
    ]
  },
  {
    id: "referral-program",
    title: "Referral Program Setup",
    subtitle: "$0 CAC when it works",
    tasks: [
      { id: "ref-1", text: "Create simple referral: Give 1 month free, Get 1 month free", completed: false },
      { id: "ref-2", text: "Generate unique referral links for each user", completed: false },
      { id: "ref-3", text: "Email all users about referral program", completed: false },
      { id: "ref-4", text: "Add referral prompt after user generates first content", completed: false },
      { id: "ref-5", text: "Track referrals - reward top referrers publicly", completed: false },
      { id: "ref-6", text: "Target: Each customer refers 0.5-1 new customers", completed: false },
    ]
  },
  {
    id: "email-basics",
    title: "Basic Email Sequence",
    subtitle: "Minimum emails to convert trials",
    tasks: [
      { id: "eml-1", text: "Email 1 (Day 0): Welcome + quick win in 60 seconds", completed: false },
      { id: "eml-2", text: "Email 2 (Day 2): Feature discovery (AI images or voiceover)", completed: false },
      { id: "eml-3", text: "Email 3 (Day 5): 'Your trial ends soon' + $5 offer", completed: false },
      { id: "eml-4", text: "Keep emails under 100 words, single CTA button", completed: false },
      { id: "eml-5", text: "Track open rates (target 40%+) and click rates (target 10%+)", completed: false },
    ]
  },
  {
    id: "conversion-tactics",
    title: "Conversion Tactics",
    subtitle: "Turn trials into paying customers",
    tasks: [
      { id: "cv-1", text: "Day 5 popup: 'You've created X posts! Unlock unlimited for $5'", completed: false },
      { id: "cv-2", text: "Scarcity: 'Only 23 beta spots at this price'", completed: false },
      { id: "cv-3", text: "Social proof: 'Join 847 creators already using POSTAIFY'", completed: false },
      { id: "cv-4", text: "Risk reversal: '7-day money-back guarantee'", completed: false },
      { id: "cv-5", text: "Personal touch: Reply to every support email within 2 hours", completed: false },
      { id: "cv-6", text: "Offer annual: $59/year (45% off) for committed users", completed: false },
    ]
  },
]

// Weekly metrics targets
const outreachWeeklyTargets = [
  { week: 1, reached: "1,500-2,000", conversations: "100-150", trials: "20-40", paid: "3-8", revenue: "$21-56" },
  { week: 2, reached: "3,500-4,500", conversations: "250-350", trials: "50-80", paid: "10-20", revenue: "$70-140" },
  { week: 3, reached: "6,000-7,000", conversations: "400-550", trials: "80-120", paid: "20-35", revenue: "$140-245" },
  { week: 4, reached: "8,000-10,000", conversations: "600-800", trials: "120-180", paid: "35-60", revenue: "$245-420" },
]

const adsWeeklyTargets = [
  { week: 1, reached: "50k-100k views", adSpend: "$300", impressions: "100k-150k", trials: "50-80", paid: "10-16", revenue: "$90-144" },
  { week: 2, reached: "150k-250k views", adSpend: "$400", impressions: "200k-300k", trials: "120-180", paid: "25-40", revenue: "$225-360" },
  { week: 3, reached: "300k-450k views", adSpend: "$600", impressions: "350k-500k", trials: "200-300", paid: "45-70", revenue: "$405-630" },
  { week: 4, reached: "500k-700k views", adSpend: "$700", impressions: "500k-700k", trials: "300-450", paid: "70-120", revenue: "$630-1,080" },
]

export function RoadmapPage() {
  const [roadmapType, setRoadmapType] = useState<RoadmapType>(() => {
    const saved = localStorage.getItem("postaify-selected-roadmap")
    return (saved as RoadmapType) || "outreach"
  })

  const [outreachSections, setOutreachSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem("postaify-roadmap-outreach-v3")
    if (saved) {
      return JSON.parse(saved)
    }
    return initialOutreachSections
  })

  const [adsSections, setAdsSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem("postaify-roadmap-ads-v3")
    if (saved) {
      return JSON.parse(saved)
    }
    return initialAdsSections
  })

  const [quick10Sections, setQuick10Sections] = useState<Section[]>(() => {
    const saved = localStorage.getItem("postaify-roadmap-quick10-v3")
    if (saved) {
      return JSON.parse(saved)
    }
    return initialQuick10Sections
  })

  const sections = roadmapType === "outreach" ? outreachSections : roadmapType === "ads" ? adsSections : quick10Sections
  const setSections = roadmapType === "outreach" ? setOutreachSections : roadmapType === "ads" ? setAdsSections : setQuick10Sections
  const weeklyTargets = roadmapType === "outreach" ? outreachWeeklyTargets : roadmapType === "ads" ? adsWeeklyTargets : []

  useEffect(() => {
    localStorage.setItem("postaify-roadmap-outreach-v3", JSON.stringify(outreachSections))
  }, [outreachSections])

  useEffect(() => {
    localStorage.setItem("postaify-roadmap-ads-v3", JSON.stringify(adsSections))
  }, [adsSections])

  useEffect(() => {
    localStorage.setItem("postaify-roadmap-quick10-v3", JSON.stringify(quick10Sections))
  }, [quick10Sections])

  useEffect(() => {
    localStorage.setItem("postaify-selected-roadmap", roadmapType)
  }, [roadmapType])

  const toggleTask = (sectionId: string, taskId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          tasks: section.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed }
            }
            return task
          })
        }
      }
      return section
    }))
  }

  const resetProgress = () => {
    const roadmapName = roadmapType === "outreach" ? "Outreach" : roadmapType === "ads" ? "Ads" : "Quick 10"
    if (confirm(`Reset ${roadmapName} roadmap progress? This cannot be undone.`)) {
      if (roadmapType === "outreach") {
        setOutreachSections(initialOutreachSections)
      } else if (roadmapType === "ads") {
        setAdsSections(initialAdsSections)
      } else {
        setQuick10Sections(initialQuick10Sections)
      }
    }
  }

  const totalTasks = sections.reduce((acc, s) => acc + s.tasks.length, 0)
  const completedTasks = sections.reduce((acc, s) => acc + s.tasks.filter(t => t.completed).length, 0)
  const progressPercent = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold">POSTAIFY</a>
            <Badge variant="outline">30-Day Revenue Plan</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={resetProgress}>
            Reset Progress
          </Button>
        </div>
      </header>

      {/* Roadmap Selector */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setRoadmapType("outreach")}
            className={`p-4 rounded-lg border-2 transition-all ${
              roadmapType === "outreach"
                ? "border-primary bg-primary/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <h3 className="font-semibold mb-1">Roadmap 1: Outreach</h3>
            <p className="text-sm text-muted-foreground">LinkedIn + Cold Email</p>
            <p className="text-xs text-muted-foreground mt-1">Target: $250-420 MRR</p>
          </button>
          <button
            onClick={() => setRoadmapType("ads")}
            className={`p-4 rounded-lg border-2 transition-all ${
              roadmapType === "ads"
                ? "border-primary bg-primary/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <h3 className="font-semibold mb-1">Roadmap 2: TikTok Ads</h3>
            <p className="text-sm text-muted-foreground">UGC + Retargeting Strategy</p>
            <p className="text-xs text-muted-foreground mt-1">Budget: $2K | Target: $630-1,080 MRR</p>
          </button>
          <button
            onClick={() => setRoadmapType("quick10")}
            className={`p-4 rounded-lg border-2 transition-all ${
              roadmapType === "quick10"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <h3 className="font-semibold mb-1">Roadmap 3: Quick 10</h3>
            <p className="text-sm text-muted-foreground">UGC + Influencers + Referrals</p>
            <p className="text-xs text-emerald-400 mt-1">Budget: $0-100 | Target: 10 customers in 3 weeks</p>
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          key={roadmapType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            {roadmapType === "quick10" ? "Quick 10 Customers" : "30-Day"} <span className="text-primary">
              {roadmapType === "outreach" ? "Outreach" : roadmapType === "ads" ? "Ads & Social Media" : "Flippa Exit"}
            </span> Roadmap
          </h1>
          <p className="text-muted-foreground mb-2">
            {roadmapType === "outreach"
              ? "6 hours/day = 180 hours of focused sales work (LinkedIn + Cold Email)"
              : roadmapType === "ads"
              ? "4-6 hours/day = Paid ads + organic content (Instagram, TikTok, YouTube, Blog)"
              : "2-3 weeks to get 10 paying customers with $0-100 budget"
            }
          </p>
          <p className="text-xl font-semibold text-primary">
            {roadmapType === "outreach"
              ? "Expected outcome: $350-700 revenue + $250-420 MRR"
              : roadmapType === "ads"
              ? "Expected outcome: $500-900 revenue + $350-560 MRR (paid + organic traffic)"
              : "Goal: 10 customers = $70-150 MRR → Sell on Flippa for $800-$3,600"
            }
          </p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center mt-3 text-2xl font-bold text-primary">{progressPercent}%</p>
          </Card>
        </motion.div>

        {/* The Math */}
        <motion.div
          key={`math-${roadmapType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="p-6 border-primary/50">
            <h2 className="text-xl font-semibold mb-4">
              {roadmapType === "outreach"
                ? "The Math: 180 Hours"
                : roadmapType === "ads"
                ? "The Math: 120-180 Hours + $1,800 Ad Budget"
                : "The Math: Just Get 10 Customers"
              }
            </h2>
            {roadmapType === "quick10" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">10</p>
                  <p className="text-sm text-muted-foreground">Target Customers</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">2-3</p>
                  <p className="text-sm text-muted-foreground">Weeks</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">$0-100</p>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">$70-150</p>
                  <p className="text-sm text-muted-foreground">MRR Goal</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">{roadmapType === "outreach" ? "6h" : "4-6h"}</p>
                  <p className="text-sm text-muted-foreground">Daily</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">{roadmapType === "outreach" ? "180h" : "150h"}</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">{roadmapType === "outreach" ? "10K" : "25K"}</p>
                  <p className="text-sm text-muted-foreground">People Reached</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold">{roadmapType === "outreach" ? "$400" : "$500"}</p>
                  <p className="text-sm text-muted-foreground">Expected MRR</p>
                </div>
              </div>
            )}
            {roadmapType === "quick10" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Personal network</span>
                  <span className="font-medium">3-5 customers</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Product Hunt</span>
                  <span className="font-medium">2-5 customers</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Communities</span>
                  <span className="font-medium">2-3 customers</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Total budget</span>
                  <span className="font-medium">$0-100</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-medium">2-3 weeks</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Flippa value</span>
                  <span className="font-medium">$800-$3,600</span>
                </div>
              </div>
            ) : roadmapType === "outreach" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">LinkedIn requests</span>
                  <span className="font-medium">2,000-2,500</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Cold emails</span>
                  <span className="font-medium">5,000-7,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Conversations</span>
                  <span className="font-medium">600-800</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Trials</span>
                  <span className="font-medium">120-180</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Paid customers</span>
                  <span className="font-medium">35-60</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Content pieces</span>
                  <span className="font-medium">60-90</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Total ad spend</span>
                  <span className="font-medium">$1,800</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Paid impressions</span>
                  <span className="font-medium">450k-600k</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Organic reach</span>
                  <span className="font-medium">200k-350k</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Content pieces</span>
                  <span className="font-medium">300-400</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Trials</span>
                  <span className="font-medium">180-250</span>
                </div>
                <div className="flex justify-between p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">Paid customers</span>
                  <span className="font-medium">50-80</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Weekly Targets Table */}
        <motion.div
          key={`targets-${roadmapType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Targets</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2">Week</th>
                    <th className="text-left py-3 px-2">Reached</th>
                    {roadmapType === "outreach" ? (
                      <th className="text-left py-3 px-2">Conversations</th>
                    ) : (
                      <>
                        <th className="text-left py-3 px-2">Ad Spend</th>
                        <th className="text-left py-3 px-2">Impressions</th>
                      </>
                    )}
                    <th className="text-left py-3 px-2">Trials</th>
                    <th className="text-left py-3 px-2">Paid</th>
                    <th className="text-left py-3 px-2 text-primary">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyTargets.map((w) => (
                    <tr key={w.week} className="border-b border-white/5">
                      <td className="py-3 px-2 font-medium">Week {w.week}</td>
                      <td className="py-3 px-2">{w.reached}</td>
                      {roadmapType === "outreach" ? (
                        <td className="py-3 px-2">{"conversations" in w ? w.conversations : ""}</td>
                      ) : (
                        <>
                          <td className="py-3 px-2">{"adSpend" in w ? w.adSpend : ""}</td>
                          <td className="py-3 px-2">{"impressions" in w ? w.impressions : ""}</td>
                        </>
                      )}
                      <td className="py-3 px-2">{w.trials}</td>
                      <td className="py-3 px-2">{w.paid}</td>
                      <td className="py-3 px-2 text-primary font-semibold">{w.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Probability Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Realistic Probabilities</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 text-right text-sm text-muted-foreground">5%</div>
                <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-red-500/50 w-[5%] flex items-center justify-end pr-2">
                    <span className="text-xs">$0-100</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-right text-sm text-muted-foreground">25%</div>
                <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-yellow-500/50 w-[25%] flex items-center justify-end pr-2">
                    <span className="text-xs">$100-250</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-right text-sm text-muted-foreground">40%</div>
                <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-primary/50 w-[40%] flex items-center justify-end pr-2">
                    <span className="text-xs font-medium">$250-400 (Expected)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-right text-sm text-muted-foreground">20%</div>
                <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-green-500/50 w-[20%] flex items-center justify-end pr-2">
                    <span className="text-xs">$400-600</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-right text-sm text-muted-foreground">10%</div>
                <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500/50 w-[10%] flex items-center justify-end pr-2">
                    <span className="text-xs">$600+</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Channel Breakdown */}
        <motion.div
          key={`channels-${roadmapType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue by Channel</h2>
            {roadmapType === "outreach" ? (
              <div className="space-y-4">
                <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">LinkedIn (35%)</span>
                  <span className="text-sm text-primary">$140-210</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[35%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Cold Email (35%)</span>
                  <span className="text-sm text-primary">$105-175</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[35%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Reddit/Communities (15%)</span>
                  <span className="text-sm text-primary">$35-70</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[15%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Content/Inbound (10%)</span>
                  <span className="text-sm text-primary">$21-56</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[10%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Referrals (5%)</span>
                  <span className="text-sm text-primary">$14-35</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 w-[5%]" />
                </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Paid Ads (50%)</span>
                    <span className="text-sm text-primary">$175-280</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[50%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Instagram Organic (20%)</span>
                    <span className="text-sm text-primary">$70-112</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 w-[20%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">TikTok Organic (15%)</span>
                    <span className="text-sm text-primary">$52-84</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[15%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">YouTube/SEO (10%)</span>
                    <span className="text-sm text-primary">$35-56</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[10%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Influencers (5%)</span>
                    <span className="text-sm text-primary">$17-28</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[5%]" />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Influencer Partnership Guide - Only for Ads */}
        {roadmapType === "ads" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <Card className="p-6 border-yellow-500/50">
              <h2 className="text-xl font-semibold mb-2">10 Micro-Influencer Partnership Strategy</h2>
              <p className="text-sm text-muted-foreground mb-6">Offer: $50 upfront + 20% of MRR from their referrals</p>

              {/* How to Find Them */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Where to Find Micro-Influencers (5k-50k followers):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="font-semibold mb-2 text-blue-400">Instagram Search:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• #socialmediamanager (2M+ posts)</li>
                      <li>• #contentcreator (50M+ posts)</li>
                      <li>• #socialmediatips (500k+ posts)</li>
                      <li>• Filter: 5k-50k followers</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="font-semibold mb-2 text-pink-400">TikTok Search:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• "social media tips"</li>
                      <li>• "content creator hacks"</li>
                      <li>• Filter: 10k-100k followers</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Target Profiles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">10 Target Influencer Types:</h3>
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p>1. Social media management tips</p>
                    <p>2. Content creation tutorials</p>
                    <p>3. Instagram growth strategies</p>
                    <p>4. Freelance social media managers</p>
                    <p>5. Digital marketing coaches</p>
                    <p>6. Agency owners (1-5 employees)</p>
                    <p>7. Content repurposing educators</p>
                    <p>8. LinkedIn creators</p>
                    <p>9. "Productivity for creators" niche</p>
                    <p>10. Small business marketing</p>
                  </div>
                </div>
              </div>

              {/* Deal Structure */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Partnership Deal:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                    <p className="font-semibold mb-2 text-emerald-400">Upfront</p>
                    <p className="text-2xl font-bold">$50</p>
                    <p className="text-xs text-muted-foreground">Per influencer</p>
                  </div>
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                    <p className="font-semibold mb-2 text-yellow-400">Recurring</p>
                    <p className="text-2xl font-bold">20% MRR</p>
                    <p className="text-xs text-muted-foreground">From referrals</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                    <p className="font-semibold mb-2 text-blue-400">Expected</p>
                    <p className="text-2xl font-bold">5-15</p>
                    <p className="text-xs text-muted-foreground">Customers each</p>
                  </div>
                </div>
              </div>

              {/* Math */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Revenue Math:</h3>
                <div className="bg-white/5 rounded-lg p-4 text-sm">
                  <p className="mb-2"><span className="font-semibold text-primary">10 customers per influencer</span> × $7/mo = $70 MRR</p>
                  <p className="mb-2">Your 80% = <span className="font-semibold text-primary">$56/month</span></p>
                  <p className="mb-2">Influencer 20% = $14/month</p>
                  <p className="text-xs text-muted-foreground pt-3 border-t border-white/10">10 influencers × 10 customers = 100 customers = $560 MRR for you</p>
                </div>
              </div>

              {/* Outreach */}
              <div>
                <h3 className="text-lg font-semibold mb-3">DM Template:</h3>
                <div className="bg-white/5 rounded-lg p-4 text-sm">
                  <p className="mb-2">Hey [Name]! Love your content on [topic].</p>
                  <p className="mb-2">I built POSTAIFY - auto-generates social posts for Instagram, TikTok, LinkedIn from one input.</p>
                  <p className="mb-2 font-semibold">Partnership offer: $50 upfront + 20% monthly recurring from referrals (forever).</p>
                  <p className="mb-2">If 10 followers sign up ($7/mo), you earn $14/month passive + $50 upfront.</p>
                  <p>Interested? I can send demo + custom promo code.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Templates Section - Only for Outreach */}
        {roadmapType === "outreach" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8 space-y-6"
          >
            {/* Cold Email Template */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Cold Email Templates</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Email 1 - Day 0 (The Opener)</p>
                <p className="text-sm text-muted-foreground mb-1">Subject: Quick question about [Company]'s content workflow</p>
                <hr className="border-white/10 my-2" />
                <div className="text-sm space-y-2">
                  <p>Hi [Name],</p>
                  <p>Saw [Company] manages social content for multiple clients.</p>
                  <p>Quick question - how much time does your team spend creating platform-specific post variations each week?</p>
                  <p>Built something that does this in 60 seconds (YouTube video → 10 posts for Instagram, Twitter, LinkedIn, TikTok).</p>
                  <p>Worth a 5-minute look?</p>
                  <p>[Your name]</p>
                  <p className="text-muted-foreground">P.S. Happy to give you free Pro access to test with one client.</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Email 2 - Day 3 (Follow Up)</p>
                <p className="text-sm text-muted-foreground mb-1">Subject: Re: Quick question about [Company]'s content workflow</p>
                <hr className="border-white/10 my-2" />
                <div className="text-sm space-y-2">
                  <p>Hi [Name],</p>
                  <p>Wanted to bump this up - know you're busy.</p>
                  <p>Here's a 60-second demo if easier than reading: [Loom link]</p>
                  <p>If not relevant, no worries - just let me know and I'll stop bothering you.</p>
                  <p>[Your name]</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Email 3 - Day 7 (Breakup)</p>
                <p className="text-sm text-muted-foreground mb-1">Subject: Should I close your file?</p>
                <hr className="border-white/10 my-2" />
                <div className="text-sm space-y-2">
                  <p>Hi [Name],</p>
                  <p>Haven't heard back so I'll assume the timing isn't right.</p>
                  <p>If you ever need to speed up content creation for your clients, the offer for free Pro access stands.</p>
                  <p>No hard feelings either way.</p>
                  <p>[Your name]</p>
                </div>
              </div>
            </div>
          </Card>

          {/* LinkedIn Templates */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">LinkedIn Message Templates</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Connection Request (max 300 chars)</p>
                <p className="text-sm">Hi [Name], saw you manage social media at [Company]. Always looking to connect with others in the content space. - [Your name]</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">First Message (After Accept)</p>
                <div className="text-sm space-y-2">
                  <p>Thanks for connecting [Name]!</p>
                  <p>Quick question - how much time do you/your team spend creating platform-specific versions of content each week?</p>
                  <p>Curious because I've been working on something in this space.</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Soft Pitch (After They Reply)</p>
                <div className="text-sm space-y-2">
                  <p>Totally get it. That's actually why I built POSTAIFY - it generates posts for Instagram, Twitter, LinkedIn, TikTok from a single input in about 60 seconds.</p>
                  <p>Would you want to try it free for 2 weeks? No strings.</p>
                  <p>Could save you a few hours per week at minimum.</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Follow Up (Day 4)</p>
                <p className="text-sm">Hey [Name], no pressure at all - just wanted to bump this in case it got buried. If it's not the right time, totally understand. The offer stands whenever.</p>
              </div>
            </div>
          </Card>

          {/* LinkedIn Profile */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">LinkedIn Profile Setup</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Headline</p>
                <p className="text-sm">Helping agencies automate social content | POSTAIFY</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">About Section</p>
                <div className="text-sm space-y-2">
                  <p>I help social media managers and agencies save 10+ hours/week on content creation.</p>
                  <p>Built POSTAIFY after spending years manually creating the same post 5 different ways for different platforms.</p>
                  <p>Now one input → posts for Instagram, Twitter, LinkedIn, TikTok in 60 seconds.</p>
                  <p className="text-primary">DM me for free access.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Twitter Posts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Twitter/LinkedIn Post Templates</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Launch Post</p>
                <p className="text-sm">I built a tool that turns YouTube videos into 10 social posts in 60 seconds.</p>
                <p className="text-sm mt-2">First 20 people to reply get free Pro access for a month.</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Pain Point Post</p>
                <p className="text-sm">Social media managers spend 10 hours/week on content creation.</p>
                <p className="text-sm mt-2">I cut that to 30 minutes. Here's how: [thread]</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-primary mb-2">Demo Post</p>
                <p className="text-sm">POV: You're a content creator who just discovered AI automation</p>
                <p className="text-sm mt-2 text-muted-foreground">[Attach 30-second screen recording of POSTAIFY]</p>
              </div>
            </div>
          </Card>
          </motion.div>
        )}

        {/* Task Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const sectionCompleted = section.tasks.filter(t => t.completed).length
            const sectionTotal = section.tasks.length
            const sectionPercent = Math.round((sectionCompleted / sectionTotal) * 100)

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * sectionIndex }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-semibold">{section.title}</h2>
                        {section.budget && (
                          <Badge variant="secondary">{section.budget}</Badge>
                        )}
                      </div>
                      {section.subtitle && (
                        <p className="text-muted-foreground text-sm">{section.subtitle}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{sectionPercent}%</p>
                      <p className="text-xs text-muted-foreground">{sectionCompleted}/{sectionTotal}</p>
                    </div>
                  </div>

                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${sectionPercent}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {section.tasks.map((task) => (
                      <label
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          task.completed
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-white/5 hover:bg-white/10 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(section.id, task.id)}
                          className="mt-0.5 w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-primary checked:border-primary cursor-pointer"
                        />
                        <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Budget Breakdown */}
        <motion.div
          key={`budget-${roadmapType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {roadmapType === "outreach" ? "Budget: $50" : "Budget: $1,800"}
            </h2>
            {roadmapType === "outreach" ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$10</p>
                  <p className="text-xs text-muted-foreground">Cold domain</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$30</p>
                  <p className="text-xs text-muted-foreground">Twitter Ads</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$10</p>
                  <p className="text-xs text-muted-foreground">TikTok Ads</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$0</p>
                  <p className="text-xs text-muted-foreground">Brevo (free)</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$0</p>
                  <p className="text-xs text-muted-foreground">Apollo (free)</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$200</p>
                  <p className="text-xs text-muted-foreground">Week 1 Ads</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$300</p>
                  <p className="text-xs text-muted-foreground">Week 2 Ads</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$500</p>
                  <p className="text-xs text-muted-foreground">Week 3 Ads</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xl font-bold">$800</p>
                  <p className="text-xs text-muted-foreground">Week 4 Ads</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Useful Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tools & Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="https://apollo.io" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">Apollo.io</p>
                <p className="text-xs text-muted-foreground">Lead scraping (free)</p>
              </a>
              <a href="https://brevo.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">Brevo</p>
                <p className="text-xs text-muted-foreground">Email (300/day free)</p>
              </a>
              <a href="https://hunter.io" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">Hunter.io</p>
                <p className="text-xs text-muted-foreground">Email finder (free)</p>
              </a>
              <a href="https://loom.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">Loom</p>
                <p className="text-xs text-muted-foreground">Demo videos (free)</p>
              </a>
              <a href="https://ads.twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">Twitter Ads</p>
                <p className="text-xs text-muted-foreground">$30 campaign</p>
              </a>
              <a href="https://ads.tiktok.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">TikTok Ads</p>
                <p className="text-xs text-muted-foreground">$10 campaign</p>
              </a>
              <a href="https://appsumo.com/partners" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">AppSumo</p>
                <p className="text-xs text-muted-foreground">Lifetime deals</p>
              </a>
              <a href="https://namecheap.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition text-center">
                <p className="font-medium">Namecheap</p>
                <p className="text-xs text-muted-foreground">Cold domain $10</p>
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Month 2+ Projection */}
        <motion.div
          key={`projection-${roadmapType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6 border-primary/50">
            <h2 className="text-xl font-semibold mb-4">What Happens Next (Month 2+)</h2>
            {roadmapType === "outreach" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End of Month 1</p>
                  <p className="text-2xl font-bold text-primary">$300+ MRR</p>
                  <p className="text-xs text-muted-foreground">35-60 customers</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End of Month 2</p>
                  <p className="text-2xl font-bold text-primary">$550-800 MRR</p>
                  <p className="text-xs text-muted-foreground">Pipeline converts + new</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End of Month 3</p>
                  <p className="text-2xl font-bold text-primary">$1,000+ MRR</p>
                  <p className="text-xs text-muted-foreground">Compounding effect</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End of Month 1</p>
                  <p className="text-2xl font-bold text-primary">$500+ MRR</p>
                  <p className="text-xs text-muted-foreground">50-80 customers</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End of Month 2</p>
                  <p className="text-2xl font-bold text-primary">$900-1,200 MRR</p>
                  <p className="text-xs text-muted-foreground">Scale ads + retargeting</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End of Month 3</p>
                  <p className="text-2xl font-bold text-primary">$1,500+ MRR</p>
                  <p className="text-xs text-muted-foreground">Optimized funnels</p>
                </div>
              </div>
            )}
            <p className="text-center text-muted-foreground text-sm mt-6">
              {roadmapType === "outreach"
                ? "The first month is the hardest. The engine you build keeps paying."
                : "As you optimize your ads, CPA drops and ROAS increases exponentially."
              }
            </p>
          </Card>
        </motion.div>

        {/* 10 Customer Flippa Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6 border-blue-500/50">
            <h2 className="text-xl font-semibold mb-2">10 Customer Flippa Exit Plan</h2>
            <p className="text-sm text-muted-foreground mb-6">Minimal viable approach: Get 10 customers, build MRR, sell quickly</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Budget Required */}
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <h3 className="text-sm font-semibold mb-3 text-blue-400">Budget Needed</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimal (outreach only)</span>
                    <span className="font-semibold">$0-20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Small ads boost</span>
                    <span className="font-semibold">$100-200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aggressive ads</span>
                    <span className="font-semibold">$300-500</span>
                  </div>
                </div>
              </div>

              {/* Revenue Scenarios */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-semibold mb-3">10 Customers MRR</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">All on Basic ($7)</span>
                    <span className="font-semibold text-primary">$70/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mix (avg $10)</span>
                    <span className="font-semibold text-primary">$100/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Most Pro (avg $15)</span>
                    <span className="font-semibold text-primary">$150/mo</span>
                  </div>
                </div>
              </div>

              {/* Flippa Value */}
              <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <h3 className="text-sm font-semibold mb-3 text-emerald-400">Flippa Sale Price</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">$70 MRR ($840 ARR)</span>
                    <span className="font-semibold text-emerald-400">$800-1,700</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">$100 MRR ($1,200 ARR)</span>
                    <span className="font-semibold text-emerald-400">$1,200-2,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">$150 MRR ($1,800 ARR)</span>
                    <span className="font-semibold text-emerald-400">$1,800-3,600</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Path */}
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30 mb-4">
              <h3 className="text-sm font-semibold mb-3 text-blue-400">Recommended Path to 10 Customers:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Week 1-2: Free Outreach ($0)</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• 500 LinkedIn connections</li>
                    <li>• 1,000 cold emails (Brevo free)</li>
                    <li>• Post daily on Twitter/LinkedIn</li>
                    <li>• Reddit/communities (5-10 posts)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Week 3-4: Small Ads ($100-200)</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Facebook ads: $100 (10-20 trials)</li>
                    <li>• Follow up with ALL leads</li>
                    <li>• Offer lifetime deals for urgency</li>
                    <li>• Convert 10 customers → DONE</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reality Check */}
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
              <h3 className="text-sm font-semibold mb-2 text-yellow-400">⚠️ Reality Check:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 10 customers in 1-2 months is achievable with hustle</li>
                <li>• Flippa sale price: $800-$3,600 (depends on MRR + age)</li>
                <li>• Buyers want 3+ months of consistent MRR history</li>
                <li>• You'll need proof: Stripe dashboard, customer list, churn rate</li>
                <li>• <span className="text-yellow-400 font-semibold">Best strategy:</span> Get 10 customers fast, run for 3-6 months, then sell (better multiple)</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Quick flip timeline:</span> 2 months to get customers + 3 months history = 5 months total to sale
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Flippa Valuation */}
        <motion.div
          key={`flippa-${roadmapType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6 border-emerald-500/50">
            <h2 className="text-xl font-semibold mb-2">Flippa Exit Value</h2>
            <p className="text-sm text-muted-foreground mb-6">SaaS multiples: 3-5x ARR for established businesses</p>

            {roadmapType === "outreach" ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg text-center border border-red-500/30">
                  <p className="text-xs text-muted-foreground mb-1">Month 1</p>
                  <p className="text-sm font-medium mb-1">$350 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$4,200 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-red-400">$4k-$8k</p>
                    <p className="text-xs text-muted-foreground">1-2x (Too early)</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center border border-yellow-500/30">
                  <p className="text-xs text-muted-foreground mb-1">Month 3</p>
                  <p className="text-sm font-medium mb-1">$1,000 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$12,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-yellow-400">$24k-$36k</p>
                    <p className="text-xs text-muted-foreground">2-3x (Growing)</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Month 6</p>
                  <p className="text-sm font-medium mb-1">$1,500 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$18,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-primary">$54k-$72k</p>
                    <p className="text-xs text-muted-foreground">3-4x (Proven)</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center border border-emerald-500/50">
                  <p className="text-xs text-muted-foreground mb-1">Month 12</p>
                  <p className="text-sm font-medium mb-1">$2,500 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$30,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-emerald-400">$90k-$150k</p>
                    <p className="text-xs text-muted-foreground">3-5x (Strong)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg text-center border border-red-500/30">
                  <p className="text-xs text-muted-foreground mb-1">Month 1</p>
                  <p className="text-sm font-medium mb-1">$500 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$6,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-red-400">$6k-$12k</p>
                    <p className="text-xs text-muted-foreground">1-2x (Too early)</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center border border-yellow-500/30">
                  <p className="text-xs text-muted-foreground mb-1">Month 3</p>
                  <p className="text-sm font-medium mb-1">$1,500 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$18,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-yellow-400">$36k-$54k</p>
                    <p className="text-xs text-muted-foreground">2-3x (Growing)</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Month 6</p>
                  <p className="text-sm font-medium mb-1">$2,500 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$30,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-primary">$90k-$120k</p>
                    <p className="text-xs text-muted-foreground">3-4x (Proven)</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center border border-emerald-500/50">
                  <p className="text-xs text-muted-foreground mb-1">Month 12</p>
                  <p className="text-sm font-medium mb-1">$4,000 MRR</p>
                  <p className="text-xs text-muted-foreground mb-2">$48,000 ARR</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-lg font-bold text-emerald-400">$144k-$240k</p>
                    <p className="text-xs text-muted-foreground">3-5x (Strong)</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
              <h3 className="text-sm font-semibold mb-3">What Increases Your Multiple:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Low churn rate (&lt; 5% monthly)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>High profit margins (&gt; 60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Consistent MoM growth</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Diverse customer base</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Automated processes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Annual plans (lower churn)</span>
                </div>
              </div>
            </div>

            <p className="text-center text-muted-foreground text-sm mt-4">
              <span className="text-emerald-400 font-semibold">Recommendation:</span> Build to Month 6-12 for best exit multiple
            </p>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Progress saves automatically to your browser</p>
          <p className="mt-1 text-primary">Execute daily. Trust the process. The math works.</p>
        </div>
      </main>
    </div>
  )
}
