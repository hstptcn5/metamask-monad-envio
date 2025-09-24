import { defineChain } from "viem/utils";

export const monadTestnet = defineChain({
  id: Number(process.env.MONAD_CHAIN_ID ?? 10143),
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { 
    default: { 
      http: [
        process.env.MONAD_RPC_URL ?? "https://rpc.monad-testnet.fastlane.xyz/eyJhIjoiMHhhZkRCOWVFMTMxOEFFYUFhMkVlM0U3YTA4NTAyMDAyODc1RjA0MkNBIiwidCI6MTc1ODcxNDAxOSwicyI6IjB4NjQyOTkwYWU2NzMzZWEwYzA4Yjk5ODk4ZTE2ODk4NWQ3MWY4ODcyYjZiYmE3YTg2Y2FlYjlkNWFiNzVhOTdhMzJhNzY4Nzk1ODIwZTM2NjlkOWY4Mjg4NGJjZTMzMzVjODk2YjViOTU2NzRiNjQxZWI1MzRlODUwODA3ZWYwM2MxYyJ9",
        "https://rpc.monad.testnet" // Fallback URL
      ] 
    } 
  }
});

export const USDC_TEST = "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698"; // mUSDC deployed on Monad testnet
