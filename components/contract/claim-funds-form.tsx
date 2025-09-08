"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useContract } from "@/hooks/use-contract"
import { useAuth } from "@/contexts/auth-context"
import { Download, AlertCircle, CheckCircle } from "lucide-react"

export function ClaimFundsForm() {
  const { user } = useAuth()
  const { claimRemittance, isLoading, error } = useContract()
  const [success, setSuccess] = useState(false)

  const handleConfirmClaim = async () => {
    setSuccess(false)
    const result = await claimRemittance()
    if (result) {
      setSuccess(true)
    }
  }

  const hasBalance = user && Number.parseFloat(user.balance) > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Claim Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Available Balance</p>
              <p className="text-2xl font-bold text-primary">${user?.balance || "0.00"}</p>
            </div>
            <ConfirmationModal
              trigger={
                <Button disabled={isLoading || !hasBalance}>
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? "Claiming..." : "Claim Now"}
                </Button>
              }
              title="Confirm Fund Claim"
              description={`Are you sure you want to claim ${user?.balance || "0.00"} ETH? The funds will be transferred to your connected wallet.`}
              confirmText="Claim Funds"
              onConfirm={handleConfirmClaim}
              icon={<Download className="h-5 w-5" />}
            />
          </div>
        </div>

        {!hasBalance && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No funds available to claim at this time.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Funds claimed successfully! Check your wallet for the transaction.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
