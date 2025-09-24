import DelegationForm from "@/components/DelegationForm";
import MetaMaskConnect from "@/components/MetaMaskConnect";
import DelegateExamples from "@/components/DelegateExamples";

export default function SubscriptionPage() {
  return (
    <div>
      <h2>Tạo Subscription (Delegation)</h2>
      <p>Ủy quyền cho app/bạn bè quyền trích mUSDC theo chu kỳ.</p>
      
      <div style={{ marginBottom: 20, padding: 16, backgroundColor: "#e8f5e8", borderRadius: 8 }}>
        <h4>💡 Hướng dẫn:</h4>
        <ul>
          <li><strong>Delegation</strong> sử dụng <strong>Smart Account</strong> để tạo ủy quyền</li>
          <li><strong>Social Tip</strong> sử dụng <strong>EOA</strong> để gửi mUSDC trực tiếp</li>
          <li>Kết nối MetaMask → Tự động tạo Smart Account</li>
          <li>Transfer mUSDC từ EOA sang Smart Account</li>
          <li>Tạo delegation từ Smart Account</li>
        </ul>
      </div>

      <div style={{ marginBottom: 20, padding: 16, backgroundColor: "#f0f8ff", borderRadius: 8 }}>
        <h4>🎯 Delegation là gì?</h4>
        <p><strong>Delegation</strong> = Ủy quyền cho <strong>người khác</strong> sử dụng mUSDC của bạn theo chu kỳ.</p>
        
        <h5>Ví dụ thực tế:</h5>
        <ul>
          <li><strong>Bạn</strong> (Smart Account) → Ủy quyền cho <strong>app/game</strong> (Smart Account khác)</li>
          <li><strong>Bạn</strong> (Smart Account) → Ủy quyền cho <strong>bạn bè</strong> (EOA)</li>
          <li><strong>Bạn</strong> (Smart Account) → Ủy quyền cho <strong>contract</strong> (địa chỉ hợp đồng)</li>
        </ul>
        
        <p><strong>Delegate có thể là:</strong> Smart Account, EOA, hoặc bất kỳ địa chỉ nào!</p>
      </div>
      
      <MetaMaskConnect />
      
      <DelegateExamples />
      
      <DelegationForm />
    </div>
  );
}

