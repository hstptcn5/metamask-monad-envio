"use client";

import { useState } from "react";
import { createDelegationWrapper, toUsdc, DEFAULT_USDC } from "@/lib/delegation";

export default function DelegationForm() {
  const [delegate, setDelegate] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000");
  const [amount, setAmount] = useState(10);
  const [period, setPeriod] = useState(604800); // 1 tuần
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
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
      alert(err.message ?? String(err));
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

      {result && (
        <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 8, overflow: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}
