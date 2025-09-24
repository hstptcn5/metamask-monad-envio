"use client";

import { useState } from "react";
import { createDelegationWrapper, toUsdc, DEFAULT_USDC } from "@/lib/delegation";

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
      // Validate delegate address
      if (!delegate || delegate.length !== 42 || !delegate.startsWith('0x')) {
        throw new Error("Delegate address không hợp lệ. Vui lòng nhập địa chỉ 42 ký tự bắt đầu bằng 0x");
      }

      const out = await createDelegationWrapper({
        delegate,
        scope: {
          type: "erc20PeriodTransfer",
          tokenAddress: DEFAULT_USDC,
          periodAmount: toUsdc(amount),
          periodDuration: period,
          startDate: Math.floor(Date.now() / 1000)
        }
      });
      setResult(out);
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
        Delegate address
        <input value={delegate} onChange={e => setDelegate(e.target.value as `0x${string}`)} style={{ width: "100%" }} />
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
          <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 8, overflow: "auto", marginTop: 8 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </form>
  );
}
