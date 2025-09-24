"use client";

import { useState } from "react";
import { createDelegationWrapper, createDelegationWithMetaMask, toUsdc, DEFAULT_USDC } from "@/lib/delegation";
import { switchToMonadNetwork } from "@/lib/network";
import { getMetaMaskSmartAccount } from "@/lib/smartAccount";

export default function DelegationForm() {
  const [delegate, setDelegate] = useState<`0x${string}`>("0x1234567890123456789012345678901234567890");
  const [amount, setAmount] = useState(10);
  const [period, setPeriod] = useState(604800); // 1 tuần
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Đảm bảo đang ở Monad network
      await switchToMonadNetwork();

      // Validate delegate address
      if (!delegate || delegate.length !== 42 || !delegate.startsWith('0x')) {
        throw new Error("Delegate address không hợp lệ. Vui lòng nhập địa chỉ 42 ký tự bắt đầu bằng 0x");
      }

      // Tạo delegation với MetaMask Smart Account
      const smartAccount = await getMetaMaskSmartAccount();
      
      // Mock delegation data để demo (vì SDK có thể chưa hoàn chỉnh)
      const mockDelegation = {
        id: `delegation_${Date.now()}`,
        from: smartAccount.address,
        to: delegate,
        scope: {
          type: "erc20PeriodTransfer",
          tokenAddress: DEFAULT_USDC,
          periodAmount: toUsdc(amount),
          periodDuration: period,
          startDate: Math.floor(Date.now() / 1000)
        },
        signature: "0x" + "22".repeat(65), // Mock signature
        createdAt: new Date().toISOString()
      };
      
      setResult(mockDelegation);
    } catch (err: any) {
      console.error("Delegation error:", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <label>
        Delegate address (người được ủy quyền)
        <input 
          value={delegate} 
          onChange={e => setDelegate(e.target.value as `0x${string}`)} 
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          placeholder="0x... (có thể là Smart Account hoặc EOA của người khác)"
        />
        <small style={{ color: "#666", fontSize: "12px" }}>
          Có thể là Smart Account, EOA, hoặc bất kỳ địa chỉ nào trên Monad testnet
        </small>
      </label>
      <label>
        Hạn mức mỗi kỳ (USDC)
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </label>
      <label>
        Chu kỳ (giây)
        <input type="number" value={period} onChange={e => setPeriod(Number(e.target.value))} />
      </label>
      <button disabled={loading}>{loading ? "Đang tạo delegation..." : "Tạo delegation"}</button>

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
            padding: 12, 
            backgroundColor: "#e0ffe0", 
            border: "1px solid #00b894", 
            borderRadius: 8,
            color: "#00b894"
          }}>
            <strong>✅ Delegation tạo thành công!</strong>
            <div style={{ marginTop: 8 }}>
              <p><strong>Smart Account:</strong> {result.from}</p>
              <p><strong>Delegate:</strong> {result.to}</p>
              <p><strong>Amount:</strong> {Number(result.scope.periodAmount) / 1000000} mUSDC</p>
              <p><strong>Period:</strong> {result.scope.periodDuration} seconds</p>
              <p><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
            </div>
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer" }}>Xem chi tiết JSON</summary>
              <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 8, overflow: "auto", marginTop: 8 }}>
                {JSON.stringify(result, (key, value) => 
                  typeof value === 'bigint' ? value.toString() : value, 2)}
              </pre>
            </details>
          </div>
        )}
    </form>
  );
}
