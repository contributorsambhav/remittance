// components/dashboard/admin-dashboard.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { AdminKYCManagement } from "@/components/kyc/admin-kyc-management"
import { TransactionAnalytics } from "@/components/analytics/transaction-analytics"
import { OverviewTab } from "@/components/tabs/admin/overview-tab"
import { UsersTab } from "@/components/tabs/admin/users-tab"
import { SettingsTab } from "@/components/tabs/admin/settings-tab"
import {
  Shield,
  Users,
  FileCheck,
  Settings,
  TrendingUp,
  LogOut,
  Activity,
} from "lucide-react"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")

  if (!user) return null

  const renderTabContent = () => {
    switch (selectedTab) {
      case "overview":
        return <OverviewTab onTabChange={setSelectedTab} />
      case "kyc":
        return <AdminKYCManagement />
      case "users":
        return <UsersTab />
      case "transactions":
        return <TransactionAnalytics />
      case "settings":
        return <SettingsTab />
      default:
        return <OverviewTab onTabChange={setSelectedTab} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage users, KYC, and system operations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  Admin: {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </p>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Administrator</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "kyc", label: "KYC Management", icon: FileCheck },
            { id: "users", label: "User Management", icon: Users },
            { id: "transactions", label: "Transactions", icon: TrendingUp },
            { id: "settings", label: "System Settings", icon: Settings },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              onClick={() => setSelectedTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}