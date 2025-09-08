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
import { FileCheck, Upload, AlertCircle, CheckCircle, Info } from "lucide-react"

export function KYCRequestForm() {
  const { user } = useAuth()
  const { requestKYC, isLoading, error } = useContract()
  const [documentHash, setDocumentHash] = useState("")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFile(file)
      // In a real implementation, you would upload to IPFS and get the hash
      // For demo purposes, we'll generate a mock hash
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`
      setDocumentHash(mockHash)
    }
  }

  const handleConfirmSubmit = async () => {
    setSuccess(false)

    const result = await requestKYC(documentHash)
    if (result) {
      setSuccess(true)
      setDocumentHash("")
      setDocumentFile(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form validation is handled by the confirmation modal trigger
  }

  const canSubmitKYC = user?.kycStatus === "NONE" || user?.kycStatus === "REJECTED"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          KYC Verification Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canSubmitKYC ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {user?.kycStatus === "PENDING"
                ? "Your KYC request is currently under review. Please wait for admin approval."
                : "Your KYC has already been approved. No further action needed."}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document">Identity Document</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your government-issued ID, passport, or driver's license
                </p>
                <Input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto"
                />
              </div>
              {documentFile && <p className="text-sm text-muted-foreground">Selected: {documentFile.name}</p>}
            </div>

            {documentHash && (
              <div className="space-y-2">
                <Label>Document Hash (IPFS)</Label>
                <Input value={documentHash} readOnly className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">
                  This hash will be stored on the blockchain for verification
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">KYC Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Government-issued photo ID (passport, driver's license, national ID)</li>
                <li>• Clear, high-resolution image or PDF</li>
                <li>• All information must be clearly visible</li>
                <li>• Document must be valid and not expired</li>
              </ul>
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
                  KYC request submitted successfully! You will be notified once it's reviewed.
                </AlertDescription>
              </Alert>
            )}

            <ConfirmationModal
              trigger={
                <Button type="button" disabled={isLoading || !documentHash} className="w-full">
                  {isLoading ? "Submitting..." : "Submit KYC Request"}
                </Button>
              }
              title="Submit KYC Request"
              description={`Are you sure you want to submit your KYC request? Your document hash ${documentHash} will be stored on the blockchain for verification. This action cannot be undone.`}
              confirmText="Submit Request"
              onConfirm={handleConfirmSubmit}
              icon={<FileCheck className="h-5 w-5" />}
            />
          </form>
        )}
      </CardContent>
    </Card>
  )
}
