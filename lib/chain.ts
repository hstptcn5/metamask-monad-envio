import { defineChain } from "viem/utils";

export const monadTestnet = defineChain({
  id: Number(process.env.MONAD_CHAIN_ID ?? 20143), // TODO: xác nhận
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_RPC_URL ?? ""] } }
});

export const USDC_TEST = "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698"; // mUSDC deployed on Monad testnet
