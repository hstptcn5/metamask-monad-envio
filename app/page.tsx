export default function Home() {
  return (
    <div>
      <p>Demo: Smart Accounts + Delegation + Gasless trên Monad testnet. Envio hiển thị realtime.</p>
      <ul>
        <li>1) <strong>Kết nối MetaMask</strong> - Tự động tạo Smart Account</li>
        <li>2) <strong>Transfer mUSDC</strong> - Từ EOA sang Smart Account</li>
        <li>3) Tạo delegation subscription (USDC/tuần)</li>
        <li>4) Delegate redeem (thanh toán gasless)</li>
        <li>5) Envio dashboard xem lịch sử & hạn mức</li>
        <li>6) <strong>Balance Checker</strong> - Kiểm tra balance mUSDC của bất kỳ địa chỉ nào</li>
      </ul>
      
      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#e8f5e8", borderRadius: 8 }}>
        <h4>✅ Luồng hoạt động hoàn chỉnh</h4>
        <p>1. Vào <a href="/subscription">Tạo Subscription</a> → Kết nối MetaMask → Tự động tạo Smart Account</p>
        <p>2. Transfer mUSDC từ EOA sang Smart Account (có form tích hợp)</p>
        <p>3. Tạo delegation từ Smart Account</p>
        <p>4. Vào <a href="/test-delegation">Test Delegation</a> → Kiểm tra quyền sử dụng</p>
        <p>5. Vào <a href="/withdraw-delegation">Withdraw Delegation</a> → Ví B rút token từ ví A</p>
        <p><strong>Không cần upgrade EOA!</strong> Chỉ cần transfer token.</p>
      </div>
      
      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#e3f2fd", borderRadius: 8 }}>
        <h4>🔍 Balance Checker</h4>
        <p>Vào <a href="/balance-checker">Balance Checker</a> để kiểm tra balance mUSDC của deployer và các địa chỉ khác.</p>
        <p><strong>Token address:</strong> <code>0x3A13C20987Ac0e6840d9CB6e917085F72D17E698</code></p>
      </div>
    </div>
  );
}

