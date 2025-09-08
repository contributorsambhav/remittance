// lib/wagmi.ts
'use client'

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, localhost, hardhat } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Define your supported chains
const chains = [mainnet, sepolia, localhost, hardhat] as const

// Create wagmi configuration
export const config = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
    // Add WalletConnect if you have a project ID
    // walletConnect({ projectId: 'your-project-id' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http('http://127.0.0.1:8545'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
})

// Re-export types
export type Config = typeof config