import BalanceChecker from "@/components/BalanceChecker";

export default function BalanceCheckerPage() {
  return (
    <div>
      <h2>🔍 Balance Checker</h2>
      <p>Kiểm tra balance mUSDC của bất kỳ địa chỉ nào trên Monad testnet</p>
      
      <BalanceChecker />
      
      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
        <h4>📋 Hướng dẫn sử dụng:</h4>
        <ul>
          <li><strong>Địa chỉ deployer:</strong> Địa chỉ đã deploy token (có 1,000,000 mUSDC)</li>
          <li><strong>Địa chỉ khác:</strong> Sẽ hiển thị balance = 0 (chưa được mint)</li>
          <li><strong>Token address:</strong> 0x3A13C20987Ac0e6840d9CB6e917085F72D17E698</li>
        </ul>
      </div>
    </div>
  );
}
