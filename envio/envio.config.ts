import { defineConfig } from "@envio/cli";

export default defineConfig({
  network: {
    rpcUrl: process.env.MONAD_RPC_URL!,   // dùng cùng RPC
    chainId: Number(process.env.MONAD_CHAIN_ID || 20143),
  },
  datasources: [
    // mUSDC Transfers
    {
      kind: "evm",
      name: "mUSDC",
      address: process.env.MUSDC_ADDRESS!, // địa chỉ token bạn vừa deploy
      startBlock: Number(process.env.START_BLOCK || 0),
      abi: [
        // MIN ABI for Transfer
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "name": "from", "type": "address"},
            {"indexed": true, "name": "to", "type": "address"},
            {"indexed": false, "name": "value", "type": "uint256"}
          ],
          "name": "Transfer",
          "type": "event"
        }
      ],
      handlers: [
        {
          event: "Transfer(address,address,uint256)",
          handler: "mappings/token.handleTransfer"
        }
      ]
    },

    // DelegationManager (bổ sung sau khi có address/ABI)
    // {
    //   kind: "evm",
    //   name: "DelegationManager",
    //   address: "0x...", // TODO
    //   startBlock: ...,
    //   abi: [...],       // ABI event RedeemedDelegation(...)
    //   handlers: [
    //     { event: "RedeemedDelegation(...)", handler: "mappings/delegation.handleRedeem" }
    //   ]
    // }
  ],
});

