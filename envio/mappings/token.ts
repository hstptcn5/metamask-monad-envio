import { Db, LogEvent } from "@envio/runtime";

export async function handleTransfer(db: Db, ev: LogEvent) {
  const id = `${ev.transactionHash}-${ev.logIndex}`;
  const from = ev.args?.from as string;
  const to = ev.args?.to as string;
  const value = BigInt(ev.args?.value?.toString() || "0");
  const token = ev.address;
  const ts = BigInt(ev.blockTimestamp);

  await db.Transfer.set(id, {
    id, from, to, value, token, timestamp: ts
  });
}

