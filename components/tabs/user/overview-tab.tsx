"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { KYCStatusCard } from "@/components/kyc/kyc-status-card"
import {
  Wallet,
  Send,
  Download,
  Shield,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react"

interface OverviewTabProps {
  onTabChange: (tab: string) => void
}

export function OverviewTab({ onTabChange }: OverviewTabProps) {
  const { user } = useAuth()

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

  const recentTransactions = [
    { id: "1", type: "sent", amount: "250.00", recipient: "0x789...abc", date: "2024-01-15", status: "completed" },
    { id: "2", type: "received", amount: "500.00", sender: "0x456...def", date: "2024-01-14", status: "completed" },
    { id: "3", type: "sent", amount: "150.00", recipient: "0x123...xyz", date: "2024-01-13", status: "pending" },
  ]

  return (
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
            <Button className="h-20 flex-col gap-2" onClick={() => onTabChange("send")}>
              <Send className="h-6 w-6" />
              Send Money
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => onTabChange("receive")}
            >
              <Download className="h-6 w-6" />
              Claim Funds
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => onTabChange("transactions")}
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
  )
}