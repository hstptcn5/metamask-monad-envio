"use client";

import { useState } from "react";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/chain";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import ClientOnly from "./ClientOnly";

function SimpleSmartAccountInner() {
  const [account, setAccount] = useState<string | null>(null);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum;

  const createSmartAccount = async () => {
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

      // 4. Tạo MetaMask Smart Account (Hybrid implementation)
      const smartAccountImpl = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [userAccount, [], [], []],
        deploySalt: "0x",
        signer: { walletClient },
      });

      setSmartAccount(smartAccountImpl);
      setSuccess(`✅ Smart Account đã được tạo! Address: ${smartAccountImpl.address}`);

      console.log("Smart Account created:", smartAccountImpl);

    } catch (err: any) {
      console.error("Smart Account creation error:", err);
      setError(err.message || "Lỗi khi tạo Smart Account");
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
      <h3>🎯 Tạo Smart Account (Đơn giản)</h3>
      <p>Tạo Smart Account mới để sử dụng delegation features. <strong>Không cần upgrade EOA.</strong></p>
      
      {!account ? (
        <div>
          <p>Kết nối MetaMask để tạo Smart Account:</p>
          <button 
            onClick={createSmartAccount} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: loading ? "#ccc" : "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang tạo..." : "Tạo Smart Account"}
          </button>
        </div>
      ) : (
        <div>
          <p><strong>✅ Đã kết nối:</strong> {account}</p>
          {smartAccount && (
            <div style={{ marginTop: 12, padding: 12, backgroundColor: "#e8f5e8", borderRadius: 8 }}>
              <p><strong>🎯 Smart Account Address:</strong> {smartAccount.address}</p>
              <p><strong>📝 Lưu ý:</strong> Địa chỉ này khác với EOA của bạn</p>
            </div>
          )}
          <button 
            onClick={createSmartAccount} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: loading ? "#ccc" : "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang tạo..." : "Tạo Smart Account"}
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

      <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
        <h4>📋 Hướng dẫn:</h4>
        <ol>
          <li><strong>Kết nối MetaMask</strong> với bất kỳ tài khoản nào</li>
          <li><strong>Click "Tạo Smart Account"</strong></li>
          <li><strong>Smart Account mới</strong> sẽ được tạo với địa chỉ khác</li>
          <li><strong>Transfer mUSDC</strong> từ EOA sang Smart Account (nếu cần)</li>
          <li><strong>Tạo delegation</strong> từ Smart Account</li>
        </ol>
      </div>
    </div>
  );
}

export default function SimpleSmartAccount() {
  return (
    <ClientOnly 
      fallback={
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
          <h3>🎯 Tạo Smart Account</h3>
          <p>Đang tải...</p>
        </div>
      }
    >
      <SimpleSmartAccountInner />
    </ClientOnly>
  );
}
