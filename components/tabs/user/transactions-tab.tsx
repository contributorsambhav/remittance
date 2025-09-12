'use client';

import { BarChart3, Download, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
export function TransactionsTab() {
  const recentTransactions = [
    { id: '1', type: 'sent', amount: '250.00', recipient: '0x789...abc', date: '2024-01-15', status: 'completed' },
    { id: '2', type: 'received', amount: '500.00', sender: '0x456...def', date: '2024-01-14', status: 'completed' },
    { id: '3', type: 'sent', amount: '150.00', recipient: '0x123...xyz', date: '2024-01-13', status: 'pending' }
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          My Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">$2,450</p>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">$1,850</p>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'}`}>{tx.type === 'sent' ? <Send className="h-4 w-4 text-red-600" /> : <Download className="h-4 w-4 text-green-600" />}</div>
                  <div>
                    <p className="font-medium">
                      {tx.type === 'sent' ? 'Sent to' : 'Received from'} {tx.type === 'sent' ? tx.recipient : tx.sender}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${tx.amount}</p>
                  <Badge className={tx.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'}>{tx.status.toUpperCase()}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
