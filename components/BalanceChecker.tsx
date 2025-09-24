"use client";

import { useState } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { monadTestnet } from "@/lib/chain";
import ClientOnly from "./ClientOnly";

// ERC20 ABI for balance checking
const erc20Abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
]);

function BalanceCheckerInner() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenAddress = "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698"; // mUSDC

  const checkBalance = async () => {
    if (!address || address.length !== 42 || !address.startsWith('0x')) {
      setError("Vui lòng nhập địa chỉ hợp lệ (42 ký tự, bắt đầu bằng 0x)");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Thử nhiều RPC endpoints với timeout
      const rpcUrls = [
        "https://rpc.monad-testnet.fastlane.xyz/eyJhIjoiMHhhZkRCOWVFMTMxOEFFYUFhMkVlM0U3YTA4NTAyMDAyODc1RjA0MkNBIiwidCI6MTc1ODcxNDAxOSwicyI6IjB4NjQyOTkwYWU2NzMzZWEwYzA4Yjk5ODk4ZTE2ODk4NWQ3MWY4ODcyYjZiYmE3YTg2Y2FlYjlkNWFiNzVhOTdhMzJhNzY4Nzk1ODIwZTM2NjlkOWY4Mjg4NGJjZTMzMzVjODk2YjViOTU2NzRiNjQxZWI1MzRlODUwODA3ZWYwM2MxYyJ9", // RPC riêng của bạn
        "https://rpc.monad.testnet",
        "https://testnet-rpc.monad.xyz"
      ];

      let publicClient;
      let lastError;

      for (const rpcUrl of rpcUrls) {
        try {
          publicClient = createPublicClient({
            chain: monadTestnet,
            transport: http(rpcUrl, {
              timeout: 10000, // 10 seconds timeout
              retryCount: 2,
              retryDelay: 1000
            })
          });
          
          // Test connection với một call đơn giản
          await publicClient.getChainId();
          console.log(`Connected to RPC: ${rpcUrl}`);
          break;
        } catch (error) {
          console.warn(`RPC ${rpcUrl} failed:`, error);
          lastError = error;
          continue;
        }
      }

      if (!publicClient) {
        throw new Error(`Tất cả RPC endpoints đều failed. Lỗi cuối: ${lastError?.message}`);
      }

      const token = {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi
      };

      // Get token info
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        publicClient.readContract({ ...token, functionName: "name" }),
        publicClient.readContract({ ...token, functionName: "symbol" }),
        publicClient.readContract({ ...token, functionName: "decimals" }),
        publicClient.readContract({ ...token, functionName: "totalSupply" })
      ]);

      // Get balance
      const balance = await publicClient.readContract({
        ...token,
        functionName: "balanceOf",
        args: [address as `0x${string}`]
      });

      // Format results
      const formattedBalance = Number(balance) / Math.pow(10, Number(decimals));
      const formattedTotalSupply = Number(totalSupply) / Math.pow(10, Number(decimals));

      setResult({
        address,
        tokenInfo: { name, symbol, decimals: Number(decimals) },
        balance: {
          raw: balance.toString(),
          formatted: formattedBalance.toFixed(6)
        },
        totalSupply: {
          raw: totalSupply.toString(),
          formatted: formattedTotalSupply.toFixed(6)
        }
      });

    } catch (err: any) {
      console.error("Balance check error:", err);
      
      // Nếu RPC failed, hiển thị mock data để demo
      if (err.message?.includes("timeout") || err.message?.includes("RPC")) {
        setError(`RPC timeout: ${err.message}. Hiển thị mock data để demo:`);
        
        // Mock data cho demo
        const mockResult = {
          address,
          tokenInfo: { 
            name: "Monad USDC Test", 
            symbol: "mUSDC", 
            decimals: 6 
          },
          balance: {
            raw: address.toLowerCase().includes("deployer") ? "1000000000000" : "0",
            formatted: address.toLowerCase().includes("deployer") ? "1000000.000000" : "0.000000"
          },
          totalSupply: {
            raw: "1000000000000",
            formatted: "1000000.000000"
          },
          isMock: true
        };
        
        setResult(mockResult);
      } else {
        setError(err.message || "Lỗi khi kiểm tra balance");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
      <h3>🔍 Balance Checker (mUSDC)</h3>
      <p>Kiểm tra balance của bất kỳ địa chỉ nào trên Monad testnet</p>
      
      <div style={{ display: "grid", gap: 12, maxWidth: 600 }}>
        <label>
          Địa chỉ cần kiểm tra
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x1234567890123456789012345678901234567890"
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </label>
        
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={checkBalance}
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
            {loading ? "Đang kiểm tra..." : "Kiểm tra Balance"}
          </button>
          
          <button
            onClick={() => {
              setAddress("0x1234567890123456789012345678901234567890");
              setResult({
                address: "0x1234567890123456789012345678901234567890",
                tokenInfo: { name: "Monad USDC Test", symbol: "mUSDC", decimals: 6 },
                balance: { raw: "1000000000000", formatted: "1000000.000000" },
                totalSupply: { raw: "1000000000000", formatted: "1000000.000000" },
                isMock: true
              });
              setError(null);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Demo Mock Data
          </button>
        </div>

        {error && (
          <div style={{
            padding: 12,
            backgroundColor: "#ffe0e0",
            border: "1px solid #ff6b6b",
            borderRadius: 8,
            color: "#d63031"
          }}>
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            padding: 16,
            backgroundColor: result.isMock ? "#fff3cd" : "#e8f5e8",
            border: `1px solid ${result.isMock ? "#ffc107" : "#00b894"}`,
            borderRadius: 8,
            color: result.isMock ? "#856404" : "#00b894"
          }}>
            <h4>{result.isMock ? "⚠️ Mock Data (RPC Failed)" : "✅ Kết quả kiểm tra"}</h4>
            {result.isMock && (
              <p style={{ fontStyle: "italic", marginBottom: 12 }}>
                Dữ liệu mock vì RPC timeout. Trong thực tế, deployer sẽ có 1,000,000 mUSDC.
              </p>
            )}
            <div style={{ marginTop: 12 }}>
              <p><strong>Token:</strong> {result.tokenInfo.name} ({result.tokenInfo.symbol})</p>
              <p><strong>Decimals:</strong> {result.tokenInfo.decimals}</p>
              <p><strong>Địa chỉ:</strong> {result.address}</p>
              <p><strong>Balance:</strong> {result.balance.formatted} {result.tokenInfo.symbol}</p>
              <p><strong>Raw Balance:</strong> {result.balance.raw}</p>
              <p><strong>Total Supply:</strong> {result.totalSupply.formatted} {result.tokenInfo.symbol}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BalanceChecker() {
  return (
    <ClientOnly 
      fallback={
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
          <h3>🔍 Balance Checker</h3>
          <p>Đang tải...</p>
        </div>
      }
    >
      <BalanceCheckerInner />
    </ClientOnly>
  );
}
