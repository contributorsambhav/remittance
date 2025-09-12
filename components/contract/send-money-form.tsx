'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatEther, isAddress, parseAbi, parseEther } from 'viem';
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type React from 'react';
import { toast } from 'sonner';
const REMITTANCE_ABI = parseAbi(['function sendRemittance(address recipient) external payable', 'function getMyBalance() external view returns (uint256)', 'function getMyKYCStatus() external view returns (uint8)', 'function getMyTier() external view returns (uint8)', 'function getMyRemainingLimit() external view returns (uint256)', 'function getMyWhitelistStatus() external view returns (bool)', 'function getMyBlacklistStatus() external view returns (bool)', 'function getMyFrozenStatus() external view returns (bool)', 'event Sent(address indexed sender, address indexed recipient, uint256 amount)']);
enum KYCStatus {
  NONE = 0,
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3
}
enum UserTier {
  NONE = 0,
  TIER1 = 1,
  TIER2 = 2,
  TIER3 = 3,
  VIP = 4
}
const getContractAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return undefined;
  }
  return address as `0x${string}`;
};
const getTierLabel = (tier: number) => {
  switch (tier) {
    case UserTier.NONE:
      return 'None';
    case UserTier.TIER1:
      return 'Tier 1';
    case UserTier.TIER2:
      return 'Tier 2';
    case UserTier.TIER3:
      return 'Tier 3';
    case UserTier.VIP:
      return 'VIP';
    default:
      return 'Unknown';
  }
};
const getKYCStatusLabel = (status: number) => {
  switch (status) {
    case KYCStatus.NONE:
      return 'None';
    case KYCStatus.PENDING:
      return 'Pending';
    case KYCStatus.APPROVED:
      return 'Approved';
    case KYCStatus.REJECTED:
      return 'Rejected';
    default:
      return 'Unknown';
  }
};
export function SendMoneyForm() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  useEffect(() => {
    const addr = getContractAddress();
    setContractAddress(addr);
    if (!addr) {
      setError('Contract address not configured properly');
    }
  }, []);
  const {
    data: kycStatus,
    refetch: refetchKYC,
    isError: hasKYCError
  } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getMyKYCStatus',
    account: address,
    query: {
      enabled: !!contractAddress && isConnected
    }
  });
  const {
    data: userTier,
    refetch: refetchTier,
    isError: hasTierError
  } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getMyTier',
    account: address,
    query: {
      enabled: !!contractAddress && isConnected
    }
  });
  const {
    data: remainingLimit,
    refetch: refetchLimit,
    isError: hasLimitError
  } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getMyRemainingLimit',
    account: address,
    query: {
      enabled: !!contractAddress && isConnected
    }
  });
  const { data: isWhitelisted, isError: hasWhitelistError } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getMyWhitelistStatus',
    account: address,
    query: {
      enabled: !!contractAddress && isConnected
    }
  });
  const { data: isBlacklisted, isError: hasBlacklistError } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getMyBlacklistStatus',
    account: address,
    query: {
      enabled: !!contractAddress && isConnected
    }
  });
  const { data: isFrozen, isError: hasFrozenError } = useReadContract({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    functionName: 'getMyFrozenStatus',
    account: address,
    query: {
      enabled: !!contractAddress && isConnected
    }
  });
  useWatchContractEvent({
    address: contractAddress,
    abi: REMITTANCE_ABI,
    eventName: 'Sent',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args?.sender?.toLowerCase() === address?.toLowerCase()) {
          setSuccess(true);
          setRecipient('');
          setAmount('');
          setIsLoading(false);
          toast.success(`Successfully sent ${formatEther(log.args.amount || BigInt(0))} ETH`);
          setTimeout(() => {
            refetchLimit();
            refetchKYC();
            refetchTier();
          }, 2000);
        }
      });
    }
  });
  const clearError = () => setError('');
  const handleConfirmSend = async () => {
    if (!contractAddress || !isConnected) {
      setError('Wallet not connected');
      return;
    }
    if (!isAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setSuccess(false);
    setError('');
    setIsLoading(true);
    try {
      const weiAmount = parseEther(amount);
      if (remainingLimit && weiAmount > remainingLimit) {
        throw new Error(`Amount exceeds daily limit. Available: ${formatEther(remainingLimit)} ETH`);
      }
      console.log('🚀 Sending remittance:', {
        recipient,
        amount: amount + ' ETH',
        weiAmount: weiAmount.toString(),
        contractAddress
      });
      const hash = await writeContract({
        address: contractAddress,
        abi: REMITTANCE_ABI,
        functionName: 'sendRemittance',
        args: [recipient as `0x${string}`],
        value: weiAmount // Send ETH as value, not as parameter
      });
      console.log('✅ Transaction submitted:', hash);
      toast.success(`Transaction submitted: ${hash}`);
    } catch (err: any) {
      console.error('❌ Send transaction failed:', err);
      setIsLoading(false);
      let errorMessage = 'Transaction failed';
      if (err.message) {
        if (err.message.includes('KYC not approved')) {
          errorMessage = 'Your KYC is not approved. Please complete KYC verification first.';
        } else if (err.message.includes('Access denied')) {
          errorMessage = 'Access denied. Your account may not be whitelisted or may be blacklisted.';
        } else if (err.message.includes('Daily limit exceeded')) {
          errorMessage = 'Daily sending limit exceeded. Try a smaller amount.';
        } else if (err.message.includes('Cannot send to self')) {
          errorMessage = 'You cannot send money to yourself';
        } else if (err.message.includes('Recipient is frozen')) {
          errorMessage = 'The recipient account is currently frozen';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH in your wallet';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const refreshData = () => {
    refetchKYC();
    refetchTier();
    refetchLimit();
  };
  const canSend = isConnected && contractAddress && kycStatus === KYCStatus.APPROVED && isWhitelisted && !isBlacklisted && !isFrozen;
  const isFormValid = recipient && amount && parseFloat(amount) > 0 && isAddress(recipient) && canSend;
  const remainingLimitFormatted = remainingLimit ? parseFloat(formatEther(remainingLimit)).toFixed(4) : '0';
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Money
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to send money.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  if (!contractAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Money
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Contract address not configured properly. Please check your environment variables.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Money
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* User Status Display */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>KYC Status:</span>
            <span className={kycStatus === KYCStatus.APPROVED ? 'text-green-600 font-medium' : 'text-yellow-600'}>{hasKYCError ? 'Error loading' : getKYCStatusLabel(kycStatus || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>User Tier:</span>
            <span className="font-medium">{hasTierError ? 'Error loading' : getTierLabel(userTier || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Available to send today:</span>
            <span className="font-medium text-blue-600">{hasLimitError ? 'Error loading' : `${remainingLimitFormatted} ETH`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Account Status:</span>
            <span className={canSend ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{canSend ? 'Ready to Send' : 'Cannot Send'}</span>
          </div>
        </div>
        {/* Warning messages for account issues */}
        {!canSend && isConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {kycStatus !== KYCStatus.APPROVED && 'KYC approval required. '}
              {!isWhitelisted && 'Account not whitelisted. '}
              {isBlacklisted && 'Account is blacklisted. '}
              {isFrozen && 'Account is frozen. '}
              Please contact support for assistance.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                clearError();
              }}
              disabled={isLoading}
              required
            />
            {recipient && !isAddress(recipient) && <p className="text-sm text-red-600">Invalid address format</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              min="0.0001"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clearError();
              }}
              disabled={isLoading}
              required
            />
            {amount && parseFloat(amount) <= 0 && <p className="text-sm text-red-600">Amount must be greater than 0</p>}
            {amount && remainingLimit && parseEther(amount) > remainingLimit && <p className="text-sm text-red-600">Amount exceeds daily limit (Available: {remainingLimitFormatted} ETH)</p>}
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
              <AlertDescription className="text-green-800">Transaction submitted successfully! It may take a few minutes to confirm.</AlertDescription>
            </Alert>
          )}
          <ConfirmationModal
            trigger={
              <Button type="button" disabled={isLoading || !isFormValid} className="w-full">
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </>
                )}
              </Button>
            }
            title="Confirm Transaction"
            description={
              <div className="space-y-2">
                <p>
                  Are you sure you want to send <strong>{amount} ETH</strong> to:
                </p>
                <p className="font-mono text-sm break-all bg-muted p-2 rounded">{recipient}</p>
                <p className="text-sm text-muted-foreground">This transaction cannot be reversed once confirmed on the blockchain.</p>
              </div>
            }
            confirmText="Send Transaction"
            onConfirm={handleConfirmSend}
            icon={<Send className="h-5 w-5" />}
          />
        </form>
      </CardContent>
    </Card>
  );
}
