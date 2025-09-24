import DelegationForm from "@/components/DelegationForm";

export default function SubscriptionPage() {
  return (
    <div>
      <h2>Tạo Subscription (Delegation)</h2>
      <p>Ủy quyền cho app/bạn bè quyền trích USDC theo chu kỳ.</p>
      <DelegationForm />
    </div>
  );
}

