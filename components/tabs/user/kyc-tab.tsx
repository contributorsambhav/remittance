"use client"

import { KYCRequestForm } from "@/components/kyc/kyc-request-form"
import { KYCStatusCard } from "@/components/kyc/kyc-status-card"

export function KYCTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <KYCStatusCard />
      <KYCRequestForm />
    </div>
  )
}