import { privateKeyToAccount } from "viem/accounts";
import { publicClient } from "./clients";
import { monadTestnet } from "./chain";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";

export type SmartAccount = {
  address: `0x${string}`;
  signDelegation: (payload: any) => Promise<`0x${string}`>;
  encodeRedeemCalldata: (args: {
    delegations: any[][];
    modes: number[];          // ExecutionMode enums
    executions: any[][];
  }) => `0x${string}`;
  environment: any;            // từ SDK (cần cho createDelegation)
};

let _sa: SmartAccount | null = null;

export async function getDevSmartAccount(): Promise<SmartAccount> {
  if (_sa) return _sa;

  const pk = process.env.DEV_PRIVATE_KEY!;
  const signer = privateKeyToAccount(pk);

  // Tạo MetaMask Smart Account theo hướng dẫn chính thức
  const saImpl = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,   // Hybrid smart account
    deployParams: [signer.address, [], [], []],
    deploySalt: "0x",
    signer: { account: signer },
  });

  _sa = {
    address: saImpl.address as `0x${string}`,
    signDelegation: async (payload: any) => {
      return saImpl.signDelegation(payload);
    },
    encodeRedeemCalldata: (args) => {
      // Sử dụng DelegationManager encoder từ environment
      return saImpl.environment.contracts.DelegationManager.encode.redeemDelegations({
        delegations: args.delegations,
        modes: args.modes,
        executions: args.executions,
      });
    },
    environment: saImpl.environment,
  };
  return _sa;
}
