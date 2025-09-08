"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { User, Shield, CheckCircle } from "lucide-react"

export function ProfileTab() {
  const { user } = useAuth()

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

  return (
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
  )
}