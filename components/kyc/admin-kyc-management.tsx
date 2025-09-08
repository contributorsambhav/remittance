"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useContract } from "@/hooks/use-contract"
import { UserTier } from "@/lib/contract"
import { FileCheck, CheckCircle, XCircle, Clock, Search, Eye, AlertCircle, Users } from "lucide-react"

interface KYCRequest {
  id: string
  address: string
  email: string
  submittedAt: string
  documentHash: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  rejectionReason?: string
}

export function AdminKYCManagement() {
  const { approveKYC, rejectKYC, getPendingKYC, isLoading, error } = useContract()
  const [pendingRequests, setPendingRequests] = useState<KYCRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTier, setSelectedTier] = useState<{ [key: string]: UserTier }>({})
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests: KYCRequest[] = [
      {
        id: "1",
        address: "0x123...abc",
        email: "user1@example.com",
        submittedAt: "2024-01-15T10:30:00Z",
        documentHash: "QmX1Y2Z3...",
        status: "PENDING",
      },
      {
        id: "2",
        address: "0x456...def",
        email: "user2@example.com",
        submittedAt: "2024-01-14T15:45:00Z",
        documentHash: "QmA4B5C6...",
        status: "PENDING",
      },
      {
        id: "3",
        address: "0x789...ghi",
        email: "user3@example.com",
        submittedAt: "2024-01-13T09:15:00Z",
        documentHash: "QmD7E8F9...",
        status: "PENDING",
      },
    ]
    setPendingRequests(mockRequests)
  }, [])

  const handleConfirmApprove = async (request: KYCRequest) => {
    const tier = selectedTier[request.id] || UserTier.TIER1
    setProcessingRequest(request.id)

    try {
      const result = await approveKYC(request.address, tier)
      if (result) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id))
        setSelectedTier((prev) => {
          const { [request.id]: _, ...rest } = prev
          return rest
        })
      }
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleConfirmReject = async (request: KYCRequest) => {
    const reason = rejectionReasons[request.id]
    setProcessingRequest(request.id)

    try {
      const result = await rejectKYC(request.address, reason)
      if (result) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id))
        setRejectionReasons((prev) => {
          const { [request.id]: _, ...rest } = prev
          return rest
        })
      }
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleBatchApprove = async () => {
    const requestsToApprove = pendingRequests.filter((r) => selectedTier[r.id])
    if (requestsToApprove.length === 0) {
      alert("Please select tiers for the requests you want to approve")
      return
    }

    const addresses = requestsToApprove.map((r) => r.address)
    const tiers = requestsToApprove.map((r) => selectedTier[r.id])

    // Note: batchApprove would be implemented in the contract hook
    console.log("Batch approving:", { addresses, tiers })
  }

  const filteredRequests = pendingRequests.filter(
    (request) =>
      request.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTierName = (tier: UserTier) => {
    switch (tier) {
      case UserTier.TIER1:
        return "TIER 1"
      case UserTier.TIER2:
        return "TIER 2"
      case UserTier.TIER3:
        return "TIER 3"
      case UserTier.VIP:
        return "VIP"
      default:
        return "TIER 1"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 approved, 4 rejected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* KYC Requests Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              KYC Requests ({filteredRequests.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleBatchApprove} disabled={isLoading}>
                <Users className="h-4 w-4 mr-2" />
                Batch Approve
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending KYC requests</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.address}</p>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">PENDING</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {formatDate(request.submittedAt)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Document Hash (IPFS)</Label>
                    <p className="text-sm bg-muted p-2 rounded font-mono">{request.documentHash}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assign Tier (if approving)</Label>
                      <Select
                        value={selectedTier[request.id]?.toString() || ""}
                        onValueChange={(value) =>
                          setSelectedTier((prev) => ({
                            ...prev,
                            [request.id]: Number.parseInt(value) as UserTier,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserTier.TIER1.toString()}>TIER 1 ($1,500/day)</SelectItem>
                          <SelectItem value={UserTier.TIER2.toString()}>TIER 2 ($3,000/day)</SelectItem>
                          <SelectItem value={UserTier.TIER3.toString()}>TIER 3 ($6,000/day)</SelectItem>
                          <SelectItem value={UserTier.VIP.toString()}>VIP ($15,000/day)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rejection Reason (if rejecting)</Label>
                      <Textarea
                        placeholder="Enter reason for rejection..."
                        value={rejectionReasons[request.id] || ""}
                        onChange={(e) =>
                          setRejectionReasons((prev) => ({
                            ...prev,
                            [request.id]: e.target.value,
                          }))
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <ConfirmationModal
                      trigger={
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isLoading || processingRequest === request.id || !selectedTier[request.id]}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processingRequest === request.id ? "Approving..." : "Approve"}
                        </Button>
                      }
                      title="Approve KYC Request"
                      description={`Are you sure you want to approve the KYC request for ${request.address}? They will be assigned ${getTierName(selectedTier[request.id])} status with corresponding daily limits.`}
                      confirmText="Approve KYC"
                      onConfirm={() => handleConfirmApprove(request)}
                      icon={<CheckCircle className="h-5 w-5" />}
                    />

                    <ConfirmationModal
                      trigger={
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={
                            isLoading || processingRequest === request.id || !rejectionReasons[request.id]?.trim()
                          }
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {processingRequest === request.id ? "Rejecting..." : "Reject"}
                        </Button>
                      }
                      title="Reject KYC Request"
                      description={`Are you sure you want to reject the KYC request for ${request.address}? Reason: "${rejectionReasons[request.id]}" This action will notify the user and they can resubmit with corrected documents.`}
                      confirmText="Reject KYC"
                      onConfirm={() => handleConfirmReject(request)}
                      variant="destructive"
                      icon={<XCircle className="h-5 w-5" />}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
