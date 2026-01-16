import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { Navbar } from '../components/Navbar'
import { Badge } from '../components/ui/badge'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Tab = 'overview' | 'users' | 'emails'

export function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Overview data
  const [stats, setStats] = useState<any>(null)

  // Users data
  const [users, setUsers] = useState<any[]>([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState<any>(null)

  // Email captures data
  const [emailCaptures, setEmailCaptures] = useState<any[]>([])
  const [emailsPage, setEmailsPage] = useState(1)
  const [emailsPagination, setEmailsPagination] = useState<any>(null)

  useEffect(() => {
    // Check if already logged in
    const loggedIn = api.isAdminLoggedIn()
    setIsLoggedIn(loggedIn)

    if (loggedIn) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [activeTab, usersPage, emailsPage])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      await api.adminLogin(username, password)
      setIsLoggedIn(true)
      setPassword('')
      loadData()
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    api.adminLogout()
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  const loadData = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (activeTab === 'overview') {
        const data = await api.getAdminStats()
        setStats(data)
      } else if (activeTab === 'users') {
        const data = await api.getAdminUsers(usersPage, 50)
        setUsers(data.users)
        setUsersPagination(data.pagination)
      } else if (activeTab === 'emails') {
        const data = await api.getAdminEmailCaptures(emailsPage, 50)
        setEmailCaptures(data.captures)
        setEmailsPagination(data.pagination)
      }
    } catch (err: any) {
      if (err.message.includes('Access denied')) {
        setError('Access denied. You must be an admin to view this page.')
      } else {
        setError(err.message || 'Failed to load data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 rounded-2xl blur-xl" />

              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    Admin Portal
                  </h1>
                  <p className="text-slate-400 text-sm">Secure access to platform analytics</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2"
                    >
                      {loginError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isLoggingIn ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-blue-500/20 rounded-full animate-ping" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-red-400 text-xl font-semibold mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            {error}
          </div>
          <button
            onClick={handleLogout}
            className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
          >
            Logout and try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Analytics Hub
              </h1>
              <p className="text-lg text-slate-400">
                Real-time platform insights and user intelligence
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10"
            >
              Sign Out
            </button>
          </div>

          {/* Refined separator with gradient */}
          <div className="relative h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm" />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex gap-2 mb-8"
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'emails', label: 'Email Captures' },
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              onClick={() => {
                setActiveTab(tab.id as Tab)
                if (tab.id === 'users') setUsersPage(1)
                if (tab.id === 'emails') setEmailsPage(1)
              }}
              className={`relative px-6 py-3 font-medium transition-all rounded-xl ${
                activeTab === tab.id
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && stats && <OverviewTab stats={stats} />}
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                pagination={usersPagination}
                onPageChange={setUsersPage}
              />
            )}
            {activeTab === 'emails' && (
              <EmailsTab
                captures={emailCaptures}
                pagination={emailsPagination}
                onPageChange={setEmailsPage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ stats }: { stats: any }) {
  // Prepare data for charts
  const planDistributionData = [
    { name: 'Free', value: stats.users.free, color: '#64748b' },
    { name: 'Pro', value: stats.users.pro, color: '#8b5cf6' },
    { name: 'Business', value: stats.users.business, color: '#3b82f6' },
  ]

  const contentData = [
    { name: 'Posts', value: stats.content.totalPosts },
    { name: 'Brands', value: stats.content.totalBrands },
  ]

  const emailConsentData = [
    { name: 'With Consent', value: stats.emailCaptures.withConsent, color: '#10b981' },
    { name: 'Without Consent', value: stats.emailCaptures.total - stats.emailCaptures.withConsent, color: '#475569' },
  ]

  const growthData = [
    { name: 'New Users (30d)', value: stats.users.recentSignups },
    { name: 'Email Captures (7d)', value: stats.emailCaptures.recentCaptures },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <StatCard
          title="Total Users"
          value={stats.users.total}
          gradient="from-cyan-500 to-blue-500"
          delay={0.1}
        />
        <StatCard
          title="Pro Users"
          value={stats.users.pro}
          gradient="from-violet-500 to-purple-500"
          delay={0.15}
        />
        <StatCard
          title="Business Users"
          value={stats.users.business}
          gradient="from-blue-500 to-indigo-500"
          delay={0.2}
        />
        <StatCard
          title="Email Captures"
          value={stats.emailCaptures.total}
          gradient="from-emerald-500 to-teal-500"
          delay={0.25}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <StatCard
          title="Total Posts"
          value={stats.content.totalPosts}
          gradient="from-cyan-500 to-teal-500"
          delay={0.3}
        />
        <StatCard
          title="Total Brands"
          value={stats.content.totalBrands}
          gradient="from-pink-500 to-rose-500"
          delay={0.35}
        />
        <StatCard
          title="Free Users"
          value={stats.users.free}
          gradient="from-slate-500 to-gray-500"
          delay={0.4}
        />
        <StatCard
          title="Consent Rate"
          value={`${stats.emailCaptures.consentRate}%`}
          gradient="from-green-500 to-emerald-500"
          delay={0.45}
        />
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* User Plan Distribution */}
        <ChartCard title="User Plan Distribution" delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {planDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  backdropFilter: 'blur(8px)',
                  padding: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Content Statistics */}
        <ChartCard title="Content Statistics" delay={0.55}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  backdropFilter: 'blur(8px)',
                  padding: '12px'
                }}
              />
              <Bar dataKey="value" fill="url(#blueGradient)" radius={[12, 12, 0, 0]} />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Email Consent Distribution */}
        <ChartCard title="Email Marketing Consent" delay={0.6}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emailConsentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {emailConsentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  backdropFilter: 'blur(8px)',
                  padding: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Growth */}
        <ChartCard title="Recent Growth" delay={0.65}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  backdropFilter: 'blur(8px)',
                  padding: '12px'
                }}
              />
              <Bar dataKey="value" fill="url(#greenGradient)" radius={[12, 12, 0, 0]} />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>
    </div>
  )
}

// Users Tab
function UsersTab({ users, pagination, onPageChange }: any) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-teal-500/10 rounded-2xl blur-xl" />

        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/30">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Brands</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Posts</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {users.map((user: any, index: number) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.3 }}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-200">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-300 font-medium">{user.brandsCount}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-300 font-medium">{user.postsCount}</td>
                    <td className="px-6 py-4 text-center text-sm text-cyan-400 font-medium">{user.postsThisMonth}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />}
    </div>
  )
}

// Emails Tab
function EmailsTab({ captures, pagination, onPageChange }: any) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl blur-xl" />

        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/30">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Interest</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Marketing</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {captures.map((capture: any, index: number) => (
                  <motion.tr
                    key={capture.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.3 }}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-200">{capture.email}</td>
                    <td className="px-6 py-4 text-center">
                      {capture.planInterest && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {capture.planInterest}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {capture.marketingConsent ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          Yes
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-700/30 text-slate-400 border-slate-600/30">
                          No
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{capture.source || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(capture.capturedAt).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />}
    </div>
  )
}

// Helper Components
function StatCard({ title, value, gradient, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity`} />

      <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
        <p className="text-sm text-slate-400 mb-3 font-medium">{title}</p>
        <p className={`text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}

function ChartCard({ title, children, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-teal-500/10 rounded-2xl opacity-50 group-hover:opacity-70 blur transition-opacity" />

      <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
        <h3 className="text-lg font-semibold mb-6 text-slate-200">{title}</h3>
        {children}
      </div>
    </motion.div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const styles = {
    FREE: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
    PRO: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    BUSINESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  }

  return (
    <Badge className={styles[plan as keyof typeof styles] || styles.FREE}>
      {plan}
    </Badge>
  )
}

function Pagination({ page, totalPages, onPageChange }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex items-center justify-between px-2"
    >
      <p className="text-sm text-slate-400">
        Page <span className="text-cyan-400 font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-5 py-2.5 text-sm font-medium rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-500/5 disabled:hover:shadow-none"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-5 py-2.5 text-sm font-medium rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-500/5 disabled:hover:shadow-none"
        >
          Next
        </button>
      </div>
    </motion.div>
  )
}
