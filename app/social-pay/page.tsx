"use client";

import { useState } from "react";
import { DEFAULT_USDC, toUsdc } from "@/lib/delegation";
import { switchToMonadNetwork } from "@/lib/network";
import { createWalletClient, custom, parseAbi } from "viem";
import { monadTestnet } from "@/lib/chain";
import MetaMaskConnect from "@/components/MetaMaskConnect";

// ERC20 ABI
const erc20Abi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)"
]);

export default function SocialPayPage() {
  const [to, setTo] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000");
  const [amount, setAmount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTxHash(null);
    setError(null);
    
    try {
      // Đảm bảo đang ở Monad network
      await switchToMonadNetwork();

      // Kiểm tra MetaMask connection
      if (!window.ethereum) {
        throw new Error("MetaMask không được cài đặt");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("Không có tài khoản nào được kết nối");
      }

      const account = accounts[0];

      // Tạo wallet client
      const walletClient = createWalletClient({
        account: account as `0x${string}`,
        transport: custom(window.ethereum),
        chain: monadTestnet,
      });

      // Convert amount to wei (6 decimals for mUSDC)
      const amountWei = toUsdc(amount);

      // Transfer mUSDC
      const hash = await walletClient.writeContract({
        address: DEFAULT_USDC,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, amountWei]
      });

      setTxHash(hash);
    } catch (e: any) {
      console.error("Social tip error:", e);
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Social Tip</h2>
      <p>Gửi mUSDC từ EOA (ví deploy token) sang bất kỳ địa chỉ nào.</p>
      
      <div style={{ marginBottom: 20, padding: 16, backgroundColor: "#e3f2fd", borderRadius: 8 }}>
        <h4>💡 Hướng dẫn:</h4>
        <ul>
          <li><strong>Social Tip</strong> sử dụng <strong>EOA</strong> (ví deploy token) để gửi mUSDC</li>
          <li><strong>Delegation</strong> sử dụng <strong>Smart Account</strong> để tạo ủy quyền</li>
          <li>Đảm bảo EOA có đủ mUSDC để gửi</li>
        </ul>
      </div>
      
      <MetaMaskConnect />
      
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label>
          Gửi cho (address)
          <input 
            value={to} 
            onChange={e => setTo(e.target.value as `0x${string}`)} 
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            placeholder="0x..."
          />
        </label>
        <label>
          Số mUSDC
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(Number(e.target.value))}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </label>
        <button 
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
          {loading ? "Đang gửi..." : "Gửi mUSDC"}
        </button>
      </form>
      
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
      
      {txHash && (
        <div style={{ 
          marginTop: 10, 
          padding: 10, 
          backgroundColor: "#e8f5e8", 
          border: "1px solid #00b894", 
          borderRadius: 8,
          color: "#00b894"
        }}>
          <strong>✅ Đã gửi thành công!</strong>
          <p>Transaction hash: <code>{txHash}</code></p>
        </div>
      )}
    </div>
  );
}

