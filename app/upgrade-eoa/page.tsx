import EIP7702Upgrade from "@/components/EIP7702Upgrade";
import SimpleSmartAccount from "@/components/SimpleSmartAccount";
import TransferUSDC from "@/components/TransferUSDC";

export default function UpgradeEOAPage() {
  return (
    <div>
      <h2>🎯 Smart Account Setup</h2>
      <p>Chọn cách tạo Smart Account để sử dụng delegation features.</p>
      
      <div style={{ marginBottom: 20, padding: 16, backgroundColor: "#e3f2fd", borderRadius: 8 }}>
        <h4>💡 Khuyến nghị: Tạo Smart Account mới (Đơn giản)</h4>
        <p>Thay vì upgrade EOA, hãy tạo Smart Account mới và transfer mUSDC sang đó.</p>
      </div>
      
      <SimpleSmartAccount />
      
      <TransferUSDC />
      
      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#fff3cd", borderRadius: 8 }}>
        <h4>⚠️ Advanced: Upgrade EOA (EIP-7702)</h4>
        <p>Chỉ dùng nếu bạn muốn giữ nguyên địa chỉ EOA. Có thể gặp lỗi với MetaMask.</p>
      </div>
      
      <EIP7702Upgrade />
      
      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
        <h4>📋 Hướng dẫn chi tiết:</h4>
        <ol>
          <li><strong>Kết nối MetaMask</strong> với EOA đã deploy token</li>
          <li><strong>Click "Upgrade EOA → Smart Account"</strong></li>
          <li><strong>Sign authorization</strong> trong MetaMask popup</li>
          <li><strong>Confirm transaction</strong> để submit EIP-7702</li>
          <li><strong>EOA sẽ trở thành Smart Account</strong> với cùng địa chỉ</li>
          <li><strong>Quay lại trang Subscription</strong> để tạo delegation</li>
        </ol>
        
        <h4>⚠️ Lưu ý quan trọng:</h4>
        <ul>
          <li>EOA và Smart Account có <strong>cùng địa chỉ</strong></li>
          <li>Balance mUSDC sẽ được <strong>giữ nguyên</strong></li>
          <li>Sau upgrade, có thể tạo <strong>delegation</strong></li>
          <li>Chỉ cần upgrade <strong>1 lần duy nhất</strong></li>
        </ul>
      </div>
    </div>
  );
}
