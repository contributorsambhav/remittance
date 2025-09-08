"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { AdminKYCManagement } from "@/components/kyc/admin-kyc-management"
import { TransactionAnalytics } from "@/components/analytics/transaction-analytics"
import {
  ConfirmationModal,
  EmergencyConfirmationModal,
  UserActionConfirmationModal,
} from "@/components/ui/confirmation-modal"
import {
  Shield,
  Users,
  FileCheck,
  Settings,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  UserCheck,
  UserX,
  Crown,
  Activity,
} from "lucide-react"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  if (!user) return null

  // Mock data for admin dashboard
  const stats = {
    totalUsers: 1247,
    pendingKYC: 23,
    activeTransactions: 156,
    totalVolume: "2,450,000",
    dailyVolume: "125,000",
    frozenAccounts: 5,
  }

  const pendingKYCUsers = [
    { id: "1", address: "0x123...abc", email: "user1@example.com", submittedAt: "2024-01-15", documentHash: "QmX..." },
    { id: "2", address: "0x456...def", email: "user2@example.com", submittedAt: "2024-01-14", documentHash: "QmY..." },
    { id: "3", address: "0x789...ghi", email: "user3@example.com", submittedAt: "2024-01-13", documentHash: "QmZ..." },
  ]

  const allUsers = [
    {
      id: "1",
      address: "0x123...abc",
      tier: "TIER2",
      kycStatus: "APPROVED",
      isWhitelisted: true,
      isBlacklisted: false,
      isFrozen: false,
      balance: "1500.50",
    },
    {
      id: "2",
      address: "0x456...def",
      tier: "TIER1",
      kycStatus: "APPROVED",
      isWhitelisted: true,
      isBlacklisted: false,
      isFrozen: false,
      balance: "750.25",
    },
    {
      id: "3",
      address: "0x789...ghi",
      tier: "VIP",
      kycStatus: "APPROVED",
      isWhitelisted: true,
      isBlacklisted: false,
      isFrozen: true,
      balance: "5000.00",
    },
  ]

  const recentTransactions = [
    {
      id: "1",
      from: "0x123...abc",
      to: "0x456...def",
      amount: "250.00",
      status: "completed",
      timestamp: "2024-01-15 14:30",
    },
    {
      id: "2",
      from: "0x789...ghi",
      to: "0x123...abc",
      amount: "500.00",
      status: "pending",
      timestamp: "2024-01-15 14:25",
    },
    {
      id: "3",
      from: "0x456...def",
      to: "0x789...ghi",
      amount: "150.00",
      status: "completed",
      timestamp: "2024-01-15 14:20",
    },
  ]

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

  const handleEmergencyPause = () => {
    console.log("[v0] Emergency pause executed")
    // Contract interaction logic here
  }

  const handleEmergencyWithdraw = () => {
    console.log("[v0] Emergency withdraw executed")
    // Contract interaction logic here
  }

  const handleUserAction = (action: string, userId: string) => {
    console.log(`[v0] ${action} executed for user ${userId}`)
    // Contract interaction logic here
  }

  const handlePauseContract = () => {
    console.log("[v0] Contract paused")
    // Contract interaction logic here
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

        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingKYC}</div>
                  <p className="text-xs text-muted-foreground">Requires review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.dailyVolume}</div>
                  <p className="text-xs text-muted-foreground">+8% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeTransactions}</div>
                  <p className="text-xs text-muted-foreground">Currently processing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalVolume}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Frozen Accounts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.frozenAccounts}</div>
                  <p className="text-xs text-muted-foreground">Security holds</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2" onClick={() => setSelectedTab("kyc")}>
                    <FileCheck className="h-6 w-6" />
                    Review KYC
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setSelectedTab("users")}
                  >
                    <Users className="h-6 w-6" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setSelectedTab("transactions")}
                  >
                    <TrendingUp className="h-6 w-6" />
                    View Transactions
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setSelectedTab("settings")}
                  >
                    <Settings className="h-6 w-6" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Transaction {tx.from} → {tx.to}
                          </p>
                          <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
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

        {selectedTab === "kyc" && <AdminKYCManagement />}

        {selectedTab === "users" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{user.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTierColor(user.tier)}>{user.tier}</Badge>
                              <Badge className={getKYCStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
                              {user.isFrozen && <Badge variant="destructive">FROZEN</Badge>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Balance: ${user.balance}</p>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Crown className="h-4 w-4 mr-2" />
                          Change Tier
                        </Button>

                        {user.isFrozen ? (
                          <UserActionConfirmationModal
                            trigger={
                              <Button size="sm" variant="outline" className="text-green-600 bg-transparent">
                                <Play className="h-4 w-4 mr-2" />
                                Unfreeze
                              </Button>
                            }
                            action="unfreeze"
                            userAddress={user.address}
                            onConfirm={() => handleUserAction("unfreeze", user.id)}
                          />
                        ) : (
                          <UserActionConfirmationModal
                            trigger={
                              <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                                <Pause className="h-4 w-4 mr-2" />
                                Freeze
                              </Button>
                            }
                            action="freeze"
                            userAddress={user.address}
                            onConfirm={() => handleUserAction("freeze", user.id)}
                          />
                        )}

                        {user.isWhitelisted ? (
                          <UserActionConfirmationModal
                            trigger={
                              <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                                <UserX className="h-4 w-4 mr-2" />
                                Remove Whitelist
                              </Button>
                            }
                            action="remove-whitelist"
                            userAddress={user.address}
                            onConfirm={() => handleUserAction("remove-whitelist", user.id)}
                          />
                        ) : (
                          <UserActionConfirmationModal
                            trigger={
                              <Button size="sm" variant="outline" className="text-green-600 bg-transparent">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Whitelist
                              </Button>
                            }
                            action="whitelist"
                            userAddress={user.address}
                            onConfirm={() => handleUserAction("whitelist", user.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "transactions" && <TransactionAnalytics />}

        {selectedTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contract Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>
                    <ConfirmationModal
                      trigger={
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Contract
                        </Button>
                      }
                      title="Pause Smart Contract"
                      description="Are you sure you want to pause the smart contract? This will stop all transactions system-wide until manually resumed."
                      confirmText="Pause Contract"
                      onConfirm={handlePauseContract}
                      variant="destructive"
                      icon={<Pause className="h-5 w-5" />}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Tier Limits Configuration</h4>
                  {["TIER1", "TIER2", "TIER3", "VIP"].map((tier) => (
                    <div key={tier} className="flex items-center gap-4">
                      <Label className="w-16">{tier}</Label>
                      <Input placeholder="Daily limit in USD" className="flex-1" />
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Emergency Actions</h4>
                  <div className="space-y-2">
                    <EmergencyConfirmationModal
                      trigger={
                        <Button variant="destructive" size="sm" className="w-full">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency Pause All Operations
                        </Button>
                      }
                      title="Emergency Pause All Operations"
                      description="This will immediately halt all contract operations including transactions, KYC processing, and user interactions."
                      onConfirm={handleEmergencyPause}
                    />
                    <EmergencyConfirmationModal
                      trigger={
                        <Button variant="destructive" size="sm" className="w-full">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency Withdraw Funds
                        </Button>
                      }
                      title="Emergency Withdraw Funds"
                      description="This will withdraw all contract funds to the admin address. Use only in critical security situations."
                      onConfirm={handleEmergencyWithdraw}
                    />
                  </div>
                  <p className="text-xs text-red-600 mt-2">These actions should only be used in emergency situations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
