"use client";

import { useState } from "react";
import { createWalletClient, custom } from "viem";
import { monadTestnet } from "@/lib/chain";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { createPublicClient, http } from "viem";
import ClientOnly from "./ClientOnly";

function MetaMaskConnectInner() {
  const [account, setAccount] = useState<string | null>(null);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra MetaMask có sẵn không
  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum;

  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kết nối MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("Không có tài khoản nào được kết nối");
      }

      const userAccount = accounts[0];
      setAccount(userAccount);

      // Tạo wallet client từ MetaMask
      const walletClient = createWalletClient({
        account: userAccount as `0x${string}`,
        transport: custom(window.ethereum),
        chain: monadTestnet,
      });

      // Tạo public client
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(monadTestnet.rpcUrls.default.http[0]),
      });

      // Tạo MetaMask Smart Account
      const smartAccountImpl = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [userAccount, [], [], []],
        deploySalt: "0x",
        signer: { walletClient },
      });

      setSmartAccount(smartAccountImpl);
      console.log("MetaMask Smart Account created:", smartAccountImpl.address);

    } catch (err: any) {
      setError(err.message || "Lỗi khi kết nối MetaMask");
      console.error("MetaMask connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSmartAccount(null);
    setError(null);
  };

  if (!isMetaMaskInstalled) {
    return (
      <div style={{ padding: 20, border: "1px solid #ff6b6b", borderRadius: 8, backgroundColor: "#ffe0e0" }}>
        <h3>⚠️ MetaMask Required</h3>
        <p>Vui lòng cài đặt MetaMask extension để sử dụng tính năng này.</p>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          Tải MetaMask
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
      <h3>🔗 MetaMask Smart Account</h3>
      
      {!account ? (
        <div>
          <p>Kết nối MetaMask để tạo Smart Account:</p>
          <button 
            onClick={connectMetaMask} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#f6851b", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang kết nối..." : "Kết nối MetaMask"}
          </button>
        </div>
      ) : (
        <div>
          <p><strong>✅ Đã kết nối:</strong> {account}</p>
          {smartAccount && (
            <p><strong>🎯 Smart Account:</strong> {smartAccount.address}</p>
          )}
          <button 
            onClick={disconnect}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#ff6b6b", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Ngắt kết nối
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
    </div>
  );
}

export default function MetaMaskConnect() {
  return (
    <ClientOnly 
      fallback={
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
          <h3>🔗 MetaMask Smart Account</h3>
          <p>Đang tải...</p>
        </div>
      }
    >
      <MetaMaskConnectInner />
    </ClientOnly>
  );
}
