"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { SendMoneyForm } from "@/components/contract/send-money-form"
import { ClaimFundsForm } from "@/components/contract/claim-funds-form"
import { KYCRequestForm } from "@/components/kyc/kyc-request-form"
import { KYCStatusCard } from "@/components/kyc/kyc-status-card"
import {
  Wallet,
  Send,
  Download,
  Shield,
  TrendingUp,
  CheckCircle,
  LogOut,
  User,
  Activity,
  FileCheck,
  BarChart3,
} from "lucide-react"

export function UserDashboard() {
  const { user, logout } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")

  if (!user) return null

  const dailyUsagePercentage = (Number.parseFloat(user.todayUsed) / Number.parseFloat(user.dailyLimit)) * 100

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

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

  const recentTransactions = [
    { id: "1", type: "sent", amount: "250.00", recipient: "0x789...abc", date: "2024-01-15", status: "completed" },
    { id: "2", type: "received", amount: "500.00", sender: "0x456...def", date: "2024-01-14", status: "completed" },
    { id: "3", type: "sent", amount: "150.00", recipient: "0x123...xyz", date: "2024-01-13", status: "pending" },
  ]

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
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "send", label: "Send Money", icon: Send },
            { id: "receive", label: "Receive", icon: Download },
            { id: "kyc", label: "KYC Verification", icon: FileCheck },
            { id: "transactions", label: "My Transactions", icon: BarChart3 },
            { id: "profile", label: "Profile", icon: User },
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

        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Account Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.balance}</div>
                  <p className="text-xs text-muted-foreground">Ready to claim</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Limit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.dailyLimit}</div>
                  <p className="text-xs text-muted-foreground">{user.tier} tier limit</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.todayUsed}</div>
                  <Progress value={dailyUsagePercentage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge className={getKYCStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Verification complete</p>
                </CardContent>
              </Card>
            </div>

            {/* KYC Status Overview */}
            {user.kycStatus !== "APPROVED" && <KYCStatusCard />}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col gap-2" onClick={() => setSelectedTab("send")}>
                    <Send className="h-6 w-6" />
                    Send Money
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setSelectedTab("receive")}
                  >
                    <Download className="h-6 w-6" />
                    Claim Funds
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setSelectedTab("transactions")}
                  >
                    <BarChart3 className="h-6 w-6" />
                    View Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === "sent" ? "bg-red-100" : "bg-green-100"}`}>
                          {tx.type === "sent" ? (
                            <Send className="h-4 w-4 text-red-600" />
                          ) : (
                            <Download className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === "sent" ? "Sent to" : "Received from"}{" "}
                            {tx.type === "sent" ? tx.recipient : tx.sender}
                          </p>
                          <p className="text-sm text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${tx.amount}</p>
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "send" && <SendMoneyForm />}

        {selectedTab === "receive" && <ClaimFundsForm />}

        {/* KYC tab with request form and status */}
        {selectedTab === "kyc" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KYCStatusCard />
            <KYCRequestForm />
          </div>
        )}

        {selectedTab === "transactions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                My Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">$2,450</p>
                        <p className="text-sm text-muted-foreground">Total Sent</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">$1,850</p>
                        <p className="text-sm text-muted-foreground">Total Received</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">23</p>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === "sent" ? "bg-red-100" : "bg-green-100"}`}>
                          {tx.type === "sent" ? (
                            <Send className="h-4 w-4 text-red-600" />
                          ) : (
                            <Download className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === "sent" ? "Sent to" : "Received from"}{" "}
                            {tx.type === "sent" ? tx.recipient : tx.sender}
                          </p>
                          <p className="text-sm text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${tx.amount}</p>
                        <Badge
                          className={
                            tx.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : tx.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {tx.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wallet Address</label>
                  <p className="text-sm bg-muted p-2 rounded font-mono">{user.address}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Tier</label>
                  <Badge className={getTierColor(user.tier)}>{user.tier}</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">KYC Status</label>
                  <Badge className={getKYCStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Whitelisted</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Account Status</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Normal
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Daily Limits</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Current Tier: {user.tier}</p>
                    <p>Daily Limit: ${user.dailyLimit}</p>
                    <p>Used Today: ${user.todayUsed}</p>
                    <p>
                      Remaining: ${(Number.parseFloat(user.dailyLimit) - Number.parseFloat(user.todayUsed)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
