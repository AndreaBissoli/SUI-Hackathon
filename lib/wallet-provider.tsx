"use client"

import type React from "react"
import { WalletKitProvider } from "@mysten/wallet-kit"

export function SuiWalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletKitProvider>{children}</WalletKitProvider>
}
