"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Wallet, Shield, TrendingUp, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  
  // Wagmi hooks
  const { address, isConnected, isConnecting: wagmiConnecting } = useAccount()
  const { connect, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      setConnectionError("")
      console.log('Attempting to connect wallet...')
      await connect({ connector: injected() })
    } catch (error) {
      console.error("Connection failed:", error)
      setConnectionError(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "Failed to connect wallet"
      )
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting wallet...')
      await disconnect()
      setConnectionError("")
    } catch (error) {
      console.error("Disconnect failed:", error)
    }
  }

  // Format address for display
  interface FormatAddress {
    (addr: string | undefined): string
  }

  const formatAddress: FormatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RemitPay Dashboard
          </h1>
          <p className="text-muted-foreground text-pretty">
            Secure KYC-enabled financial platform for global remittances
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && address && (
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>Wallet Connected</span>
                <span className="text-xs font-mono">{formatAddress(address)}</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {(connectionError || connectError) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {connectionError || connectError?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Login Card */}
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              {isConnected ? "Wallet Connected" : "Connect Wallet"}
            </CardTitle>
            <CardDescription>
              {isConnected 
                ? "Your wallet is connected. The dashboard will load automatically." 
                : "Connect your MetaMask wallet to access the dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || wagmiConnecting} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting || wagmiConnecting ? "Connecting..." : "Connect with MetaMask"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">Connected</span>
                  </div>
                  <div className="text-xs text-green-700 font-mono mt-1">{address}</div>
                </div>

                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-blue-100 p-3 rounded-full mx-auto w-fit">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">KYC Verified</p>
          </div>
          <div className="space-y-2">
            <div className="bg-green-100 p-3 rounded-full mx-auto w-fit">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Daily Limits</p>
          </div>
          <div className="space-y-2">
            <div className="bg-purple-100 p-3 rounded-full mx-auto w-fit">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">Secure Wallet</p>
          </div>
        </div>
      </div>
    </div>
  )
}