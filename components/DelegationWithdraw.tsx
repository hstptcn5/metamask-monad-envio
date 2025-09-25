"use client";

import { useState } from "react";
import { getMetaMaskSmartAccount } from "@/lib/smartAccount";
import { switchToMonadNetwork } from "@/lib/network";
import { publicClient } from "@/lib/clients";
import { erc20Abi } from "viem";
import { USDC_TEST } from "@/lib/chain";
import { redeemDelegationGasless, redeemDelegationReal } from "@/lib/delegation";

export default function DelegationWithdraw() {
  const [delegatorAddress, setDelegatorAddress] = useState<`0x${string}`>("0x1bd5aCb8069DA1051911eB80A37723aA1ce5919C");
  const [delegateAddress, setDelegateAddress] = useState<`0x${string}`>("0xa51DbFfE49FA6Fe3fC873094e47184aE624cd76f");
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [useGasless, setUseGasless] = useState(true);

  const checkBalance = async () => {
    try {
      await switchToMonadNetwork();
      
      const balance = await publicClient.readContract({
        address: USDC_TEST,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [delegateAddress],
      });

      const decimals = await publicClient.readContract({
        address: USDC_TEST,
        abi: erc20Abi,
        functionName: "decimals",
      });

      const formattedBalance = (Number(balance) / Math.pow(10, decimals)).toFixed(6);
      setBalance(`${formattedBalance} mUSDC`);
    } catch (err: any) {
      console.error("Balance check error:", err);
      setError(`Lỗi check balance: ${err.message}`);
    }
  };

  const withdrawFromDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Chuyển sang Monad Testnet
      await switchToMonadNetwork();

      // Lấy Smart Account của ví B (delegate)
      const delegateSmartAccount = await getMetaMaskSmartAccount();
      
      // Kiểm tra xem địa chỉ hiện tại có phải là delegate không
      if (delegateSmartAccount.address.toLowerCase() !== delegateAddress.toLowerCase()) {
        throw new Error(`Địa chỉ hiện tại (${delegateSmartAccount.address}) không khớp với delegate address (${delegateAddress})`);
      }

      let result;
      
      if (useGasless) {
        // Gasless withdrawal với Pimlico
        console.log("🚀 Sử dụng gasless transaction...");
        
        // Tìm signed delegation từ localStorage
        const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]');
        const delegation = existingDelegations.find((d: any) => 
          d.delegator.toLowerCase() === delegatorAddress.toLowerCase() &&
          d.delegate.toLowerCase() === delegateAddress.toLowerCase() &&
          d.status === "ACTIVE"
        );
        
        if (!delegation) {
          throw new Error(`Không tìm thấy delegation từ ${delegatorAddress} đến ${delegateAddress}`);
        }
        
        // Validate delegation amount (mock validation)
        const maxAmount = 1000; // Mock max amount
        if (withdrawAmount > maxAmount) {
          throw new Error(`Số tiền rút (${withdrawAmount}) vượt quá giới hạn delegation (${maxAmount} mUSDC)`);
        }
        
        result = await redeemDelegationGasless(
          delegateSmartAccount,
          delegation,
          withdrawAmount
        );
      } else {
        // Regular ERC20 transfer
        console.log("💰 Sử dụng regular transaction...");
        
        // Request accounts để authorize MetaMask
        if (typeof window !== "undefined" && window.ethereum) {
          await window.ethereum.request({
            method: "eth_requestAccounts",
          });
        }
        
        // Lấy EOA address từ MetaMask (ví A - delegator)
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        
        if (accounts.length === 0) {
          throw new Error("Không có tài khoản nào được kết nối");
        }
        
        const delegatorAddress = accounts[0];
        
        // Tạo wallet client để thực hiện transfer
        const { createWalletClient, custom } = await import("viem");
        const { monadTestnet } = await import("@/lib/chain");
        
        const walletClient = createWalletClient({
          account: delegatorAddress as `0x${string}`,
          transport: custom(window.ethereum),
          chain: monadTestnet,
        });

        // Thực hiện ERC20 transfer: ví A chuyển token cho ví B
        const txHash = await walletClient.writeContract({
          address: USDC_TEST,
          abi: erc20Abi,
          functionName: "transfer",
          args: [delegateAddress, BigInt(withdrawAmount * 1000000)],
        });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        result = {
          delegator: delegatorAddress,
          delegate: delegateAddress,
          requestedAmount: withdrawAmount,
          actualWithdrawn: withdrawAmount,
          transactionHash: txHash,
          status: "SUCCESS",
          message: `Đã rút thành công ${withdrawAmount} mUSDC từ delegation`,
          timestamp: new Date().toISOString(),
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber.toString(),
          gasless: false
        };
      }

      setResult(result);
      
      // Check balance sau khi rút
      setTimeout(() => {
        checkBalance();
      }, 1000);

    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>💰 Transfer Token (REAL)</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Ví A chuyển token thực tế cho ví B - ERC20 transfer thuần túy
      </p>
      
      <div style={{ marginBottom: 20, padding: 12, backgroundColor: "#fff3cd", borderRadius: 8, border: "1px solid #ffc107" }}>
        <button 
          onClick={() => {
            localStorage.removeItem('delegations');
            alert('Đã xóa tất cả delegation data từ localStorage');
          }}
          style={{ 
            padding: 8, 
            backgroundColor: "#ffc107", 
            color: "black", 
            border: "none", 
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          🗑️ Clear All Mock Data
        </button>
        <small style={{ display: "block", marginTop: 4 }}>
          Click để xóa tất cả mock data từ localStorage
        </small>
      </div>

      {/* Balance Check Section */}
      <div style={{ marginBottom: 20, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
        <h4>📊 Check Số Dư Ví B</h4>
        <p><strong>Delegate Address:</strong> {delegateAddress}</p>
        {balance && (
          <p style={{ color: "#00b894", fontWeight: "bold" }}>
            <strong>Số dư hiện tại:</strong> {balance}
          </p>
        )}
        <button 
          onClick={checkBalance}
          style={{ 
            padding: 8, 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Check Balance
        </button>
      </div>

      <form onSubmit={withdrawFromDelegation} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label>
            Delegator Address (Ví A - người ủy quyền)
            <input 
              value={delegatorAddress} 
              onChange={e => setDelegatorAddress(e.target.value as `0x${string}`)} 
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              placeholder="0x..."
            />
          </label>
        </div>

        <div>
          <label>
            Delegate Address (Ví B - người được ủy quyền)
            <input 
              value={delegateAddress} 
              onChange={e => setDelegateAddress(e.target.value as `0x${string}`)} 
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              placeholder="0x..."
            />
          </label>
        </div>

        <div>
          <label>
            Amount to Withdraw (mUSDC)
            <input 
              type="number" 
              value={withdrawAmount} 
              onChange={e => setWithdrawAmount(Number(e.target.value))} 
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              min="1"
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input 
              type="checkbox" 
              checked={useGasless}
              onChange={e => setUseGasless(e.target.checked)}
            />
            <span>🚀 Use Gasless Transaction (Pimlico)</span>
          </label>
          <small style={{ color: "#666", marginLeft: 24 }}>
            {useGasless ? "User không cần trả gas fee" : "User phải trả gas fee"}
          </small>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: 12, 
            backgroundColor: loading ? "#ccc" : "#dc3545", 
            color: "white", 
            border: "none", 
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Đang chuyển..." : "Ví A chuyển Token cho Ví B"}
        </button>
      </form>

      {error && (
        <div style={{ 
          padding: 12, 
          backgroundColor: "#ffe6e6", 
          border: "1px solid #ff6b6b", 
          borderRadius: 8,
          color: "#d63031",
          marginTop: 16
        }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: 12, 
          backgroundColor: "#e0ffe0", 
          border: "1px solid #00b894", 
          borderRadius: 8,
          color: "#00b894",
          marginTop: 16
        }}>
          <strong>✅ Withdrawal Successful!</strong>
          <div style={{ marginTop: 8 }}>
            <p><strong>Delegator:</strong> {result.delegator}</p>
            <p><strong>Delegate:</strong> {result.delegate}</p>
            <p><strong>Requested Amount:</strong> {result.requestedAmount} mUSDC</p>
            <p><strong>Actual Withdrawn:</strong> {result.actualWithdrawn} mUSDC</p>
            {result.userOpHash && (
              <p><strong>UserOp Hash:</strong> {result.userOpHash}</p>
            )}
            <p><strong>Transaction Hash:</strong> {result.transactionHash}</p>
            <p><strong>Type:</strong> {result.gasless ? "🚀 Gasless (Pimlico)" : "💰 Regular"}</p>
            <p><strong>Block Number:</strong> {result.blockNumber}</p>
            <p><strong>Gas Used:</strong> {result.gasUsed}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Message:</strong> {result.message}</p>
            <p><strong>Withdrawn At:</strong> {new Date(result.timestamp).toLocaleString()}</p>
          </div>
          
          <div style={{ marginTop: 12, padding: 8, backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <strong>🎉 Success!</strong> Ví A đã chuyển thành công token cho ví B.
            <br />
            <small><strong>REAL TRANSACTION:</strong> Token đã được chuyển thực tế từ ví A sang ví B trên blockchain.</small>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
        <h4>📋 Hướng dẫn Transfer:</h4>
        <ol>
          <li><strong>Check Balance:</strong> Xem số dư hiện tại của ví B</li>
          <li><strong>Kết nối ví A:</strong> MetaMask phải kết nối với địa chỉ delegator</li>
          <li><strong>Nhập thông tin:</strong> Delegator và delegate addresses</li>
          <li><strong>Chọn amount:</strong> Số lượng muốn chuyển (không giới hạn)</li>
          <li><strong>Click Transfer:</strong> Ví A chuyển token cho ví B</li>
          <li><strong>Check Balance:</strong> Xem số dư sau khi chuyển</li>
        </ol>
        
        <h4>🔍 Kết quả mong đợi (REAL):</h4>
        <ul>
          <li><strong>Before:</strong> Ví B có 0 mUSDC</li>
          <li><strong>After:</strong> Ví B có {withdrawAmount} mUSDC</li>
          <li><strong>Ví A:</strong> Số dư giảm {withdrawAmount} mUSDC</li>
          <li><strong>Blockchain:</strong> Transaction thực tế được ghi vào block</li>
          <li><strong>Gas:</strong> Phải trả gas fee cho transaction</li>
        </ul>
      </div>
    </div>
  );
}
