'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Eye, FileCheck, RefreshCw, Search, Users, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatEther, parseAbi } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
const REMITTANCE_ABI = parseAbi(['function getPendingKYC() external view returns (address[] memory)', 'function getKYCRequest(address user) external view returns (string memory documentHash, uint256 timestamp, uint8 status, string memory rejectionReason)', 'function getUserInfo(address user) external view returns (uint8 tier, uint256 dailyLimit, uint256 todayUsed, uint256 balance, bool isWhitelistedUser, bool isBlacklistedUser, bool isFrozenUser, uint8 kycStatus)', 'function approveKYC(address user, uint8 tier) external', 'function rejectKYC(address user, string calldata reason) external', 'function batchApprove(address[] calldata users, uint8[] calldata tiers) external', 'function owner() external view returns (address)', 'function getTierLimit(uint8 tier) external view returns (uint256)', 'function getAllKYCUsers() external view returns (address[] memory)']);
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
const UserTier = {
  0: 'NONE',
  1: 'TIER1',
  2: 'TIER2',
  3: 'TIER3',
  4: 'VIP'
} as const;
interface TierLimits {
  [key: number]: string; // tier number -> formatted limit string
}
interface KYCRequestData {
  address: string;
  documentHash: string;
  timestamp: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  userInfo?: {
    tier: number;
    dailyLimit: string;
    balance: string;
    isWhitelisted: boolean;
    isBlacklisted: boolean;
    isFrozen: boolean;
  };
}
export function AdminKYCManagement() {
  const { address, isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<{ [key: string]: number }>({});
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<KYCRequestData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tierLimits, setTierLimits] = useState<TierLimits>({});
  const [loadingTierLimits, setLoadingTierLimits] = useState(true);
  useEffect(() => {
    const addr = getContractAddress();
    setContractAddress(addr);
    if (!addr) {
      toast.error('Contract address not configured properly');
    }
  }, []);
  const { data: contractOwner, refetch: refetchOwner } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'owner',
    query: {
      enabled: !!contractAddress && !!address && isConnected
    }
  });
  const {
    data: pendingAddresses,
    refetch: refetchPending,
    isLoading: loadingPending,
    error: errorPending,
    isError: hasErrorPending
  } = useReadContract({
    address: contractAddress,
    account: address,
    abi: REMITTANCE_ABI,
    functionName: 'getPendingKYC',
    query: {
      enabled: !!contractAddress && !!address && isConnected && isAdmin
    }
  });
  const { data: allKYCUsers, refetch: refetchAllUsers } = useReadContract({
    address: contractAddress,
    account: address,
    abi: REMITTANCE_ABI,
    functionName: 'getAllKYCUsers',
    query: {
      enabled: true
    }
  });
  const { data: tier1Limit } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [1],
    query: {
      enabled: !!contractAddress && isAdmin
    }
  });
  const { data: tier2Limit } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [2],
    query: {
      enabled: !!contractAddress && isAdmin
    }
  });
  const { data: tier3Limit } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [3],
    query: {
      enabled: !!contractAddress && isAdmin
    }
  });
  const { data: vipLimit } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [4],
    query: {
      enabled: !!contractAddress && isAdmin
    }
  });
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  });
  useEffect(() => {
    if (contractOwner && address) {
      const adminStatus = contractOwner.toLowerCase() === address.toLowerCase();
      setIsAdmin(adminStatus);
      if (!adminStatus && isConnected) {
        toast.error('Access denied: Admin privileges required');
      }
    }
  }, [contractOwner, address, isConnected]);
  useEffect(() => {
    if (tier1Limit !== undefined && tier2Limit !== undefined && tier3Limit !== undefined && vipLimit !== undefined) {
      setTierLimits({
        1: formatEther(tier1Limit),
        2: formatEther(tier2Limit),
        3: formatEther(tier3Limit),
        4: formatEther(vipLimit)
      });
      setLoadingTierLimits(false);
    }
  }, [tier1Limit, tier2Limit, tier3Limit, vipLimit]);
  useEffect(() => {
    if (!pendingAddresses || !contractAddress || !isAdmin) {
      setPendingRequests([]);
      return;
    }
    const fetchRequestDetails = async () => {
      try {
        const requests: KYCRequestData[] = [];
        for (const addr of pendingAddresses) {
          requests.push({
            address: addr,
            documentHash: 'Loading...',
            timestamp: new Date(),
            status: 'PENDING'
          });
        }
        setPendingRequests(requests);
      } catch (error) {
        console.error('Error fetching KYC details:', error);
        toast.error('Failed to fetch KYC request details');
      }
    };
    fetchRequestDetails();
  }, [pendingAddresses, contractAddress, isAdmin]);
  const refreshData = async () => {
    if (!isAdmin) return;
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPending(), refetchOwner(), refetchAllUsers()]);
      toast.success('KYC data refreshed');
    } catch (error) {
      toast.error('Failed to refresh KYC data');
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleApprove = async (userAddress: string) => {
    const tier = selectedTier[userAddress] || 1;
    setProcessingRequest(userAddress);
    try {
      writeContract({
        address: contractAddress!,
        abi: REMITTANCE_ABI,
        functionName: 'approveKYC',
        args: [userAddress as `0x${string}`, tier]
      });
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
      setProcessingRequest(null);
    }
  };
  const handleReject = async (userAddress: string) => {
    const reason = rejectionReasons[userAddress];
    if (!reason?.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setProcessingRequest(userAddress);
    try {
      writeContract({
        address: contractAddress!,
        abi: REMITTANCE_ABI,
        functionName: 'rejectKYC',
        args: [userAddress as `0x${string}`, reason]
      });
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
      setProcessingRequest(null);
    }
  };
  const handleBatchApprove = async () => {
    const requestsToApprove = pendingRequests.filter((r) => selectedTier[r.address]);
    if (requestsToApprove.length === 0) {
      toast.error('Please select tiers for the requests you want to approve');
      return;
    }
    const addresses = requestsToApprove.map((r) => r.address as `0x${string}`);
    const tiers = requestsToApprove.map((r) => selectedTier[r.address]);
    try {
      writeContract({
        address: contractAddress!,
        abi: REMITTANCE_ABI,
        functionName: 'batchApprove',
        args: [addresses, tiers]
      });
    } catch (error) {
      console.error('Error batch approving:', error);
      toast.error('Failed to batch approve KYC requests');
    }
  };
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction completed successfully');
      setProcessingRequest(null);
      refreshData();
      if (processingRequest) {
        setSelectedTier((prev) => {
          const { [processingRequest]: _, ...rest } = prev;
          return rest;
        });
        setRejectionReasons((prev) => {
          const { [processingRequest]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [isConfirmed, processingRequest]);
  const filteredRequests = pendingRequests.filter((request) => request.address.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getTierName = (tier: number) => {
    if (loadingTierLimits) {
      return 'Loading limits...';
    }
    const limit = tierLimits[tier];
    if (!limit) {
      return `TIER ${tier} (Limit loading...)`;
    }
    switch (tier) {
      case 1:
        return `TIER 1 (${parseFloat(limit).toLocaleString()} ETH/day)`;
      case 2:
        return `TIER 2 (${parseFloat(limit).toLocaleString()} ETH/day)`;
      case 3:
        return `TIER 3 (${parseFloat(limit).toLocaleString()} ETH/day)`;
      case 4:
        return `VIP (${parseFloat(limit).toLocaleString()} ETH/day)`;
      default:
        return `TIER ${tier} (${parseFloat(limit).toLocaleString()} ETH/day)`;
    }
  };
  const renderErrorState = () => (
    <div className="text-sm text-red-500 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      Error loading admin data
    </div>
  );
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Admin KYC Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Please connect your wallet to access admin panel</p>
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
            Admin KYC Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Contract address not configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!isAdmin && contractOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Admin KYC Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Access denied: Admin privileges required</p>
            <p className="text-sm text-muted-foreground mt-2">Contract Owner: {contractOwner}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  const isLoading = loadingPending || isRefreshing;
  const isTransactionPending = isWritePending || isConfirming;
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : hasErrorPending ? 'Error' : pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KYC Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allKYCUsers ? allKYCUsers.length : <Skeleton className="h-8 w-16" />}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Owner</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : <Skeleton className="h-4 w-20" />}</div>
            <p className="text-xs text-muted-foreground">Admin address</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Access</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? <Badge className="bg-green-100 text-green-800 border-green-200">ADMIN</Badge> : <Badge variant="secondary">USER</Badge>}</div>
            <p className="text-xs text-muted-foreground">Access level</p>
          </CardContent>
        </Card>
      </div>
      {/* Tier Limits Display */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Current Tier Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((tier) => (
                <div key={tier} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{tier === 4 ? 'VIP' : `TIER ${tier}`}</div>
                  <div className="text-lg font-bold">{loadingTierLimits ? <Skeleton className="h-6 w-20" /> : `${parseFloat(tierLimits[tier] || '0').toLocaleString()} ETH`}</div>
                  <div className="text-xs text-muted-foreground">Daily limit</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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
                <Input placeholder="Search by address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading || isTransactionPending}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleBatchApprove} disabled={isLoading || isTransactionPending}>
                <Users className="h-4 w-4 mr-2" />
                Batch Approve
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasErrorPending && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{renderErrorState()}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending KYC requests</p>
                {hasErrorPending && <p className="text-sm mt-2">Unable to load requests from contract</p>}
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.address} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono text-sm">{request.address}</p>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">PENDING</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Submitted: {formatDate(request.timestamp)}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Document Hash (IPFS)</Label>
                    <p className="text-sm bg-muted p-2 rounded font-mono">{request.documentHash === 'Loading...' ? <Skeleton className="h-4 w-64" /> : request.documentHash}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assign Tier (if approving)</Label>
                      <Select
                        value={selectedTier[request.address]?.toString() || ''}
                        onValueChange={(value) =>
                          setSelectedTier((prev) => ({
                            ...prev,
                            [request.address]: parseInt(value)
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{getTierName(1)}</SelectItem>
                          <SelectItem value="2">{getTierName(2)}</SelectItem>
                          <SelectItem value="3">{getTierName(3)}</SelectItem>
                          <SelectItem value="4">{getTierName(4)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rejection Reason (if rejecting)</Label>
                      <Textarea
                        placeholder="Enter reason for rejection..."
                        value={rejectionReasons[request.address] || ''}
                        onChange={(e) =>
                          setRejectionReasons((prev) => ({
                            ...prev,
                            [request.address]: e.target.value
                          }))
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <ConfirmationModal
                      trigger={
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={isTransactionPending || processingRequest === request.address || !selectedTier[request.address] || loadingTierLimits}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processingRequest === request.address ? 'Approving...' : 'Approve'}
                        </Button>
                      }
                      title="Approve KYC Request"
                      description={`Are you sure you want to approve the KYC request for ${request.address}? They will be assigned ${getTierName(selectedTier[request.address])} status with corresponding daily limits.`}
                      confirmText="Approve KYC"
                      onConfirm={() => handleApprove(request.address)}
                      icon={<CheckCircle className="h-5 w-5" />}
                    />
                    <ConfirmationModal
                      trigger={
                        <Button size="sm" variant="destructive" disabled={isTransactionPending || processingRequest === request.address || !rejectionReasons[request.address]?.trim()}>
                          <XCircle className="h-4 w-4 mr-2" />
                          {processingRequest === request.address ? 'Rejecting...' : 'Reject'}
                        </Button>
                      }
                      title="Reject KYC Request"
                      description={`Are you sure you want to reject the KYC request for ${request.address}? Reason: "${rejectionReasons[request.address]}" This action will notify the user and they can resubmit with corrected documents.`}
                      confirmText="Reject KYC"
                      onConfirm={() => handleReject(request.address)}
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
  );
}
