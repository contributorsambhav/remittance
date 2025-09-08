"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  OverviewTab,
  SendTab,
  ReceiveTab,
  KYCTab,
  TransactionsTab,
  ProfileTab,
} from "@/components/tabs/user"
import {
  Shield,
  LogOut,
  Activity,
  Send,
  Download,
  FileCheck,
  BarChart3,
  User,
} from "lucide-react"

export function UserDashboard() {
  const { user, logout } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")

  if (!user) return null

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "TIER3":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "TIER2":
        return "bg-green-100 text-green-800 border-green-200"
      case "TIER1":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const tabsConfig = [
    { id: "overview", label: "Overview", icon: Activity, component: OverviewTab },
    { id: "send", label: "Send Money", icon: Send, component: SendTab },
    { id: "receive", label: "Receive", icon: Download, component: ReceiveTab },
    { id: "kyc", label: "KYC Verification", icon: FileCheck, component: KYCTab },
    { id: "transactions", label: "My Transactions", icon: BarChart3, component: TransactionsTab },
    { id: "profile", label: "Profile", icon: User, component: ProfileTab },
  ]

  const activeTab = tabsConfig.find(tab => tab.id === selectedTab)
  const ActiveComponent = activeTab?.component

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
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back to your remittance account</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </p>
                <Badge className={getTierColor(user.tier)}>{user.tier}</Badge>
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
          {tabsConfig.map((tab) => (
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

        {/* Active Tab Content */}
        {ActiveComponent && (
          <ActiveComponent 
            onTabChange={setSelectedTab}
          />
        )}
      </div>
    </div>
  )
}