"use client";

import { useState } from "react";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/chain";
import { Implementation, toMetaMaskSmartAccount, getDeleGatorEnvironment } from "@metamask/delegation-toolkit";
import ClientOnly from "./ClientOnly";

function EIP7702UpgradeInner() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum;

  const upgradeToSmartAccount = async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask chưa được cài đặt");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Kết nối MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("Không có tài khoản nào được kết nối");
      }

      const userAccount = accounts[0];
      setAccount(userAccount);

      // 2. Tạo wallet client
      const walletClient = createWalletClient({
        account: userAccount as `0x${string}`,
        transport: custom(window.ethereum),
        chain: monadTestnet,
      });

      // 3. Tạo public client
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(monadTestnet.rpcUrls.default.http[0])
      });

      // 4. Lấy environment cho EIP-7702
      const environment = getDeleGatorEnvironment(monadTestnet.id);
      const contractAddress = environment.implementations.EIP7702StatelessDeleGatorImpl;

      console.log("EIP-7702 Contract Address:", contractAddress);

      // 5. Tạo authorization manually (vì signAuthorization không hỗ trợ JSON-RPC)
      const authorization = {
        chainId: BigInt(monadTestnet.id),
        invoker: userAccount as `0x${string}`,
        nonce: await publicClient.getTransactionCount({ address: userAccount as `0x${string}` }),
        expiry: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
        calls: [{
          target: userAccount as `0x${string}`,
          data: "0x",
          value: 0n,
          gasLimit: 0n
        }],
        delegate: contractAddress,
        context: "0x"
      };

      console.log("Authorization created:", authorization);

      // 6. Sign authorization với MetaMask
      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [
          userAccount,
          JSON.stringify({
            domain: {
              name: "EIP-7702",
              version: "1",
              chainId: monadTestnet.id,
              verifyingContract: contractAddress
            },
            types: {
              Authorization: [
                { name: "chainId", type: "uint256" },
                { name: "invoker", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "expiry", type: "uint256" },
                { name: "calls", type: "Call[]" },
                { name: "delegate", type: "address" },
                { name: "context", type: "bytes" }
              ],
              Call: [
                { name: "target", type: "address" },
                { name: "data", type: "bytes" },
                { name: "value", type: "uint256" },
                { name: "gasLimit", type: "uint256" }
              ]
            },
            primaryType: "Authorization",
            message: authorization
          })
        ]
      });

      console.log("Signature:", signature);

      // 7. Submit authorization với dummy transaction
      const hash = await walletClient.sendTransaction({
        authorizationList: [{
          ...authorization,
          signature: signature as `0x${string}`
        }],
        data: "0x",
        to: "0x0000000000000000000000000000000000000000",
      });

      console.log("EIP-7702 transaction hash:", hash);

      setSuccess(`✅ EOA đã được upgrade thành Smart Account! Tx: ${hash}`);

    } catch (err: any) {
      console.error("EIP-7702 upgrade error:", err);
      setError(err.message || "Lỗi khi upgrade EOA");
    } finally {
      setLoading(false);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div style={{ padding: 20, border: "1px solid #ff6b6b", borderRadius: 8, backgroundColor: "#ffe0e0" }}>
        <h3>⚠️ MetaMask Required</h3>
        <p>Vui lòng cài đặt MetaMask extension để sử dụng tính năng này.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
      <h3>🔄 EIP-7702 Upgrade (EOA → Smart Account)</h3>
      <p>Upgrade EOA của bạn thành Smart Account để sử dụng delegation features.</p>
      
      {!account ? (
        <div>
          <p>Kết nối MetaMask để upgrade EOA:</p>
          <button 
            onClick={upgradeToSmartAccount} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: loading ? "#ccc" : "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang upgrade..." : "Upgrade EOA → Smart Account"}
          </button>
        </div>
      ) : (
        <div>
          <p><strong>✅ Đã kết nối:</strong> {account}</p>
          <p><strong>📝 Hướng dẫn:</strong></p>
          <ol>
            <li>Click "Upgrade EOA → Smart Account"</li>
            <li>Sign authorization trong MetaMask</li>
            <li>Confirm transaction</li>
            <li>EOA sẽ trở thành Smart Account</li>
          </ol>
          <button 
            onClick={upgradeToSmartAccount} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: loading ? "#ccc" : "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang upgrade..." : "Upgrade EOA → Smart Account"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: 10, 
          padding: 10, 
          backgroundColor: "#ffe0e0", 
          border: "1px solid #ff6b6b", 
          borderRadius: 8,
          color: "#d63031"
        }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{ 
          marginTop: 10, 
          padding: 10, 
          backgroundColor: "#e8f5e8", 
          border: "1px solid #00b894", 
          borderRadius: 8,
          color: "#00b894"
        }}>
          <strong>Thành công:</strong> {success}
        </div>
      )}
    </div>
  );
}

export default function EIP7702Upgrade() {
  return (
    <ClientOnly 
      fallback={
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
          <h3>🔄 EIP-7702 Upgrade</h3>
          <p>Đang tải...</p>
        </div>
      }
    >
      <EIP7702UpgradeInner />
    </ClientOnly>
  );
}
