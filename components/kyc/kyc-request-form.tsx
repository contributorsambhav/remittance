'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, FileCheck, Info, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { parseAbi } from 'viem';
import { toast } from 'sonner';
const REMITTANCE_ABI = parseAbi(['function getKYCStatus(address user) external view returns (uint8)', 'function requestKYC(string calldata documentHash) external']);
const getContractAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return undefined;
  }
  return address as `0x${string}`;
};
const KYCStatus = {
  0: 'NONE',
  1: 'PENDING',
  2: 'APPROVED',
  3: 'REJECTED'
} as const;
export function KYCRequestForm() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [documentHash, setDocumentHash] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const addr = getContractAddress();
    setContractAddress(addr);
    if (!addr) {
      toast.error('Contract address not configured properly');
    }
  }, []);
  const {
    data: kycStatusNum,
    refetch: refetchKYCStatus,
    isLoading: loadingKYCStatus,
    error: errorKYCStatus,
    isError: hasErrorKYCStatus
  } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getKYCStatus',
    args: [address!],
    account: address,
    query: {
      enabled: !!contractAddress && !!address && isConnected
    }
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  });
  const kycStatus = kycStatusNum !== undefined ? KYCStatus[kycStatusNum as keyof typeof KYCStatus] : undefined;
  useEffect(() => {
    if (isConfirmed) {
      setSuccess(true);
      setDocumentHash('');
      setLocalError(null);
      toast.success('KYC request submitted successfully!');
      setTimeout(() => {
        refetchKYCStatus();
      }, 2000);
    }
  }, [isConfirmed, refetchKYCStatus]);
  useEffect(() => {
    if (writeError) {
      console.error('KYC request error:', writeError);
      setLocalError(writeError.message || 'Transaction failed');
      toast.error('Failed to submit KYC request');
    }
  }, [writeError]);
  const handleConfirmSubmit = async () => {
    if (!contractAddress || !documentHash.trim()) {
      setLocalError('Please provide a document hash');
      return;
    }
    setSuccess(false);
    setLocalError(null);
    try {
      console.log('📞 Calling requestKYC with hash:', documentHash);
      await writeContract({
        address: contractAddress,
        abi: REMITTANCE_ABI,
        functionName: 'requestKYC',
        args: [documentHash.trim()]
      });
      console.log('✅ KYC request transaction submitted');
    } catch (error) {
      console.error('❌ KYC request failed:', error);
      setLocalError(error instanceof Error ? error.message : 'Transaction failed');
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
  };
  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentHash(e.target.value);
    setLocalError(null);
    setSuccess(false);
  };
  const canSubmitKYC = kycStatus === 'NONE' || kycStatus === 'REJECTED';
  const isTransactionInProgress = isPending || isConfirming;
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            KYC Verification Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Please connect your wallet to submit KYC request</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!contractAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            KYC Verification Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Contract address not configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          KYC Verification Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingKYCStatus ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : hasErrorKYCStatus ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error loading KYC status. Please refresh the page and try again.</AlertDescription>
          </Alert>
        ) : !canSubmitKYC ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{kycStatus === 'PENDING' ? 'Your KYC request is currently under review. Please wait for admin approval.' : kycStatus === 'APPROVED' ? 'Your KYC has already been approved. No further action needed.' : 'Unable to determine KYC status. Please refresh and try again.'}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentHash">Document Hash (IPFS/Storage Hash)</Label>
              <Input id="documentHash" type="text" placeholder="Enter your document hash (e.g., QmXXX...)" value={documentHash} onChange={handleHashChange} className="font-mono text-sm" disabled={isTransactionInProgress} />
              <p className="text-xs text-muted-foreground">Provide the hash of your uploaded identity document. This will be stored on the blockchain for verification.</p>
            </div>
            {/* Placeholder for future file upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/10">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">File upload integration coming soon</p>
              <p className="text-xs text-muted-foreground">For now, please manually enter the document hash above</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">KYC Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Government-issued photo ID (passport, driver's license, national ID)</li>
                <li>• Clear, high-resolution image or PDF</li>
                <li>• All information must be clearly visible</li>
                <li>• Document must be valid and not expired</li>
                <li>• Upload to IPFS or secure storage and provide the hash</li>
              </ul>
            </div>
            {/* Transaction Status */}
            {isTransactionInProgress && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {isPending ? 'Submitting transaction...' : 'Waiting for confirmation...'}
                  {hash && (
                    <p className="text-xs mt-1 font-mono">
                      Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {/* Error Display */}
            {(localError || writeError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localError || writeError?.message || 'Transaction failed'}</AlertDescription>
              </Alert>
            )}
            {/* Success Display */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  KYC request submitted successfully! You will be notified once it's reviewed.
                  {hash && <p className="text-xs mt-1 font-mono">Transaction: {hash}</p>}
                </AlertDescription>
              </Alert>
            )}
            <ConfirmationModal
              trigger={
                <Button type="button" disabled={isTransactionInProgress || !documentHash.trim()} className="w-full">
                  {isTransactionInProgress ? (isPending ? 'Submitting...' : 'Confirming...') : 'Submit KYC Request'}
                </Button>
              }
              title="Submit KYC Request"
              description={`Are you sure you want to submit your KYC request? Your document hash "${documentHash}" will be stored on the blockchain for verification. This action cannot be undone.`}
              confirmText="Submit Request"
              onConfirm={handleConfirmSubmit}
              icon={<FileCheck className="h-5 w-5" />}
              disabled={isTransactionInProgress || !documentHash.trim()}
            />
          </form>
        )}
      </CardContent>
    </Card>
  );
}
