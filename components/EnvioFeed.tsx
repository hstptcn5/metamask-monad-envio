"use client";

import { useEffect, useState } from "react";
import { queryDelegations } from "@/lib/envio";

export default function EnvioFeed({ address }: { address: `0x${string}` }) {
  const [data, setData] = useState<{ delegations: any[]; redemptions: any[] }>({ delegations: [], redemptions: [] });

  useEffect(() => {
    let stop = false;

    async function load() {
      try {
        const res = await queryDelegations(address);
        if (!stop) setData(res);
      } catch (e) {
        console.error(e);
      }
    }

    load();
    const id = setInterval(load, 5_000); // polling nhẹ 5s
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [address]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h3>Delegations</h3>
        {data.delegations.length === 0 && <p>Chưa có delegation nào.</p>}
        {data.delegations.map((d) => (
          <div key={d.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div>Delegate: {d.delegate}</div>
            <div>Token: {d.token}</div>
            <div>Period Amount: {d.periodAmount}</div>
            <div>Remaining: {d.remaining}</div>
            <div>Last Redeemed: {d.lastRedeemedAt}</div>
          </div>
        ))}
      </section>

      <section>
        <h3>Redemptions</h3>
        {data.redemptions.length === 0 && <p>Chưa có giao dịch redeem.</p>}
        {data.redemptions.map((r) => (
          <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div>Delegate: {r.delegate}</div>
            <div>To: {r.to}</div>
            <div>Amount: {r.amount}</div>
            <div>Tx: {r.txHash}</div>
            <div>Time: {r.timestamp}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

