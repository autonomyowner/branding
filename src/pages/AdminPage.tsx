import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { Navbar } from '../components/Navbar'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md p-8">
            <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Admin Login</h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-500 text-sm">{loginError}</div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
          <button
            onClick={handleLogout}
            className="text-primary hover:underline"
          >
            Logout and try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, view analytics, and monitor email captures</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 transition-colors w-fit"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'emails', label: 'Email Captures' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab)
                if (tab.id === 'users') setUsersPage(1)
                if (tab.id === 'emails') setEmailsPage(1)
              }}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
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
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ stats }: { stats: any }) {
  // Prepare chart data
  const userDistributionData = [
    { name: 'Free', value: stats.users.free, color: '#9ca3af' },
    { name: 'Pro', value: stats.users.pro, color: '#a78bfa' },
    { name: 'Business', value: stats.users.business, color: '#60a5fa' },
  ]

  const emailConversionData = [
    { name: 'With Consent', value: stats.emailCaptures.withConsent, color: '#4ade80' },
    { name: 'Without Consent', value: stats.emailCaptures.total - stats.emailCaptures.withConsent, color: '#6b7280' },
  ]

  const activityData = [
    { name: 'New Users', value: stats.users.recentSignups, color: '#60a5fa' },
    { name: 'Email Captures', value: stats.emailCaptures.recentCaptures, color: '#a78bfa' },
    { name: 'Posts', value: stats.content.totalPosts > 100 ? Math.floor(stats.content.totalPosts / 10) : stats.content.totalPosts, color: '#4ade80' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users.total} />
        <StatCard title="Pro Users" value={stats.users.pro} color="text-purple-400" />
        <StatCard title="Business Users" value={stats.users.business} color="text-blue-400" />
        <StatCard title="Free Users" value={stats.users.free} color="text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Posts" value={stats.content.totalPosts} />
        <StatCard title="Total Brands" value={stats.content.totalBrands} />
        <StatCard title="Email Captures" value={stats.emailCaptures.total} />
        <StatCard
          title="Consent Rate"
          value={`${stats.emailCaptures.consentRate}%`}
          color="text-green-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">User Distribution by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Email Conversion Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Email Capture Conversion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emailConversionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {emailConversionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: '14px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '14px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              cursor={{ fill: '#374151' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {activityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">New Signups (30d)</p>
            <p className="text-2xl font-bold text-foreground">{stats.users.recentSignups}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Email Captures (7d)</p>
            <p className="text-2xl font-bold text-foreground">{stats.emailCaptures.recentCaptures}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">With Consent</p>
            <p className="text-2xl font-bold text-foreground">{stats.emailCaptures.withConsent}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Users Tab
function UsersTab({ users, pagination, onPageChange }: any) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Brands</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Posts</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">This Month</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-foreground">{user.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.name || '-'}</td>
                  <td className="p-4 text-center">
                    <PlanBadge plan={user.plan} />
                  </td>
                  <td className="p-4 text-center text-sm text-foreground">{user.brandsCount}</td>
                  <td className="p-4 text-center text-sm text-foreground">{user.postsCount}</td>
                  <td className="p-4 text-center text-sm text-foreground">{user.postsThisMonth}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

// Emails Tab
function EmailsTab({ captures, pagination, onPageChange }: any) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Plan Interest</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Marketing</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Captured</th>
              </tr>
            </thead>
            <tbody>
              {captures.map((capture: any) => (
                <tr key={capture.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-foreground">{capture.email}</td>
                  <td className="p-4 text-center">
                    {capture.planInterest && (
                      <Badge variant="secondary">{capture.planInterest}</Badge>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {capture.marketingConsent ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{capture.source || '-'}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(capture.capturedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

// Helper Components
function StatCard({ title, value, color = 'text-primary' }: any) {
  return (
    <Card className="p-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
    </Card>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const colors = {
    FREE: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    PRO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    BUSINESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  }

  return (
    <Badge className={colors[plan as keyof typeof colors] || colors.FREE}>
      {plan}
    </Badge>
  )
}

function Pagination({ page, totalPages, onPageChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
