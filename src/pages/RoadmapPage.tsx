import { motion } from "framer-motion"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

export function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Day-One Revenue Strategy</h1>
          <p className="text-muted-foreground text-sm">Fastest path to generating money with POSTAIFY</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 border-primary/50 bg-primary/5">
            <h2 className="text-3xl font-bold mb-4">Launch with Paid-First Motion</h2>
            <p className="text-muted-foreground mb-6">
              Your pricing is already set (Pro $19/mo, Agency $49/mo). Here's the fastest path:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 shrink-0">Action 1</Badge>
                <div>
                  <p className="font-semibold">Turn off or limit free tier</p>
                  <p className="text-sm text-muted-foreground">FREE plan gives 20 posts/month which is generous. Consider reducing to 5 posts or 7-day trial</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 shrink-0">Action 2</Badge>
                <div>
                  <p className="font-semibold">Add friction to free</p>
                  <p className="text-sm text-muted-foreground">Require credit card upfront with trial (increases conversion 2-3x)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 shrink-0">Action 3</Badge>
                <div>
                  <p className="font-semibold">Gate high-value features</p>
                  <p className="text-sm text-muted-foreground">Image generation, voiceover, and video repurpose are already gated - good</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pre-Launch Email Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Pre-Launch Email Capture → Paid</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Email Strategy</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Collect emails with "early access" promise</li>
                  <li>Offer launch discount (30% off first 3 months)</li>
                  <li>Create urgency (limited spots, price increases)</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Launch Offer Structure</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span>Early bird Pro</span>
                    <span className="text-primary font-medium">$13/mo (vs $19) - first 100</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span>Founder's Agency</span>
                    <span className="text-primary font-medium">$34/mo (vs $49) - first 50</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span>Bonus</span>
                    <span className="text-primary font-medium">Lock price forever if first week</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Fastest Revenue Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Fastest Revenue Channels</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 font-semibold">Channel</th>
                    <th className="text-left py-3 px-2 font-semibold">Time to Revenue</th>
                    <th className="text-left py-3 px-2 font-semibold">CAC</th>
                    <th className="text-left py-3 px-2 font-semibold">Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2 font-medium text-primary">AppSumo</td>
                    <td className="py-3 px-2">1-2 weeks</td>
                    <td className="py-3 px-2">$0 (rev share)</td>
                    <td className="py-3 px-2 text-muted-foreground">Instant audience, validates pricing</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2 font-medium text-primary">Product Hunt</td>
                    <td className="py-3 px-2">1 day</td>
                    <td className="py-3 px-2">$0</td>
                    <td className="py-3 px-2 text-muted-foreground">Free traffic spike, credibility</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2 font-medium text-primary">LinkedIn Organic</td>
                    <td className="py-3 px-2">Same day</td>
                    <td className="py-3 px-2">$0</td>
                    <td className="py-3 px-2 text-muted-foreground">Your ICP lives here</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2 font-medium text-primary">Cold Email</td>
                    <td className="py-3 px-2">3-5 days</td>
                    <td className="py-3 px-2">~$50</td>
                    <td className="py-3 px-2 text-muted-foreground">Direct to agencies/creators</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-medium text-primary">Micro-influencers</td>
                    <td className="py-3 px-2">1 week</td>
                    <td className="py-3 px-2">$100-300</td>
                    <td className="py-3 px-2 text-muted-foreground">Creator/SMM niche</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* LinkedIn Organic Playbook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-2">LinkedIn Organic Playbook (Free, Fast)</h2>
            <p className="text-muted-foreground mb-6">Target: Social media managers, content creators, small agencies</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Post Framework (daily for 30 days)</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-white/5 rounded">
                    <span className="text-primary font-medium">Day 1:</span> "I spent 8 hours on social media. Now I spend 5 minutes. Here's how..."
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <span className="text-primary font-medium">Day 2:</span> Build in public - show feature development
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <span className="text-primary font-medium">Day 3:</span> Share a win (beta user result)
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <span className="text-primary font-medium">Day 4:</span> Hot take on AI content
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <span className="text-primary font-medium">Day 5:</span> Tutorial/how-to thread
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">DM Strategy</h3>
                <ol className="space-y-3 text-sm list-decimal list-inside">
                  <li className="text-muted-foreground">Engage with SMM content for 3-5 days</li>
                  <li className="text-muted-foreground">Send value-first DM: "Saw your post about [X]. We built something that might help..."</li>
                  <li className="text-muted-foreground">Offer free Pro trial (14 days, no CC)</li>
                </ol>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick-Win Paid Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 border-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Quick-Win Paid Strategy</h2>
              <Badge className="bg-primary text-primary-foreground">$500 Budget</Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Google Ads</h3>
                  <Badge variant="outline">40% - $200</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">High Intent Keywords:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• "AI social media scheduler"</li>
                  <li>• "AI content generator for social media"</li>
                  <li>• "automate social media posts"</li>
                </ul>
                <p className="text-xs mt-3 text-primary">Expected: 50-100 clicks, 3-5 trials, 1-2 customers</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">LinkedIn Ads</h3>
                  <Badge variant="outline">40% - $200</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Audience:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Social Media Manager, Content Creator</li>
                  <li>• Company size: 1-50</li>
                  <li>• Interest: Hootsuite, Buffer, Later</li>
                </ul>
                <p className="text-xs mt-3 text-primary">Expected: 15-25 leads, 2-3 customers</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Retargeting</h3>
                  <Badge variant="outline">20% - $100</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Target:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Website visitors who didn't convert</li>
                  <li>• Pricing page abandonment</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Founder-Led Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-2">Founder-Led Sales (Highest Conversion)</h2>
            <p className="text-muted-foreground mb-6">For your first 10-20 customers:</p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-3xl mb-2">1</p>
                <p className="font-semibold mb-1">Offer personal onboarding</p>
                <p className="text-sm text-muted-foreground">"I'll set up your first brand and 10 posts"</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-3xl mb-2">2</p>
                <p className="font-semibold mb-1">Money-back guarantee</p>
                <p className="text-sm text-muted-foreground">"If you don't save 5+ hours/week, full refund"</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-3xl mb-2">3</p>
                <p className="font-semibold mb-1">Annual discount</p>
                <p className="text-sm text-muted-foreground">2 months free (locks in revenue, reduces churn)</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pricing Psychology Fixes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Pricing Psychology Fixes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                <span className="text-primary text-lg">✓</span>
                <span>"Most Popular" badge on Pro</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                <span className="text-primary text-lg">✓</span>
                <span>Crossed-out "value" price ($49 crossed, $19 shown)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                <span className="text-primary text-lg">✓</span>
                <span>Per-post cost breakdown ("Only $0.02 per post")</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                <span className="text-primary text-lg">✓</span>
                <span>Risk reversal ("14-day money-back guarantee")</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded md:col-span-2">
                <span className="text-primary text-lg">✓</span>
                <span>Social proof ("500+ creators trust POSTAIFY")</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Day-One Launch Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Day-One Launch Checklist</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { task: "Set up Stripe", done: true },
                { task: "Create AppSumo listing (if going that route)", done: false },
                { task: "Schedule Product Hunt launch", done: false },
                { task: "Prepare 5 LinkedIn posts", done: false },
                { task: "Draft 50 cold emails to target creators", done: false },
                { task: "Set up Google Ads campaign", done: false },
                { task: "Create launch discount codes", done: false },
                { task: "Prepare onboarding call scheduler (Calendly)", done: false },
                { task: "Set up abandoned cart emails", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded">
                  <span className={item.done ? "text-green-500" : "text-muted-foreground"}>
                    {item.done ? "✓" : "□"}
                  </span>
                  <span className={item.done ? "line-through text-muted-foreground" : ""}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Revenue Projection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-8 border-primary/50">
            <h2 className="text-2xl font-bold mb-6">Revenue Projection (Conservative)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 font-semibold">Source</th>
                    <th className="text-center py-3 px-2 font-semibold">Month 1</th>
                    <th className="text-center py-3 px-2 font-semibold">Month 2</th>
                    <th className="text-center py-3 px-2 font-semibold">Month 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2">Product Hunt</td>
                    <td className="py-3 px-2 text-center">5 paid</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">-</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">-</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2">LinkedIn Organic</td>
                    <td className="py-3 px-2 text-center">3 paid</td>
                    <td className="py-3 px-2 text-center">5 paid</td>
                    <td className="py-3 px-2 text-center">8 paid</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-2">Paid Ads</td>
                    <td className="py-3 px-2 text-center">2 paid</td>
                    <td className="py-3 px-2 text-center">4 paid</td>
                    <td className="py-3 px-2 text-center">6 paid</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2">Referrals</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">-</td>
                    <td className="py-3 px-2 text-center">2 paid</td>
                    <td className="py-3 px-2 text-center">4 paid</td>
                  </tr>
                  <tr className="border-b border-white/10 font-semibold">
                    <td className="py-3 px-2">Total Customers</td>
                    <td className="py-3 px-2 text-center text-primary">10</td>
                    <td className="py-3 px-2 text-center text-primary">21</td>
                    <td className="py-3 px-2 text-center text-primary">39</td>
                  </tr>
                  <tr className="font-bold text-lg">
                    <td className="py-3 px-2">MRR</td>
                    <td className="py-3 px-2 text-center text-primary">$190</td>
                    <td className="py-3 px-2 text-center text-primary">$399</td>
                    <td className="py-3 px-2 text-center text-primary">$741</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">*Assumes $19 avg (mostly Pro)</p>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-8 bg-primary/10 border-primary text-center">
            <h2 className="text-2xl font-bold mb-4">Fastest Single Action</h2>
            <p className="text-lg mb-2">
              Launch on Product Hunt this week with a "founding member" lifetime deal.
            </p>
            <p className="text-muted-foreground">
              This gets you paying customers, social proof, and backlinks simultaneously.
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
