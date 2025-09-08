// components/tabs/admin/settings-tab.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ConfirmationModal,
  EmergencyConfirmationModal,
} from "@/components/ui/confirmation-modal"
import {
  Settings,
  AlertTriangle,
  Pause,
} from "lucide-react"

export function SettingsTab() {
  const handleEmergencyPause = () => {
    console.log("[v0] Emergency pause executed")
    // Contract interaction logic here
  }

  const handleEmergencyWithdraw = () => {
    console.log("[v0] Emergency withdraw executed")
    // Contract interaction logic here
  }

  const handlePauseContract = () => {
    console.log("[v0] Contract paused")
    // Contract interaction logic here
  }

  return (
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
  )
}