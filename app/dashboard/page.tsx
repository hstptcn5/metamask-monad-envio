import EnvioFeed from "@/components/EnvioFeed";

export default function Dashboard() {
  // Với demo dev, dùng address signer (getDevSmartAccount) — thực tế thay bằng SA address
  const demoAddress = "0x0000000000000000000000000000000000000000" as `0x${string}`;

  return (
    <div>
      <h2>Dashboard (Envio)</h2>
      <p>Realtime delegations & redemptions.</p>
      <EnvioFeed address={demoAddress} />
    </div>
  );
}

