
// components/tabs/admin/overview-tab.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileCheck,
  Settings,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react"

interface OverviewTabProps {
  onTabChange: (tab: string) => void
}

export function OverviewTab({ onTabChange }: OverviewTabProps) {
  // Mock data for admin dashboard
  const stats = {
    totalUsers: 1247,
    pendingKYC: 23,
    activeTransactions: 156,
    totalVolume: "2,450,000",
    dailyVolume: "125,000",
    frozenAccounts: 5,
  }

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

  return (
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
            <Button className="h-20 flex-col gap-2" onClick={() => onTabChange("kyc")}>
              <FileCheck className="h-6 w-6" />
              Review KYC
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => onTabChange("users")}
            >
              <Users className="h-6 w-6" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => onTabChange("transactions")}
            >
              <TrendingUp className="h-6 w-6" />
              View Transactions
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => onTabChange("settings")}
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
  )
}