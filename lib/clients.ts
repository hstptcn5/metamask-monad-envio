import { createPublicClient, http } from "viem";
import { monadTestnet } from "./chain";

// Lấy RPC URL với fallback
const getRpcUrl = () => {
  const envUrl = process.env.MONAD_RPC_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl;
  }
  return "https://rpc.monad.testnet"; // Fallback URL
};

// Public client
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(getRpcUrl())
});

// Bundler và Paymaster URLs (có thể để trống cho demo)
export const bundlerRpcUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || process.env.BUNDLER_RPC_URL || "";
export const paymasterRpcUrl = process.env.NEXT_PUBLIC_PAYMASTER_RPC_URL || process.env.PAYMASTER_RPC_URL || "";

