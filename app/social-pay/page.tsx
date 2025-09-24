"use client";

import { useState } from "react";
import { DEFAULT_USDC, redeemDelegation, toUsdc } from "@/lib/delegation";

export default function SocialPayPage() {
  const [to, setTo] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000");
  const [amount, setAmount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // NOTE: Trong thực tế bạn phải truyền "signedDelegation" tương ứng tip-flow.
  // Trong MVP này, ta mock để kiểm tra UI.
  const mockSignedDelegation = { id: "demo", signature: "0x" + "22".repeat(65) };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTxHash(null);
    try {
      const res = await redeemDelegation({
        signedDelegation: mockSignedDelegation,
        amount: toUsdc(amount),
        to,
        token: DEFAULT_USDC
      });
      setTxHash(res.txHash);
    } catch (e: any) {
      alert(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Social Tip</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label>
          Gửi cho (address)
          <input value={to} onChange={e => setTo(e.target.value as `0x${string}`)} style={{ width: "100%" }} />
        </label>
        <label>
          Số USDC
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        </label>
        <button disabled={loading}>{loading ? "Đang redeem..." : "Redeem (gasless)"}</button>
      </form>
      {txHash && <p>Đã gửi: <code>{txHash}</code></p>}
    </div>
  );
}

