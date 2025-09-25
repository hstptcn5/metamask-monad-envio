"use client";

import { useState } from "react";
import { getMetaMaskSmartAccount } from "@/lib/smartAccount";
import { switchToMonadNetwork } from "@/lib/network";

export default function DelegationTester() {
  const [delegatorAddress, setDelegatorAddress] = useState<`0x${string}`>("0x1bd5aCb8069DA1051911eB80A37723aA1ce5919C");
  const [delegateAddress, setDelegateAddress] = useState<`0x${string}`>("0xa51DbFfE49FA6Fe3fC873094e47184aE624cd76f");
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Chuyển sang Monad Testnet
      await switchToMonadNetwork();

      // Lấy Smart Account của ví B (delegate)
      const delegateSmartAccount = await getMetaMaskSmartAccount();
      
      // Kiểm tra xem địa chỉ hiện tại có phải là delegate không
      if (delegateSmartAccount.address.toLowerCase() !== delegateAddress.toLowerCase()) {
        throw new Error(`Địa chỉ hiện tại (${delegateSmartAccount.address}) không khớp với delegate address (${delegateAddress})`);
      }

      // Test delegation thực tế từ localStorage
      const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]');
      
      console.log('Existing delegations:', existingDelegations);
      console.log('Looking for:', { delegatorAddress, delegateAddress });
      
      // Tìm delegation phù hợp
      const delegation = existingDelegations.find((d: any) => {
        console.log('Checking delegation:', {
          delegator: d.delegator,
          delegate: d.delegate,
          from: d.from,
          to: d.to,
          status: d.status
        });
        return (d.delegator || d.from)?.toLowerCase() === delegatorAddress.toLowerCase() &&
               (d.delegate || d.to)?.toLowerCase() === delegateAddress.toLowerCase() &&
               d.status === "ACTIVE";
      });

      if (!delegation) {
        throw new Error("Không tìm thấy delegation phù hợp. Hãy tạo delegation trước.");
      }

      // Kiểm tra delegation với cấu trúc mới từ MetaMask Toolkit
      const now = Math.floor(Date.now() / 1000);
      const createdAt = Math.floor(new Date(delegation.createdAt).getTime() / 1000);
      const elapsed = now - createdAt;
      
      // Lấy thông tin từ scope hoặc caveats
      let periodDuration = 3600; // 1 hour default
      let availableAmount = 1000; // 1000 mUSDC default
      
      if (delegation.scope) {
        // Sử dụng scope nếu có
        periodDuration = delegation.scope.periodDuration || 3600;
        availableAmount = Number(delegation.scope.periodAmount) / 1000000 || 1000;
      } else if (delegation.caveats && delegation.caveats.length > 0) {
        // Sử dụng caveats nếu có
        const caveat = delegation.caveats[0];
        periodDuration = caveat.periodDuration || 3600;
        availableAmount = Number(caveat.periodAmount) / 1000000 || 1000;
      }
      
      const periodRemaining = Math.max(0, periodDuration - elapsed);

      const testResult = {
        delegator: delegatorAddress,
        delegate: delegateAddress,
        requestedAmount: amount,
        availableAmount: availableAmount,
        periodRemaining: periodRemaining,
        canWithdraw: amount <= availableAmount && periodRemaining > 0,
        testStatus: amount <= availableAmount && periodRemaining > 0 ? "SUCCESS" : "FAILED",
        message: amount <= availableAmount && periodRemaining > 0 
          ? `Ví B có thể rút ${amount} mUSDC từ ví A`
          : `Không thể rút: ${amount > availableAmount ? 'Vượt quá amount' : 'Hết thời gian'}`,
        timestamp: new Date().toISOString(),
        signature: delegation.signature ? "✅ Signed" : "❌ Not signed"
      };

      setResult(testResult);
    } catch (err: any) {
      console.error("Delegation test error:", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>🧪 Test Delegation Usage (REAL)</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Kiểm tra delegation thực tế từ localStorage
      </p>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label>
            Delegator Address (Ví A - người ủy quyền)
            <input 
              value={delegatorAddress} 
              onChange={e => setDelegatorAddress(e.target.value as `0x${string}`)} 
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              placeholder="0x..."
            />
          </label>
        </div>

        <div>
          <label>
            Delegate Address (Ví B - người được ủy quyền)
            <input 
              value={delegateAddress} 
              onChange={e => setDelegateAddress(e.target.value as `0x${string}`)} 
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              placeholder="0x..."
            />
          </label>
        </div>

        <div>
          <label>
            Amount to Test (mUSDC)
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))} 
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              min="1"
            />
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: 12, 
            backgroundColor: loading ? "#ccc" : "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Testing..." : "Test Delegation Usage"}
        </button>
      </form>

      {error && (
        <div style={{ 
          padding: 12, 
          backgroundColor: "#ffe6e6", 
          border: "1px solid #ff6b6b", 
          borderRadius: 8,
          color: "#d63031",
          marginTop: 16
        }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: 12, 
          backgroundColor: result.canWithdraw ? "#e0ffe0" : "#fff3cd", 
          border: `1px solid ${result.canWithdraw ? "#00b894" : "#ffc107"}`, 
          borderRadius: 8,
          color: result.canWithdraw ? "#00b894" : "#856404",
          marginTop: 16
        }}>
          <strong>
            {result.canWithdraw ? "✅" : "⚠️"} Test Result: {result.testStatus}
          </strong>
          <div style={{ marginTop: 8 }}>
            <p><strong>Delegator:</strong> {result.delegator}</p>
            <p><strong>Delegate:</strong> {result.delegate}</p>
            <p><strong>Requested Amount:</strong> {result.requestedAmount} mUSDC</p>
            <p><strong>Available Amount:</strong> {result.availableAmount} mUSDC</p>
            <p><strong>Can Withdraw:</strong> {result.canWithdraw ? "Yes" : "No"}</p>
            <p><strong>Period Remaining:</strong> {result.periodRemaining} seconds</p>
            <p><strong>Message:</strong> {result.message}</p>
            <p><strong>Tested At:</strong> {new Date(result.timestamp).toLocaleString()}</p>
          </div>
          
          {result.canWithdraw && (
            <div style={{ marginTop: 12, padding: 8, backgroundColor: "#f8f9fa", borderRadius: 4 }}>
              <strong>🎉 Success!</strong> Ví B có thể sử dụng token từ ví A.
              <br />
              <small>Trong thực tế, ví B sẽ gọi contract để rút token từ ví A.</small>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
        <h4>📋 Hướng dẫn Test:</h4>
        <ol>
          <li><strong>Kết nối ví B:</strong> MetaMask phải kết nối với địa chỉ delegate</li>
          <li><strong>Nhập thông tin:</strong> Delegator và delegate addresses</li>
          <li><strong>Chọn amount:</strong> Số lượng muốn test rút</li>
          <li><strong>Click Test:</strong> Kiểm tra quyền sử dụng</li>
        </ol>
        
        <h4>🔍 Kết quả mong đợi:</h4>
        <ul>
          <li><strong>Success:</strong> Ví B có thể rút token từ ví A</li>
          <li><strong>Failed:</strong> Ví B không có quyền hoặc amount vượt quá giới hạn</li>
        </ul>
      </div>
    </div>
  );
}
