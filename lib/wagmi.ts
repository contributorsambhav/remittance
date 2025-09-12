'use client'

import { createConfig, http } from 'wagmi'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
const SONIC_RPC_URL = process.env.NEXT_PUBLIC_SONIC_RPC_URL as string
const SONIC_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '14601')
export const sonicTestnet = {
  id: SONIC_CHAIN_ID,
  name: 'Sonic Testnet',
  network: 'sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: [SONIC_RPC_URL] },
    public: { http: [SONIC_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Sonic Explorer', url: 'https://explorer.testnet.soniclabs.com' },
  },
  testnet: true,
} as const
export const config = createConfig({
  chains: [sonicTestnet],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sonicTestnet.id]: http(SONIC_RPC_URL),
  },
})
export type Config = typeof config
