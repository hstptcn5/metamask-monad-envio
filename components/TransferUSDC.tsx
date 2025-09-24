"use client";

import { useState } from "react";
import { createWalletClient, custom, createPublicClient, http, parseAbi, formatUnits } from "viem";
import { monadTestnet, USDC_TEST } from "@/lib/chain";
import ClientOnly from "./ClientOnly";

// ERC20 ABI
const erc20Abi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
]);

function TransferUSDCInner() {
  const [fromAccount, setFromAccount] = useState<string | null>(null);
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("");

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum;

  const connectAndGetBalance = async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask chưa được cài đặt");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("Không có tài khoản nào được kết nối");
      }

      const account = accounts[0];
      setFromAccount(account);

      // Get balance
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(monadTestnet.rpcUrls.default.http[0])
      });

      const tokenBalance = await publicClient.readContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account as `0x${string}`]
      });

      const decimals = await publicClient.readContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals"
      });

      const formattedBalance = formatUnits(tokenBalance, Number(decimals));
      setBalance(formattedBalance);

    } catch (err: any) {
      setError(err.message || "Lỗi khi kết nối");
    }
  };

  const transferUSDC = async () => {
    if (!fromAccount || !toAccount || !amount) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const walletClient = createWalletClient({
        account: fromAccount as `0x${string}`,
        transport: custom(window.ethereum),
        chain: monadTestnet,
      });

      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(monadTestnet.rpcUrls.default.http[0])
      });

      // Get decimals
      const decimals = await publicClient.readContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals"
      });

      // Convert amount to wei
      const amountWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, Number(decimals))));

      // Transfer
      const hash = await walletClient.writeContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [toAccount as `0x${string}`, amountWei]
      });

      setSuccess(`✅ Transfer thành công! Tx: ${hash}`);

      // Update balance
      setTimeout(() => {
        connectAndGetBalance();
      }, 2000);

    } catch (err: any) {
      console.error("Transfer error:", err);
      setError(err.message || "Lỗi khi transfer");
    } finally {
      setLoading(false);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div style={{ padding: 20, border: "1px solid #ff6b6b", borderRadius: 8, backgroundColor: "#ffe0e0" }}>
        <h3>⚠️ MetaMask Required</h3>
        <p>Vui lòng cài đặt MetaMask extension.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
      <h3>💸 Transfer mUSDC</h3>
      <p>Transfer mUSDC từ EOA sang Smart Account để tạo delegation.</p>
      
      {!fromAccount ? (
        <div>
          <p>Kết nối MetaMask để xem balance:</p>
          <button 
            onClick={connectAndGetBalance}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Kết nối & Xem Balance
          </button>
        </div>
      ) : (
        <div>
          <p><strong>✅ Đã kết nối:</strong> {fromAccount}</p>
          {balance && (
            <p><strong>💰 Balance:</strong> {balance} mUSDC</p>
          )}
          
          <div style={{ display: "grid", gap: 12, maxWidth: 500, marginTop: 16 }}>
            <label>
              Địa chỉ nhận (Smart Account)
              <input
                type="text"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>
            
            <label>
              Số lượng mUSDC
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>
            
            <button
              onClick={transferUSDC}
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
              {loading ? "Đang transfer..." : "Transfer mUSDC"}
            </button>
          </div>
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

export default function TransferUSDC() {
  return (
    <ClientOnly 
      fallback={
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
          <h3>💸 Transfer mUSDC</h3>
          <p>Đang tải...</p>
        </div>
      }
    >
      <TransferUSDCInner />
    </ClientOnly>
  );
}
