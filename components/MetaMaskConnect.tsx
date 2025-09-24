"use client";

import { useState } from "react";
import { createWalletClient, custom, parseAbi, formatUnits } from "viem";
import { monadTestnet, USDC_TEST } from "@/lib/chain";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { createPublicClient, http } from "viem";
import { switchToMonadNetwork } from "@/lib/network";
import ClientOnly from "./ClientOnly";

// ERC20 ABI
const erc20Abi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
]);

function MetaMaskConnectInner() {
  const [account, setAccount] = useState<string | null>(null);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eoaBalance, setEoaBalance] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

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
      // Kiểm tra và chuyển network sang Monad Testnet
      await switchToMonadNetwork();

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

      // Lấy balance của EOA
      await getEOABalance(userAccount);

    } catch (err: any) {
      setError(err.message || "Lỗi khi kết nối MetaMask");
      console.error("MetaMask connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEOABalance = async (address: string) => {
    try {
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(monadTestnet.rpcUrls.default.http[0])
      });

      const balance = await publicClient.readContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`]
      });

      const decimals = await publicClient.readContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals"
      });

      const formattedBalance = formatUnits(balance, Number(decimals));
      setEoaBalance(formattedBalance);
    } catch (err) {
      console.error("Error getting EOA balance:", err);
    }
  };

  const transferToSmartAccount = async () => {
    if (!account || !smartAccount || !transferAmount) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setTransferLoading(true);
    setError(null);
    setTransferSuccess(null);

    try {
      // Đảm bảo đang ở Monad network
      await switchToMonadNetwork();
      const walletClient = createWalletClient({
        account: account as `0x${string}`,
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
      const amountWei = BigInt(Math.floor(parseFloat(transferAmount) * Math.pow(10, Number(decimals))));

      // Transfer
      const hash = await walletClient.writeContract({
        address: USDC_TEST as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [smartAccount.address, amountWei]
      });

      setTransferSuccess(`✅ Transfer thành công! Tx: ${hash}`);
      setTransferAmount("");

      // Update balance
      setTimeout(() => {
        getEOABalance(account);
      }, 2000);

    } catch (err: any) {
      console.error("Transfer error:", err);
      setError(err.message || "Lỗi khi transfer");
    } finally {
      setTransferLoading(false);
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
          
          {eoaBalance && (
            <div style={{ marginTop: 12, padding: 12, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
              <p><strong>💰 EOA Balance:</strong> {eoaBalance} mUSDC</p>
              <p><strong>📝 Hướng dẫn:</strong> Transfer mUSDC từ EOA sang Smart Account để tạo delegation</p>
            </div>
          )}

          <div style={{ marginTop: 12, padding: 12, backgroundColor: "#fff3cd", borderRadius: 8 }}>
            <h4>🌐 Network</h4>
            <p>Đảm bảo MetaMask đang ở Monad Testnet để thực hiện giao dịch.</p>
            <button
              onClick={switchToMonadNetwork}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ffc107",
                color: "black",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Chuyển sang Monad Testnet
            </button>
          </div>

          {smartAccount && eoaBalance && parseFloat(eoaBalance) > 0 && (
            <div style={{ marginTop: 12, padding: 12, backgroundColor: "#e3f2fd", borderRadius: 8 }}>
              <h4>💸 Transfer mUSDC to Smart Account</h4>
              <div style={{ display: "grid", gap: 8, maxWidth: 400 }}>
                <label>
                  Số lượng mUSDC
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="100"
                    style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                  />
                </label>
                <button
                  onClick={transferToSmartAccount}
                  disabled={transferLoading || !transferAmount}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: transferLoading ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: transferLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {transferLoading ? "Đang transfer..." : "Transfer to Smart Account"}
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={disconnect}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#ff6b6b", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              cursor: "pointer",
              marginTop: 12
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

      {transferSuccess && (
        <div style={{ 
          marginTop: 10, 
          padding: 10, 
          backgroundColor: "#e8f5e8", 
          border: "1px solid #00b894", 
          borderRadius: 8,
          color: "#00b894"
        }}>
          <strong>Thành công:</strong> {transferSuccess}
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
