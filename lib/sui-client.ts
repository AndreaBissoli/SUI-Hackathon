import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

// Initialize Sui client for testnet
export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

// Contract addresses and package ID (these would be set after deployment)
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x...";
export const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID || "0x...";

// Contract module names
export const MODULES = {
  EDU_DEFI: `${PACKAGE_ID}::edu_defi`,
  STUDENT: `${PACKAGE_ID}::student`,
  INVESTOR: `${PACKAGE_ID}::investor`,
  CONTRACT: `${PACKAGE_ID}::contract`,
} as const;

export const STRUCTS = {
  STUDENT: `${PACKAGE_ID}::student::Student`,
  INVESTOR: `${PACKAGE_ID}::investor::Investor`,
} as const;
