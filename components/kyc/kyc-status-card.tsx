"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Shield, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function KYCStatusCard() {
  const { user } = useAuth()

  if (!user) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Your identity has been verified. You can now use all platform features."
      case "PENDING":
        return "Your KYC request is under review. This typically takes 1-3 business days."
      case "REJECTED":
        return "Your KYC request was rejected. Please review the feedback and resubmit."
      default:
        return "Complete KYC verification to access all platform features and higher limits."
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          KYC Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(user.kycStatus)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getStatusMessage(user.kycStatus)}</p>
          </div>
        </div>

        {user.kycStatus === "APPROVED" && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Verification Complete</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>
                • Account Tier: <span className="font-medium">{user.tier}</span>
              </p>
              <p>
                • Daily Limit: <span className="font-medium">${user.dailyLimit}</span>
              </p>
              <p>• Full platform access enabled</p>
            </div>
          </div>
        )}

        {user.kycStatus === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Verification Failed</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              Please review the requirements and submit a new request with valid documentation.
            </p>
            <Button size="sm" variant="outline" className="text-red-700 border-red-300 bg-transparent">
              Resubmit KYC
            </Button>
          </div>
        )}

        {user.kycStatus === "PENDING" && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Under Review</span>
            </div>
            <p className="text-sm text-yellow-700">
              Our team is reviewing your documents. You'll receive an email notification once the review is complete.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
