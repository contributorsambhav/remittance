"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Search,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  amount: string
  fee: string
  status: "completed" | "pending" | "failed"
  timestamp: string
  blockNumber: number
  gasUsed: string
}

export function TransactionAnalytics() {
  const [timeRange, setTimeRange] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock analytics data
  const volumeData = [
    { date: "Jan 1", volume: 45000, transactions: 120 },
    { date: "Jan 2", volume: 52000, transactions: 145 },
    { date: "Jan 3", volume: 48000, transactions: 132 },
    { date: "Jan 4", volume: 61000, transactions: 167 },
    { date: "Jan 5", volume: 55000, transactions: 154 },
    { date: "Jan 6", volume: 67000, transactions: 189 },
    { date: "Jan 7", volume: 72000, transactions: 203 },
  ]

  const statusDistribution = [
    { name: "Completed", value: 1847, color: "#22c55e" },
    { name: "Pending", value: 156, color: "#f59e0b" },
    { name: "Failed", value: 23, color: "#ef4444" },
  ]

  const tierAnalytics = [
    { tier: "VIP", volume: 450000, count: 45, avgAmount: 10000 },
    { tier: "TIER3", volume: 320000, count: 128, avgAmount: 2500 },
    { tier: "TIER2", volume: 280000, count: 234, avgAmount: 1197 },
    { tier: "TIER1", volume: 180000, count: 456, avgAmount: 395 },
  ]

  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: "1",
      hash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
      from: "0x123...abc",
      to: "0x456...def",
      amount: "2500.00",
      fee: "0.025",
      status: "completed",
      timestamp: "2024-01-15T14:30:00Z",
      blockNumber: 18950123,
      gasUsed: "21000",
    },
    {
      id: "2",
      hash: "0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a",
      from: "0x789...ghi",
      to: "0x123...abc",
      amount: "1750.50",
      fee: "0.018",
      status: "pending",
      timestamp: "2024-01-15T14:25:00Z",
      blockNumber: 18950122,
      gasUsed: "21000",
    },
    {
      id: "3",
      hash: "0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2",
      from: "0x456...def",
      to: "0x789...ghi",
      amount: "850.25",
      fee: "0.012",
      status: "completed",
      timestamp: "2024-01-15T14:20:00Z",
      blockNumber: 18950121,
      gasUsed: "21000",
    },
    {
      id: "4",
      hash: "0xd4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2c3",
      from: "0xabc...123",
      to: "0xdef...456",
      amount: "3200.00",
      fee: "0.032",
      status: "failed",
      timestamp: "2024-01-15T14:15:00Z",
      blockNumber: 18950120,
      gasUsed: "21000",
    },
  ]

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || tx.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume (24h)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,430</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,026</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction Size</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,847</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.9%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.3% from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Volume</CardTitle>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                volume: {
                  label: "Volume ($)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="volume" fill="var(--color-volume)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: {
                  label: "Completed",
                  color: "#22c55e",
                },
                pending: {
                  label: "Pending",
                  color: "#f59e0b",
                },
                failed: {
                  label: "Failed",
                  color: "#ef4444",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tier Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Volume by User Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tierAnalytics.map((tier) => (
              <div key={tier.tier} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    className={
                      tier.tier === "VIP"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : tier.tier === "TIER3"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : tier.tier === "TIER2"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }
                  >
                    {tier.tier}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">${tier.volume.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{tier.count} transactions</p>
                  <p className="text-xs text-muted-foreground">Avg: ${tier.avgAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hash or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found matching your criteria</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.status === "completed"
                            ? "bg-green-100"
                            : tx.status === "pending"
                              ? "bg-yellow-100"
                              : "bg-red-100"
                        }`}
                      >
                        {tx.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : tx.status === "pending" ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {formatAddress(tx.from)} → {formatAddress(tx.to)}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${tx.amount}</p>
                      <Badge className={getStatusColor(tx.status)}>{tx.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Transaction Hash</p>
                      <p className="font-mono text-xs break-all">{tx.hash}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Block Number</p>
                      <p className="font-mono">{tx.blockNumber.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gas Used / Fee</p>
                      <p className="font-mono">
                        {tx.gasUsed} / ${tx.fee}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      View on Explorer
                    </Button>
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
