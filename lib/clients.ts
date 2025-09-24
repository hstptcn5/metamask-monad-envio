import { createPublicClient, http } from "viem";
import { monadTestnet } from "./chain";

// Public client
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(monadTestnet.rpcUrls.default.http[0])
});

// (Tuỳ lib AA sử dụng với viem, ví dụ Pipmlico/permissionless…)
// Bạn có thể wrap bundler/paymaster riêng nếu SDK yêu cầu.
// Để đơn giản, mình để chỗ này là placeholder:
export const bundlerRpcUrl = process.env.BUNDLER_RPC_URL!;
export const paymasterRpcUrl = process.env.PAYMASTER_RPC_URL!;

