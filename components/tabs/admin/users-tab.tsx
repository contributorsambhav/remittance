'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Filter, MoreHorizontal, Pause, Play, Search, UserCheck, UserX, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserActionConfirmationModal } from '@/components/ui/confirmation-modal';
import { useState } from 'react';
export function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const allUsers = [
    {
      id: '1',
      address: '0x123...abc',
      tier: 'TIER2',
      kycStatus: 'APPROVED',
      isWhitelisted: true,
      isBlacklisted: false,
      isFrozen: false,
      balance: '1500.50'
    },
    {
      id: '2',
      address: '0x456...def',
      tier: 'TIER1',
      kycStatus: 'APPROVED',
      isWhitelisted: true,
      isBlacklisted: false,
      isFrozen: false,
      balance: '750.25'
    },
    {
      id: '3',
      address: '0x789...ghi',
      tier: 'VIP',
      kycStatus: 'APPROVED',
      isWhitelisted: true,
      isBlacklisted: false,
      isFrozen: true,
      balance: '5000.00'
    }
  ];
  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TIER3':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TIER2':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TIER1':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const handleUserAction = (action: string, userId: string) => {
    console.log(`[v0] ${action} executed for user ${userId}`);
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{user.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTierColor(user.tier)}>{user.tier}</Badge>
                        <Badge className={getKYCStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
                        {user.isFrozen && <Badge variant="destructive">FROZEN</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Balance: ${user.balance}</p>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Crown className="h-4 w-4 mr-2" />
                    Change Tier
                  </Button>
                  {user.isFrozen ? (
                    <UserActionConfirmationModal
                      trigger={
                        <Button size="sm" variant="outline" className="text-green-600 bg-transparent">
                          <Play className="h-4 w-4 mr-2" />
                          Unfreeze
                        </Button>
                      }
                      action="unfreeze"
                      userAddress={user.address}
                      onConfirm={() => handleUserAction('unfreeze', user.id)}
                    />
                  ) : (
                    <UserActionConfirmationModal
                      trigger={
                        <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                          <Pause className="h-4 w-4 mr-2" />
                          Freeze
                        </Button>
                      }
                      action="freeze"
                      userAddress={user.address}
                      onConfirm={() => handleUserAction('freeze', user.id)}
                    />
                  )}
                  {user.isWhitelisted ? (
                    <UserActionConfirmationModal
                      trigger={
                        <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Whitelist
                        </Button>
                      }
                      action="remove-whitelist"
                      userAddress={user.address}
                      onConfirm={() => handleUserAction('remove-whitelist', user.id)}
                    />
                  ) : (
                    <UserActionConfirmationModal
                      trigger={
                        <Button size="sm" variant="outline" className="text-green-600 bg-transparent">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Whitelist
                        </Button>
                      }
                      action="whitelist"
                      userAddress={user.address}
                      onConfirm={() => handleUserAction('whitelist', user.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
