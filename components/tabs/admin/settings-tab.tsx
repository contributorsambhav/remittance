'use client';

import { AlertTriangle, CheckCircle, DollarSign, Loader2, Pause, Play, Settings, Shield, Users, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
const REMITTANCE_ABI = [
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint8', name: 'tier', type: 'uint8' }],
    name: 'getTierLimit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tier', type: 'uint8' },
      { internalType: 'uint256', name: 'newLimit', type: 'uint256' }
    ],
    name: 'setTierLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) || '0x3fcac36FD5415e50ECA49e2B45F6B4D8893f029d';
const TIERS = [
  { id: 1, name: 'TIER1', label: 'Basic', description: 'New users' },
  { id: 2, name: 'TIER2', label: 'Standard', description: 'Verified users' },
  { id: 3, name: 'TIER3', label: 'Premium', description: 'High-volume users' },
  { id: 4, name: 'VIP', label: 'VIP', description: 'Enterprise users' }
];
function ConfirmationModal({ trigger, title, description, confirmText, onConfirm, variant = 'default', icon }: { trigger: React.ReactNode; title: string; description: string; confirmText: string; onConfirm: () => void; variant?: 'default' | 'destructive'; icon?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              {icon}
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{description}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={variant}
                onClick={() => {
                  onConfirm();
                  setIsOpen(false);
                }}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function EmergencyConfirmationModal({ trigger, title, description, onConfirm, disabled = false }: { trigger: React.ReactNode; title: string; description: string; onConfirm: () => void; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const isConfirmValid = confirmText === 'EMERGENCY';
  return (
    <>
      <div onClick={() => !disabled && setIsOpen(true)}>{trigger}</div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600">{title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{description}</p>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-600 font-medium">Type "EMERGENCY" to confirm this action:</p>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type EMERGENCY" className="mt-2" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setConfirmText('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!isConfirmValid}
                onClick={() => {
                  onConfirm();
                  setIsOpen(false);
                  setConfirmText('');
                }}
              >
                Execute Emergency Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export function SettingsTab() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [tierLimits, setTierLimits] = useState<Record<number, string>>({});
  const [isUpdatingTier, setIsUpdatingTier] = useState<number | null>(null);
  const { data: isPaused, refetch: refetchPausedStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'paused'
  });
  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'owner'
  });
  const { data: contractBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'getContractBalance'
  });
  const { data: tier1Limit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [1]
  });
  const { data: tier2Limit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [2]
  });
  const { data: tier3Limit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [3]
  });
  const { data: tier4Limit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: REMITTANCE_ABI,
    functionName: 'getTierLimit',
    args: [4]
  });
  const { data: pauseHash, isPending: isPausing, writeContract: pauseContract } = useWriteContract();
  const { data: unpauseHash, isPending: isUnpausing, writeContract: unpauseContract } = useWriteContract();
  const { data: setTierLimitHash, isPending: isSettingTierLimit, writeContract: setTierLimitContract } = useWriteContract();
  const { data: emergencyWithdrawHash, isPending: isEmergencyWithdrawing, writeContract: emergencyWithdrawContract } = useWriteContract();
  const { isLoading: isPauseConfirming, isSuccess: isPauseSuccess } = useWaitForTransactionReceipt({
    hash: pauseHash
  });
  const { isLoading: isUnpauseConfirming, isSuccess: isUnpauseSuccess } = useWaitForTransactionReceipt({
    hash: unpauseHash
  });
  const { isLoading: isTierLimitConfirming, isSuccess: isTierLimitSuccess } = useWaitForTransactionReceipt({
    hash: setTierLimitHash
  });
  const { isLoading: isEmergencyWithdrawConfirming, isSuccess: isEmergencyWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: emergencyWithdrawHash
  });
  const isAdmin = address && contractOwner && address.toLowerCase() === contractOwner.toString().toLowerCase();
  useEffect(() => {
    const limits = [tier1Limit, tier2Limit, tier3Limit, tier4Limit];
    const newTierLimits: Record<number, string> = {};
    limits.forEach((limit, index) => {
      if (limit) {
        newTierLimits[index + 1] = (Number(limit) / 1e18).toString();
      }
    });
    setTierLimits(newTierLimits);
  }, [tier1Limit, tier2Limit, tier3Limit, tier4Limit]);
  useEffect(() => {
    if (isPauseSuccess) {
      toast({
        title: 'Contract Paused',
        description: 'The smart contract has been successfully paused.',
        variant: 'default'
      });
      refetchPausedStatus();
    }
  }, [isPauseSuccess, toast, refetchPausedStatus]);
  useEffect(() => {
    if (isUnpauseSuccess) {
      toast({
        title: 'Contract Unpaused',
        description: 'The smart contract has been successfully resumed.',
        variant: 'default'
      });
      refetchPausedStatus();
    }
  }, [isUnpauseSuccess, toast, refetchPausedStatus]);
  useEffect(() => {
    if (isTierLimitSuccess) {
      toast({
        title: 'Tier Limit Updated',
        description: 'The tier limit has been successfully updated.',
        variant: 'default'
      });
      setIsUpdatingTier(null);
    }
  }, [isTierLimitSuccess, toast]);
  useEffect(() => {
    if (isEmergencyWithdrawSuccess) {
      toast({
        title: 'Emergency Withdrawal Executed',
        description: 'Contract funds have been withdrawn to admin address. Remember to unpause the contract when ready.',
        variant: 'destructive'
      });
    }
  }, [isEmergencyWithdrawSuccess, toast]);
  const handlePauseContract = () => {
    if (!isConnected || !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only the contract owner can perform this action.',
        variant: 'destructive'
      });
      return;
    }
    if (isPaused) {
      unpauseContract({
        address: CONTRACT_ADDRESS,
        abi: REMITTANCE_ABI,
        functionName: 'unpause'
      });
    } else {
      pauseContract({
        address: CONTRACT_ADDRESS,
        abi: REMITTANCE_ABI,
        functionName: 'pause'
      });
    }
  };
  const handleEmergencyPause = () => {
    if (!isConnected || !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only the contract owner can perform this action.',
        variant: 'destructive'
      });
      return;
    }
    pauseContract({
      address: CONTRACT_ADDRESS,
      abi: REMITTANCE_ABI,
      functionName: 'pause'
    });
  };
  const handleUpdateTierLimit = (tierId: number) => {
    if (!isConnected || !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only the contract owner can perform this action.',
        variant: 'destructive'
      });
      return;
    }
    const limitValue = tierLimits[tierId];
    if (!limitValue || isNaN(Number(limitValue))) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid numeric limit.',
        variant: 'destructive'
      });
      return;
    }
    setIsUpdatingTier(tierId);
    const limitInWei = BigInt(Math.floor(Number(limitValue) * 1e18));
    setTierLimitContract({
      address: CONTRACT_ADDRESS,
      abi: REMITTANCE_ABI,
      functionName: 'setTierLimit',
      args: [tierId, limitInWei]
    });
  };
  const handleEmergencyWithdraw = () => {
    if (!isConnected || !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only the contract owner can perform this action.',
        variant: 'destructive'
      });
      return;
    }
    if (!isPaused) {
      toast({
        title: 'Contract Must Be Paused',
        description: 'The contract must be paused before emergency withdrawal can be executed.',
        variant: 'destructive'
      });
      return;
    }
    emergencyWithdrawContract({
      address: CONTRACT_ADDRESS,
      abi: REMITTANCE_ABI,
      functionName: 'emergencyWithdraw'
    });
  };
  const handleTierLimitChange = (tierId: number, value: string) => {
    setTierLimits((prev) => ({ ...prev, [tierId]: value }));
  };
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">Wallet Not Connected</h3>
          <p className="text-gray-500">Please connect your wallet to access admin settings.</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have administrator privileges for this contract.</p>
        </div>
      </div>
    );
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
              <Badge className={isPaused ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>{isPaused ? 'PAUSED' : 'ACTIVE'}</Badge>
              <ConfirmationModal
                trigger={
                  <Button size="sm" variant="outline" disabled={isPausing || isUnpausing || isPauseConfirming || isUnpauseConfirming}>
                    {isPausing || isUnpausing || isPauseConfirming || isUnpauseConfirming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                    {isPaused ? 'Resume Contract' : 'Pause Contract'}
                  </Button>
                }
                title={isPaused ? 'Resume Smart Contract' : 'Pause Smart Contract'}
                description={isPaused ? 'Are you sure you want to resume the smart contract? This will allow all transactions to continue normally.' : 'Are you sure you want to pause the smart contract? This will stop all transactions system-wide until manually resumed.'}
                confirmText={isPaused ? 'Resume Contract' : 'Pause Contract'}
                onConfirm={handlePauseContract}
                variant={isPaused ? 'default' : 'destructive'}
                icon={isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tier Limits Configuration
            </h4>
            {TIERS.map((tier) => (
              <div key={tier.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="w-16 font-medium">{tier.name}</Label>
                  <Badge variant="outline" className="text-xs">
                    {tier.label}
                  </Badge>
                  <span className="text-xs text-gray-500">({tier.description})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Daily limit in USD" className="flex-1" type="number" value={tierLimits[tier.id] || ''} onChange={(e) => handleTierLimitChange(tier.id, e.target.value)} disabled={isUpdatingTier === tier.id || isSettingTierLimit || isTierLimitConfirming} />
                  <Button size="sm" variant="outline" onClick={() => handleUpdateTierLimit(tier.id)} disabled={isUpdatingTier === tier.id || isSettingTierLimit || isTierLimitConfirming || !tierLimits[tier.id] || isNaN(Number(tierLimits[tier.id]))}>
                    {isUpdatingTier === tier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Emergency Actions</h4>
            <div className="space-y-2">
              <EmergencyConfirmationModal
                trigger={
                  <Button variant="destructive" size="sm" className="w-full" disabled={isPausing || isPauseConfirming || isPaused}>
                    {isPausing || isPauseConfirming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                    {isPaused ? 'Contract Already Paused' : 'Emergency Pause All Operations'}
                  </Button>
                }
                title="Emergency Pause All Operations"
                description="This will immediately halt all contract operations including transactions, KYC processing, and user interactions. You can resume operations later using the unpause function."
                onConfirm={handleEmergencyPause}
                disabled={isPaused}
              />
              <EmergencyConfirmationModal
                trigger={
                  <Button variant="destructive" size="sm" className="w-full" disabled={isEmergencyWithdrawing || isEmergencyWithdrawConfirming || !isPaused}>
                    {isEmergencyWithdrawing || isEmergencyWithdrawConfirming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                    {!isPaused ? 'Contract Must Be Paused First' : 'Emergency Withdraw Funds'}
                  </Button>
                }
                title="Emergency Withdraw Funds"
                description="This will withdraw all contract funds to the admin address. The contract must be paused first. Use only in critical security situations. Remember to unpause the contract afterwards if you want to resume operations."
                onConfirm={handleEmergencyWithdraw}
                disabled={!isPaused}
              />
            </div>
            <p className="text-xs text-red-600 mt-2">Emergency withdrawal requires the contract to be paused first. These actions require typing "EMERGENCY" to confirm.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Contract Information</h4>
            <div className="space-y-1 text-xs text-blue-700">
              <p>
                <strong>Contract:</strong> {CONTRACT_ADDRESS}
              </p>
              <p>
                <strong>Owner:</strong> {contractOwner ? `${contractOwner.toString().slice(0, 6)}...${contractOwner.toString().slice(-4)}` : 'Loading...'}
              </p>
              <p>
                <strong>Status:</strong> {isPaused ? 'Paused' : 'Active'}
              </p>
              <p>
                <strong>Balance:</strong> {contractBalance ? `${(Number(contractBalance) / 1e18).toFixed(4)} ETH` : 'Loading...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
