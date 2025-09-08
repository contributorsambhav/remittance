"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useContract } from "@/hooks/use-contract"
import { useAuth } from "@/contexts/auth-context"
import { Send, AlertCircle, CheckCircle } from "lucide-react"

export function SendMoneyForm() {
  const { user } = useAuth()
  const { sendRemittance, isLoading, error } = useContract()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [success, setSuccess] = useState(false)

  const handleConfirmSend = async () => {
    setSuccess(false)

    const result = await sendRemittance(recipient, amount)
    if (result) {
      setSuccess(true)
      setRecipient("")
      setAmount("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form validation is handled by the confirmation modal trigger
  }

  const remainingLimit = user
    ? (Number.parseFloat(user.dailyLimit) - Number.parseFloat(user.todayUsed)).toFixed(2)
    : "0"

  const isFormValid = recipient && amount && Number.parseFloat(amount) > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Available to send today: <span className="font-medium">${remainingLimit}</span>
            </p>
          </div>

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
                Transaction submitted successfully! It may take a few minutes to confirm.
              </AlertDescription>
            </Alert>
          )}

          <ConfirmationModal
            trigger={
              <Button type="button" disabled={isLoading || !isFormValid} className="w-full">
                {isLoading ? "Sending..." : "Send Money"}
              </Button>
            }
            title="Confirm Transaction"
            description={`Are you sure you want to send ${amount} ETH to ${recipient}? This transaction cannot be reversed once confirmed.`}
            confirmText="Send Transaction"
            onConfirm={handleConfirmSend}
            icon={<Send className="h-5 w-5" />}
          />
        </form>
      </CardContent>
    </Card>
  )
}
