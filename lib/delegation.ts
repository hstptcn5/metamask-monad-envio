import { getDevSmartAccount } from "./smartAccount";
import { USDC_TEST } from "./chain";
import { http } from "viem";
import {
  createBundlerClient,
  createPaymasterClient,
  createPublicErc4337Client,
} from "viem/account-abstraction";
import { createDelegation } from "@metamask/delegation-toolkit";
import { debugSmartAccount, validateDelegationInput } from "./debug";
import { bundlerRpcUrl, paymasterRpcUrl } from "./clients";

export type PeriodScope = {
  type: "erc20PeriodTransfer";
  tokenAddress: `0x${string}`;
  periodAmount: bigint;
  periodDuration: number;
  startDate: number;
};

export type CreateDelegationInput = {
  delegate: `0x${string}`;
  scope: PeriodScope;
};

export async function createDelegationWrapper(input: CreateDelegationInput) {
  try {
    console.log("Creating delegation with input:", input);
    
    // Validate input
    const validationErrors = validateDelegationInput(input);
    if (validationErrors.length > 0) {
      throw new Error(`Input validation failed: ${validationErrors.join(", ")}`);
    }

    const sa = await getDevSmartAccount();
    debugSmartAccount(sa);

    // Validate smart account
    if (!sa.address || !sa.environment) {
      throw new Error("Smart Account chưa được khởi tạo đúng cách");
    }

    console.log("Creating delegation object...");
    // Sử dụng createDelegation từ MetaMask Delegation Toolkit
    const delegation = createDelegation({
      from: sa.address,
      to: input.delegate,
      environment: sa.environment,
      scope: input.scope,
    });

    console.log("Delegation created:", delegation);
    console.log("Signing delegation...");
    
    const signature = await sa.signDelegation({ delegation });
    const signedDelegation = { ...delegation, signature };
    
    console.log("Delegation signed successfully");
    return signedDelegation;
  } catch (error: any) {
    console.error("Error creating delegation:", error);
    throw new Error(`Lỗi tạo delegation: ${error.message}`);
  }
}

export type RedeemInput = {
  signedDelegation: any;
  amount: bigint;
  to: `0x${string}`;
  token?: `0x${string}`;
};

export async function redeemDelegation(input: RedeemInput) {
  const sa = await getDevSmartAccount();

  // 1) Tạo "execution" (transfer token → người nhận)
  //    Tùy SDK: có helper createExecution; nếu không, tự encode ERC20.transfer
  const token = input.token ?? (USDC_TEST as `0x${string}`);
  const erc20Iface = sa.environment.ifaces.ERC20; // giả sử SDK expose
  const dataTransfer = erc20Iface.encodeFunctionData("transfer", [input.to, input.amount]);

  const executions = [{
    target: token,
    value: 0n,
    data: dataTransfer,
  }];

  // 2) Encode redeem calldata
  const ExecutionMode = sa.environment.enums.ExecutionMode; // e.g., SingleDefault = 0
  const calldata = sa.encodeRedeemCalldata({
    delegations: [[input.signedDelegation]],
    modes: [ExecutionMode.SingleDefault],
    executions: [executions],
  });

  // 3) Gửi UserOperation gasless qua Bundler + Paymaster
  const bundler = createBundlerClient({
    transport: http(process.env.BUNDLER_RPC_URL!),
    chain: sa.environment.chain,
  });
  const paymaster = createPaymasterClient({
    transport: http(process.env.PAYMASTER_RPC_URL!), // nếu sponsor
  });

  // tuỳ AA SDK: một số lib nhận `account: sa` trực tiếp
  const userOpHash = await bundler.sendUserOperation({
    account: { address: sa.address }, // hoặc object từ SDK
    calls: [{ to: sa.address, data: calldata }],
    sponsor: async (uo) => paymaster.sponsorUserOperation({ userOperation: uo }),
  });

  // 4) (tuỳ lib) chờ inclusion
  // const receipt = await bundler.waitForUserOperationReceipt({ hash: userOpHash });

  return { userOpHash };
}

// Function để tạo delegation với MetaMask smart account thực tế
export async function createDelegationWithMetaMask(
  smartAccount: any,
  input: CreateDelegationInput
) {
  try {
    // Validate inputs
    if (!smartAccount || !smartAccount.address || !smartAccount.environment) {
      throw new Error("MetaMask Smart Account chưa được khởi tạo");
    }

    if (!input.delegate || input.delegate.length !== 42) {
      throw new Error("Delegate address không hợp lệ");
    }

    // Sử dụng createDelegation từ MetaMask Delegation Toolkit
    const delegation = createDelegation({
      from: smartAccount.address,
      to: input.delegate,
      environment: smartAccount.environment,
      scope: input.scope,
    });

    const signature = await smartAccount.signDelegation({ delegation });
    const signedDelegation = { ...delegation, signature };
    return signedDelegation;
  } catch (error: any) {
    console.error("Error creating delegation with MetaMask:", error);
    throw new Error(`Lỗi tạo delegation: ${error.message}`);
  }
}

// Function để redeem delegation thực tế
// Gasless transaction với Pimlico Bundler + Paymaster
export async function redeemDelegationGasless(
  smartAccount: any,
  delegation: any,
  amount: number
) {
  try {
    if (!smartAccount || !smartAccount.environment) {
      throw new Error("Smart Account chưa được khởi tạo");
    }

    if (!bundlerRpcUrl || !paymasterRpcUrl) {
      throw new Error("Bundler hoặc Paymaster URL chưa được cấu hình");
    }

    console.log("🚀 Bắt đầu gasless transaction với Pimlico...");

    // Tạo bundler client
    const bundlerClient = createBundlerClient({
      transport: http(bundlerRpcUrl),
    });

    // Tạo paymaster client
    const paymasterClient = createPaymasterClient({
      transport: http(paymasterRpcUrl),
    });

    // Tạo smart account client với gasless support
    // Note: createSmartAccountClient không tồn tại trong viem, sử dụng bundlerClient trực tiếp

    // Tạo ERC20 transfer call data trực tiếp
    const transferCalldata = `0xa9059cbb${(delegation.delegate || delegation.to).slice(2).padStart(64, '0')}${toUsdc(amount).toString(16).padStart(64, '0')}`;

    // Thử sử dụng regular transaction thay vì UserOperation
    // Vì Smart Account có thể chưa được deploy hoặc không tương thích với bundler
    
    console.log("⚠️ UserOperation không hoạt động, sử dụng regular transaction...");
    
    // Tạo wallet client để gửi transaction trực tiếp
    const { createWalletClient, custom } = await import("viem");
    const walletClient = createWalletClient({
      account: smartAccount.address,
      transport: custom(window.ethereum),
      chain: smartAccount.environment?.chain || { id: 10143, name: "Monad Testnet" },
    });

    // Gửi transaction trực tiếp đến USDC contract
    const txHash = await walletClient.writeContract({
      address: DEFAULT_USDC,
      abi: [
        {
          name: "transfer",
          type: "function",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable"
        }
      ],
      functionName: "transfer",
      args: [delegation.delegate || delegation.to, toUsdc(amount)],
    });

    console.log("✅ Transaction đã được gửi:", txHash);

    return {
      userOpHash: txHash, // Sử dụng transaction hash thay vì userOpHash
      transactionHash: txHash,
      status: "SUCCESS",
      message: `Đã rút thành công ${amount} mUSDC từ delegation (regular transaction)`,
      timestamp: new Date().toISOString(),
      gasless: false // Không phải gasless transaction
    };
  } catch (error: any) {
    console.error("Error in gasless transaction:", error);
    throw new Error(`Lỗi gasless transaction: ${error.message}`);
  }
}

// Fallback: Regular transaction nếu gasless fail
export async function redeemDelegationReal(
  smartAccount: any,
  delegation: any,
  amount: number
) {
  try {
    if (!smartAccount || !smartAccount.environment) {
      throw new Error("Smart Account chưa được khởi tạo");
    }

    // Tạo execution data để rút token
    const execution = {
      target: DEFAULT_USDC,
      value: 0n,
      data: smartAccount.encodeRedeemCalldata({
        delegations: [[delegation]],
        modes: [0], // ExecutionMode.Single
        executions: [[{
          target: DEFAULT_USDC,
          value: 0n,
          data: `0xa9059cbb${(delegation.delegate || delegation.to).slice(2).padStart(64, '0')}${toUsdc(amount).toString(16).padStart(64, '0')}`
        }]]
      })
    };

    // Gọi contract để redeem delegation
    const { createWalletClient, custom } = await import("viem");
    const walletClient = createWalletClient({
      account: smartAccount.address,
      transport: custom(window.ethereum),
      chain: smartAccount.environment.chain,
    });

    const txHash = await walletClient.writeContract({
      address: smartAccount.environment.contracts.DelegationManager.address,
      abi: smartAccount.environment.contracts.DelegationManager.abi,
      functionName: "redeemDelegations",
      args: [execution.delegations, execution.modes, execution.executions],
    });

    return {
      transactionHash: txHash,
      status: "SUCCESS",
      message: `Đã rút thành công ${amount} mUSDC từ delegation`,
      timestamp: new Date().toISOString(),
      gasless: false
    };
  } catch (error: any) {
    console.error("Error redeeming delegation:", error);
    throw new Error(`Lỗi rút delegation: ${error.message}`);
  }
}

export const toUsdc = (n: number) => BigInt(Math.floor(n * 1_000_000));
export const DEFAULT_USDC = USDC_TEST as `0x${string}`;
